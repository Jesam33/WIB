"use client";
import { useState, useEffect } from "react";
import { useRouter } from 'next/router';
import { usePathname } from 'next/navigation';
import Link from "next/link";
import {
  BarChart3,
  Users,
  CreditCard,
  Wallet,
  ArrowUpDown,
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  MessageCircle,
} from "lucide-react";
import axios from "axios";



const PropeneerLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [propeneer, setPropeneer] = useState({});
  const [loading, setLoading] = useState(true);

  const getAuthToken = () => {
    return localStorage.getItem("adminToken");
  };

  const currentPath = usePathname();
  
const isActive = (path) => currentPath === path;
// className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary-700 bg-primary-100 border-l-4 border-primary-600 hover:bg-primary-100"
const linkClass = (path) =>
  `flex items-center gap-3 px-4 py-3 text-sm font-medium text-primary-700 hover:bg-primary-100 ${
    isActive(path)
      ? "text-primary-700 bg-primary-100 border-l-4 border-primary-600"
      : "text-gray-600 hover:bg-primary-100"
  }`;


  const getPropeneer = async () => {
    try {
      const token = getAuthToken();
      if (!token) return;

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_NAME}propeneer`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setPropeneer(res.data.user);
    } catch (error) {
      console.error("Error fetching propeneer:", error);
    }
  };

  useEffect(() => {
    getPropeneer();

    // Close sidebar when screen size increases
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getInitials = (username) => {
    const initial = username ? username.charAt(0) : "";
    return `${initial}`.toUpperCase();
  };

  const initials = getInitials(propeneer.username);

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:static top-0 left-0 h-full z-50 w-72 lg:w-64 bg-white border-r border-gray-200 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        } transition-transform duration-300 ease-in-out overflow-y-auto`}
      >
        
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-primary-700">
            Western Intercontinental{" "}
            <span className="text-primary-500">Bank</span>
          </h1>
          <p className="text-xs text-gray-500 mt-1">Online Banking</p>
    
          <button className="lg:hidden" onClick={() => setSidebarOpen(false)}>
            <X size={24} className="text-gray-500" />
          </button>
        </div>
        <p className="text-xs text-gray-500 px-6 pt-2">Administration Portal</p>

        <div className="p-4">
          <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-100">
            <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center text-white font-bold">
              {initials}
            </div>
            <div>
              <p className="font-medium text-sm">{propeneer.username} </p>
              <p className="text-xs text-gray-500">Admin Access</p>
            </div>
          </div>
        </div>

        <nav className="mt-6">
          <div className="px-4 mb-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Main Menu
            </p>
          </div>
          <Link
            href="/admin-dashboard"
            className={linkClass("/admin-dashboard")}
          >
            <BarChart3 size={18} />
            <span>Dashboard</span>
          </Link>
          <Link
            href="/admin-users"
            className={linkClass("/admin-users")}
          >
            <Users size={18} />
            <span>Users</span>
          </Link>
          <Link
            href="/admin-transactions"
            className={linkClass("/admin-transactions")}
          >
            <ArrowUpDown size={18} />
            <span>Transactions</span>
          </Link>
          <Link
            href="/admin-messages"
            className={linkClass("/admin-messages")}
          >
            <MessageCircle size={18} />
            <span>Messages</span>
          </Link>

          <div className="px-4 mt-6 mb-2">
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
              Administration
            </p>
          </div>
          <Link
            href="/admin-dasboard"
            className={linkClass("/propeneer-dashboard")}
          >
            <Wallet size={18} />
            <span>Banking Settings</span>
          </Link>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4">
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                className="lg:hidden p-1 rounded-md border border-gray-200"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu size={24} className="text-gray-700" />
              </button>
              <h2 className="text-lg sm:text-xl font-semibold text-gray-800 truncate">
                Admin Dashboard
              </h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-6">
              <button className="relative">
                <Bell size={20} className="text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center"></span>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white font-medium">
                  {initials}
                </div>
                <span className="text-sm font-medium hidden sm:inline">
                  Admin
                </span>
                <ChevronDown size={16} className="text-gray-400" />
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};

export default PropeneerLayout;
