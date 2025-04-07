"use client";
import React, { useState, useEffect, useRef } from "react";
import { MessageCircle, X, Send, HelpCircle } from "lucide-react";
import io from "socket.io-client";
import axios from "axios";

const CustomerCareModal = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [connectionStatus, setConnectionStatus] = useState("disconnected"); // 'disconnected', 'connecting', 'connected', 'error'
  const [user, setUser] = useState(null);
  const [currentThread, setCurrentThread] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const retryTimeoutRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, []);

  // Initialize when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const initializeChat = async () => {
      try {
        // 1. Get user data
        const token = localStorage.getItem("token");
        if (!token) throw new Error("No authentication token");

        const userRes = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_NAME}user`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setUser(userRes.data.user);

        // 2. Setup socket connection
        setupSocketConnection(userRes.data.user._id, token);

        // 3. Load or create thread
        await loadOrCreateThread(userRes.data.user._id, token);
      } catch (error) {
        console.error("Initialization error:", error);
        setConnectionStatus("error");
      }
    };

    initializeChat();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isOpen]);

  const setupSocketConnection = (userId, token) => {
    setConnectionStatus("connecting");

    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER, {
      auth: { token, userId, role: "user" },
      reconnectionAttempts: 3,
      reconnectionDelay: 1000,
      timeout: 5000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setConnectionStatus("connected");
      console.log("Socket connected");
    });

    socket.on("disconnect", () => {
      setConnectionStatus("disconnected");
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err);
      setConnectionStatus("error");
      attemptReconnect(userId, token);
    });

    socket.on("chat-message", (message) => {
      if (message.threadId === currentThread?._id) {
        setMessages((prev) => [...prev, message]);
      }
    });
  };

  const attemptReconnect = (userId, token) => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
    }

    retryTimeoutRef.current = setTimeout(() => {
      if (connectionStatus !== "connected" && isOpen) {
        console.log("Attempting to reconnect...");
        setupSocketConnection(userId, token);
      }
    }, 3000);
  };

  const loadOrCreateThread = async (userId, token) => {
    try {
      // Try to load existing threads first
      const threadsRes = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_NAME}chat/user/${userId}/threads`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (threadsRes.data.length > 0) {
        const thread = threadsRes.data[0];
        setCurrentThread(thread);
        await loadThreadMessages(thread._id, token);
        return;
      }

      // Create new thread if none exists
      const newThreadRes = await axios.post(
        `${process.env.NEXT_PUBLIC_SERVER_NAME}chat/user/${userId}/thread`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCurrentThread(newThreadRes.data);
      setMessages([]);
    } catch (error) {
      console.error("Thread error:", error);
      // Fallback to client-side only thread
      setCurrentThread({
        _id: `temp-${userId}-${Date.now()}`,
        userId,
        createdAt: new Date(),
      });
      setMessages([]);
    }
  };

  const loadThreadMessages = async (threadId, token) => {
    try {
      const messagesRes = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_NAME}chat/thread/${threadId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(messagesRes.data);
    } catch (error) {
      console.error("Failed to load messages:", error);
      setMessages([]);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?._id || !currentThread) return;

    const message = {
      _id: Date.now().toString(),
      sender: user._id,
      senderModel: "User",
      content: newMessage,
      timestamp: new Date(),
      read: false,
      threadId: currentThread._id,
    };

    // Optimistic update
    setMessages((prev) => [...prev, message]);
    setNewMessage("");

    try {
      // Only send to server if not a temporary thread
      if (!currentThread._id.startsWith("temp-")) {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${process.env.NEXT_PUBLIC_SERVER_NAME}chat/user/${user._id}/send`,
          { content: newMessage, threadId: currentThread._id },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        // Update with server response
        setMessages((prev) => [
          ...prev.filter((m) => m._id !== message._id),
          response.data,
        ]);

        // Emit via socket if connected
        if (socketRef.current?.connected) {
          socketRef.current.emit("send-message", {
            ...response.data,
            receiver: "propeneers",
          });
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      // Revert optimistic update
      setMessages((prev) => prev.filter((m) => m._id !== message._id));
    }
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col h-[80vh]">
        <div className="flex items-center justify-between border-b p-4">
          <div className="flex items-center">
            <MessageCircle className="text-primary-600 mr-2" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">
              Live Support Chat
            </h2>
            <span
              className={`ml-2 text-xs px-2 py-1 rounded ${
                connectionStatus === "connected"
                  ? "bg-green-100 text-green-800"
                  : connectionStatus === "connecting"
                  ? "bg-yellow-100 text-yellow-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
              {connectionStatus === "connected"
                ? "Connected"
                : connectionStatus === "connecting"
                ? "Connecting..."
                : "Disconnected"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {connectionStatus === "error" ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="bg-red-100 text-red-800 p-4 rounded-lg max-w-md">
                <h3 className="font-medium">Connection Error</h3>
                <p className="mt-2 text-sm">
                  Could not connect to chat service. You can still send
                  messages, but they may not be received until connection is
                  restored.
                </p>
              </div>
            </div>
          ) : !currentThread ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <MessageCircle size={48} className="mb-4 text-gray-300" />
              <h3 className="text-lg font-medium">No messages yet</h3>
              <p className="text-sm">
                Start a conversation with our support team
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message._id}
                className={`flex ${
                  message.sender._id === user._id ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-xs md:max-w-md rounded-lg px-4 py-2 ${
                    message.sender._id === user._id
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  <p>{message.content}</p>
                  <div className="flex items-center justify-end mt-1 space-x-2">
                    <p
                      className={`text-xs ${
                        message.sender._id === user._id
                          ? "text-primary-100"
                          : "text-gray-500"
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    { message.sender._id === user._id && (
                      <span className="text-xs">
                        {message.read ? "✓✓" : "✓"}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
              placeholder="Type your message..."
              className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              disabled={!currentThread}
            />
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || !currentThread}
              className="p-2 rounded-full bg-primary-600 text-white hover:bg-primary-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const FloatingCustomerCareButton = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [user, setUser] = useState(null);
  const socketRef = useRef(null);

  // Fetch user data on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_SERVER_NAME}user`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setUser(response.data.user);
      } catch (error) {
        console.error("Error fetching user data:", error);
      }
    };

    fetchUserData();
  }, []);

  // Listen for new messages when chat is closed
  useEffect(() => {
    if (!user?._id) return;

    const socket = io(process.env.NEXT_PUBLIC_SOCKET_SERVER, {
      auth: {
        token: localStorage.getItem("token"),
        userId: user._id,
        role: "user",
      },
    });

    socketRef.current = socket;

    const handleNewMessage = (message) => {
      if (!isModalOpen && message.sender !== user._id) {
        setUnreadCount((prev) => prev + 1);
      }
    };

    socket.on("chat-message", handleNewMessage);

    return () => {
      socket.off("chat-message", handleNewMessage);
      socket.disconnect();
    };
  }, [user, isModalOpen]);

  const openModal = () => {
    setIsModalOpen(true);
    setUnreadCount(0);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={openModal}
          className="w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg flex items-center justify-center hover:bg-primary-700 transition-colors relative"
          aria-label="Customer Support"
        >
          <HelpCircle size={24} />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      <CustomerCareModal isOpen={isModalOpen} onClose={closeModal} />
    </>
  );
};

export { FloatingCustomerCareButton };
