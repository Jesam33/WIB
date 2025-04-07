"use client";
import React, { useState, useEffect, useRef } from "react";
import {
  MessageCircle,
  Send,
  Users,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  CheckCircle,
  Clock,
} from "lucide-react";
import axios from "axios";
import io from "socket.io-client";
import PropeneerLayout from "../../components/layout/PropeneerLayout";

const PropeneerChatDashboard = () => {
  // State management
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // 'disconnected', 'connecting', 'connected'
  const [loadingThreads, setLoadingThreads] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [mobileThreadsOpen, setMobileThreadsOpen] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Refs
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const refreshIntervalRef = useRef(null);

  // Filter threads based on search term
  const filteredThreads = threads.filter(
    (thread) =>
      thread.user?.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.user?.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      thread.lastMessage?.content
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
  );

  // Fetch all threads
  const fetchThreads = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_NAME}chat/propeneer/threads`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setThreads(response.data);
      if (!selectedThread && response.data.length > 0) {
        setSelectedThread(response.data[0]);
      }
    } catch (error) {
      console.error("Error fetching threads:", error);
    } finally {
      setLoadingThreads(false);
    }
  };

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER, {
      auth: { token, role: "propeneer" },
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    const onConnect = () => {
      setConnectionStatus("connected");
      fetchThreads(); // Refresh threads on connect
    };

    const onDisconnect = () => {
      setConnectionStatus("disconnected");
    };

    const onConnecting = () => {
      setConnectionStatus("connecting");
    };

    const onMessage = (message) => {
      // Add to current chat if matching thread
      if (selectedThread && message.threadId === selectedThread._id) {
        setMessages((prev) => [...prev, message]);
      }

      // Update thread list
      setThreads((prev) =>
        prev.map((thread) =>
          thread._id === message.threadId
            ? {
                ...thread,
                lastMessage: message,
                unreadCount:
                  message.senderModel === "User"
                    ? (thread.unreadCount || 0) + 1
                    : 0,
              }
            : thread
        )
      );
    };

    const onTyping = (data) => {
      if (data.threadId === selectedThread?._id) {
        setIsTyping(true);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => setIsTyping(false), 2000);
      }
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("connecting", onConnecting);
    socket.on("chat-message", onMessage);
    socket.on("user-typing", onTyping);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("connecting", onConnecting);
      socket.off("chat-message", onMessage);
      socket.off("user-typing", onTyping);
      socket.disconnect();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [selectedThread]);

  // Set up periodic thread refresh
  useEffect(() => {
    if (connectionStatus === "connected") {
      refreshIntervalRef.current = setInterval(fetchThreads, 30000);
    }
    return () => {
      if (refreshIntervalRef.current) {
        clearInterval(refreshIntervalRef.current);
      }
    };
  }, [connectionStatus]);

  // Load messages when thread is selected
  useEffect(() => {
    if (!selectedThread) return;

    const loadMessages = async () => {
      try {
        setLoadingMessages(true);
        const token = localStorage.getItem("adminToken");

        const [messagesRes, markReadRes] = await Promise.all([
          axios.get(
            `${process.env.NEXT_PUBLIC_SERVER_NAME}chat/thread/${selectedThread._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          ),
          axios.put(
            `${process.env.NEXT_PUBLIC_SERVER_NAME}chat/thread/${selectedThread._id}/mark-read`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);

        setMessages(messagesRes.data);
        setThreads((prev) =>
          prev.map((thread) =>
            thread._id === selectedThread._id
              ? { ...thread, unreadCount: 0 }
              : thread
          )
        );
      } catch (error) {
        console.error("Error loading messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    loadMessages();
  }, [selectedThread]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a new message
  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedThread) return;

    const optimisticId = Date.now().toString();
    const optimisticMessage = {
      _id: optimisticId,
      sender: "propeneer",
      senderModel: "Propeneer",
      content: newMessage,
      timestamp: new Date(),
      read: false,
      threadId: selectedThread._id,
    };

    // Optimistic update
    setMessages((prev) => [...prev, optimisticMessage]);
    setNewMessage("");

    try {
      const token = localStorage.getItem("adminToken"); // Regular token, not adminToken
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_NAME}chat/propeneer/reply/${selectedThread._id}`,
        {
          content: newMessage,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Replace optimistic message with server response
      setMessages((prev) => [
        ...prev.filter((m) => m._id !== optimisticId),
        response.data,
      ]);

      // Emit via socket if connected
      if (socketRef.current?.connected) {
        socketRef.current.emit("send-message", response.data);
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove optimistic message on error
      setMessages((prev) => prev.filter((m) => m._id !== optimisticId));
    }
  };

  // Handle typing indicator
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
    if (socketRef.current?.connected && selectedThread) {
      socketRef.current.emit("typing", {
        threadId: selectedThread._id,
        isTyping: e.target.value.length > 0,
      });
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <PropeneerLayout>

    <div className="flex h-screen bg-gray-50">
      {/* Threads sidebar */}
      <div
        className={`${
          mobileThreadsOpen ? "block" : "hidden"
        } md:block w-full md:w-80 bg-white border-r border-gray-200`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Users className="mr-2 text-primary-600" size={20} />
            Customer Threads
          </h2>
          <button
            onClick={() => setMobileThreadsOpen(false)}
            className="md:hidden text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Search bar */}
        <div className="p-4 border-b">
          <input
            type="text"
            placeholder="Search threads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {loadingThreads ? (
          <div className="flex justify-center items-center h-3/4">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : filteredThreads.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            {searchTerm ? "No matching threads" : "No active threads"}
          </div>
        ) : (
          <div className="overflow-y-auto h-[calc(100vh-130px)]">
            {filteredThreads.map((thread) => (
              <div
                key={thread._id}
                onClick={() => {
                  setSelectedThread(thread);
                  setMobileThreadsOpen(false);
                }}
                className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                  selectedThread?._id === thread._id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900 truncate">
                      {thread.user?.firstName} {thread.user?.lastName}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {thread.lastMessage?.content}
                    </p>
                  </div>
                  <div className="flex flex-col items-end ml-2">
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatDate(thread.lastMessage?.timestamp)}
                    </span>
                    <span className="text-xs text-gray-400 whitespace-nowrap">
                      {formatTime(thread.lastMessage?.timestamp)}
                    </span>
                    {thread.unreadCount > 0 && (
                      <span className="mt-1 bg-primary-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Main chat area */}
      <div
        className={`${
          !mobileThreadsOpen ? "block" : "hidden"
        } md:block flex-1 flex flex-col`}
      >
        {selectedThread ? (
          <>
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
              <div className="flex items-center">
                <button
                  onClick={() => setMobileThreadsOpen(true)}
                  className="mr-2 md:hidden text-gray-500 hover:text-gray-700"
                >
                  <ChevronRight size={20} />
                </button>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {selectedThread.user?.firstName}{" "}
                    {selectedThread.user?.lastName}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {selectedThread.user?.email}
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center">
                  <span
                    className={`h-2 w-2 rounded-full mr-2 ${
                      connectionStatus === "connected"
                        ? "bg-green-500"
                        : connectionStatus === "connecting"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    }`}
                  />
                  <span className="text-xs text-gray-500">
                    {connectionStatus === "connected"
                      ? "Online"
                      : connectionStatus === "connecting"
                      ? "Connecting..."
                      : "Offline"}
                  </span>
                </div>
                {isTyping && (
                  <div className="text-xs text-gray-500 flex items-center">
                    <span className="animate-pulse">Typing...</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
              {loadingMessages ? (
                <div className="flex justify-center items-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                  <MessageCircle size={48} className="mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium">No messages yet</h3>
                  <p className="text-sm">Start the conversation</p>
                </div>
              ) : (
                messages.map((message) => (
                  <div
                    key={message._id}
                    className={`flex mb-4 ${
                      message.senderModel === "Propeneer"
                        ? "justify-end"
                        : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                        message.senderModel === "Propeneer"
                          ? "bg-primary-600 text-white"
                          : "bg-white border border-gray-200 text-gray-800"
                      }`}
                    >
                      <p>{message.content}</p>
                      <div className="flex items-center justify-end mt-1 space-x-2">
                        <p
                          className={`text-xs ${
                            message.senderModel === "Propeneer"
                              ? "text-primary-100"
                              : "text-gray-500"
                          }`}
                        >
                          {formatTime(message.timestamp)}
                        </p>
                        {message.senderModel === "Propeneer" && (
                          <span className="text-xs">
                            {message.read ? (
                              <CheckCircle
                                size={12}
                                className="text-blue-300"
                              />
                            ) : (
                              <Clock size={12} className="text-gray-300" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 border-t border-gray-200 bg-white">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Type your message..."
                  className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  disabled={connectionStatus !== "connected"}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={
                    !newMessage.trim() || connectionStatus !== "connected"
                  }
                  className="p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageCircle size={48} className="mb-4 text-gray-300" />
            <h3 className="text-lg font-medium">Select a thread</h3>
            <p className="text-sm">Choose a conversation from the sidebar</p>
            <button
              onClick={() => setMobileThreadsOpen(true)}
              className="mt-4 md:hidden flex items-center text-primary-600"
            >
              <ChevronRight className="mr-1" size={16} />
              Show threads
            </button>
          </div>
        )}
      </div>
    </div>
    </PropeneerLayout>
  );
};

export default PropeneerChatDashboard;
