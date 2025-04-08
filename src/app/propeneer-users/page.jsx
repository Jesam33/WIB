"use client";
import { useState, useEffect } from "react";
import PropeneerLayout from "../../components/layout/PropeneerLayout";
import {
  Users,
  Trash2,
  Edit,
  Plus,
  Search,
  ChevronDown,
  ChevronUp,
  X,
  Check,
} from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

export default function UsersDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    fatStatus: "",
    balance: 0,
  });
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: "ascending",
  });

  const SERVER_NAME = process.env.NEXT_PUBLIC_SERVER_NAME;

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(`${SERVER_NAME}user/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to fetch users: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = async (userId) => {
    if (!confirm("Are you sure you want to delete this user?")) return;

    try {
      const token = localStorage.getItem("adminToken");
      await axios.delete(`${SERVER_NAME}user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User deleted successfully");
      fetchUsers(); // Refreshing the list
    } catch (error) {
      toast.error("Failed to delete user: " + error.message);
    }
  };

  const startEditing = (user) => {
    setEditingUserId(user._id);
    setEditForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      fatStatus: user.fatStatus,
      balance: user.balance,
    });
  };

  const cancelEditing = () => {
    setEditingUserId(null);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const saveEdit = async (userId) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.patch(`${SERVER_NAME}user/${userId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User updated successfully");
      setEditingUserId(null);
      fetchUsers(); // Refresh the list
    } catch (error) {
      toast.error("Failed to update user: " + error.message);
    }
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (sortConfig.key) {
      if (a[sortConfig.key] < b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? -1 : 1;
      }
      if (a[sortConfig.key] > b[sortConfig.key]) {
        return sortConfig.direction === "ascending" ? 1 : -1;
      }
    }
    return 0;
  });

  const filteredUsers = sortedUsers.filter((user) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      user.firstName.toLowerCase().includes(searchTermLower) ||
      user.lastName.toLowerCase().includes(searchTermLower) ||
      user.email.toLowerCase().includes(searchTermLower) ||
      user.accountNumber?.toLowerCase().includes(searchTermLower)
    );
  });

  return (
    <PropeneerLayout>
      <div className="p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-primary-600 flex items-center gap-2">
            <Users size={24} className="text-primary-600" />
            Users Management
          </h1>
          <div className="relative w-full md:w-64">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search users..."
              className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 w-full focus:outline-none focus:ring-2 focus:ring-primary-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("firstName")}
                    >
                      <div className="flex items-center gap-1">
                        Name
                        {sortConfig.key === "firstName" &&
                          (sortConfig.direction === "ascending" ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          ))}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Account Number
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("fatStatus")}
                    >
                      <div className="flex items-center gap-1">
                        FAT Status
                        {sortConfig.key === "fatStatus" &&
                          (sortConfig.direction === "ascending" ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          ))}
                      </div>
                    </th>
                    <th
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                      onClick={() => requestSort("balance")}
                    >
                      <div className="flex items-center gap-1">
                        Balance
                        {sortConfig.key === "balance" &&
                          (sortConfig.direction === "ascending" ? (
                            <ChevronUp size={14} />
                          ) : (
                            <ChevronDown size={14} />
                          ))}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.length === 0 ? (
                    <tr>
                      <td
                        colSpan="6"
                        className="px-6 py-4 text-center text-gray-500"
                      >
                        No users found
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        {editingUserId === user._id ? (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  name="firstName"
                                  value={editForm.firstName}
                                  onChange={handleEditChange}
                                  className="border rounded px-2 py-1 w-24"
                                />
                                <input
                                  type="text"
                                  name="lastName"
                                  value={editForm.lastName}
                                  onChange={handleEditChange}
                                  className="border rounded px-2 py-1 w-24"
                                />
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="email"
                                name="email"
                                value={editForm.email}
                                className="border rounded px-2 py-1 w-full"
                                readOnly
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.accountNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                name="fatStatus"
                                value={editForm.fatStatus}
                                onChange={handleEditChange}
                                className="border rounded px-2 py-1"
                              >
                                <option value="not verified">
                                  Not Verified
                                </option>
                                <option value="verified">Verified</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                name="balance"
                                value={editForm.balance}
                                onChange={handleEditChange}
                                className="border rounded px-2 py-1 w-24"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button
                                  onClick={() => saveEdit(user._id)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  <Check size={18} />
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <X size={18} />
                                </button>
                              </div>
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                                  {user.firstName.charAt(0)}
                                  {user.lastName.charAt(0)}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {user.firstName} {user.lastName}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.email}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {user.accountNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  user.fatStatus === "verified"
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {user.fatStatus}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              €{user.balance.toFixed(2)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-3">
                                <button
                                  onClick={() => startEditing(user)}
                                  className="text-blue-600 hover:text-blue-900"
                                  title="Edit"
                                >
                                  <Edit size={18} />
                                </button>
                                <button
                                  onClick={() => handleDelete(user._id)}
                                  className="text-red-600 hover:text-red-900"
                                  title="Delete"
                                >
                                  <Trash2 size={18} />
                                </button>
                              </div>
                            </td>
                          </>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PropeneerLayout>
  );
}
