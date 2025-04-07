"use client";
import { useState, useEffect } from "react";
import PropeneerLayout from "../../components/layout/PropeneerLayout";
import PropeneerTransferForm from "../../components/ui/TransferForm";
import TransactionTable from "../../components/ui/TransactionTable";
import {
  Download,
  Calendar,
  Filter,
  ChevronDown,
  Users,
  Wallet,
  BarChart3,
  CreditCard,
} from "lucide-react";
import axios from "axios";

export default function PropeneerDashboard() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [accountStats, setAccountStats] = useState({
    totalBalance: "€3,458,950",
    monthlyGrowth: "12.4%",
    pendingApprovals: 8,
  });
  const [userCount, setUserCount] = useState(0);

  const SERVER_NAME = process.env.NEXT_PUBLIC_SERVER_NAME;

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(`${SERVER_NAME}transactions/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(response.data.transactions);
    } catch (error) {
      toast.error("Failed to fetch transactions: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCount = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      if (!token) return;

      const res = await axios.get(
        `${process.env.NEXT_PUBLIC_SERVER_NAME}user/user-count`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setUserCount(res.data.count);
    } catch (error) {
      console.error("Error fetching user count:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchUserCount();
    const interval = setInterval(fetchTransactions, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <PropeneerLayout>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
        {/* User Count Card - Now shows real data */}
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <Users className="text-primary-600 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">
                Total Users
              </p>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900">
                {userCount}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <BarChart3 className="text-primary-600 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">
                Monthly Growth
              </p>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900">
                {accountStats.monthlyGrowth}
              </h3>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4 sm:p-6 shadow-sm">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary-100 flex items-center justify-center">
              <CreditCard className="text-primary-600 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-medium text-gray-500">
                Pending Approvals
              </p>
              <h3 className="text-lg sm:text-2xl font-bold text-gray-900">
                {accountStats.pendingApprovals}
              </h3>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer and Transactions Section */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-6">
        <div className="border-b border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Recent Transactions
            </h2>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <button
                onClick={() => setShowTransferModal(true)}
                className="px-3 sm:px-4 py-2 bg-primary-600 text-white rounded-md text-sm font-medium hover:bg-primary-700 transition-colors"
              >
                New Transfer
              </button>
              <button className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 border border-gray-200 rounded-md text-sm text-gray-700 hover:bg-gray-50">
                <Calendar size={16} className="hidden sm:inline" />
                <span>Filter</span>
                <ChevronDown size={16} />
              </button>
              <button className="p-2 border border-gray-200 rounded-md text-gray-700 hover:bg-gray-50">
                <Download size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
            </div>
          ) : (
            <div className="min-w-full">
              <TransactionTable transactions={transactions} />
            </div>
          )}
        </div>
      </div>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">
                  New Transfer
                </h3>
                <button
                  onClick={() => setShowTransferModal(false)}
                  className="text-gray-400 hover:text-gray-500 text-xl"
                >
                  &times;
                </button>
              </div>
            </div>
            <div className="p-4 sm:p-6">
              <PropeneerTransferForm
                setTransactions={setTransactions}
                onComplete={() => setShowTransferModal(false)}
              />
            </div>
          </div>
        </div>
      )}
    </PropeneerLayout>
  );
}
