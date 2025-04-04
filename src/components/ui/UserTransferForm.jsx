import { useState, useRef } from "react";
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

const UserTransferForm = ({ userData, onComplete = () => {} }) => {
  const [formData, setFormData] = useState({
    accountNumber: "",
    recipientName: "",
    amount: "",
    description: "",
    currency: "EUR",
  });

  const [formState, setFormState] = useState({
    status: "idle", // idle, loading, success, error
    errorMessage: "",
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [balance, setBalance] = useState(userData.balance);
  const successCount = useRef(0);

  const validateAmount = (value) => {
    const numValue = parseFloat(value);
    return !isNaN(numValue) && numValue > 0 && numValue <= 10000;
  };

  const validateAccountNumber = (value) => {
    return value.length >= 10 && /^[0-9\s]+$/.test(value);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const transferAmount = parseFloat(formData.amount);
    const transferKey = `transferCount_${userData.id}`;
    const currentCount = parseInt(localStorage.getItem(transferKey) || "0");
  
    // Prevent more than 5 transfers
    if (currentCount >= 5) {
      setFormState({
        status: "error",
        errorMessage: "Transfer limit reached. Contact customer care.",
      });
      setShowErrorModal(true);
      return;
    }
  
    // Validation
    if (!validateAccountNumber(formData.accountNumber)) {
      return setFormState({
        status: "error",
        errorMessage: "Please enter a valid account number.",
      });
    }
  
    if (!validateAmount(formData.amount)) {
      return setFormState({
        status: "error",
        errorMessage: "Amount must be between 0.01 and 10,000.",
      });
    }
  
    if (transferAmount > balance) {
      return setFormState({
        status: "error",
        errorMessage: "Insufficient balance. Please enter a lower amount.",
      });
    }
  
    // Simulate loading
    setFormState({ status: "loading", errorMessage: "" });
  
    // Wait 5 seconds to simulate processing
    await new Promise((resolve) => setTimeout(resolve, 5000));
  
    // First five successful transfers
    if (currentCount < 5) {
      localStorage.setItem(transferKey, (currentCount + 1).toString());
      setBalance((prev) => prev - transferAmount);
      setShowSuccessModal(true);
    } else {
      setFormState({
        status: "error",
        errorMessage: "Transfer limit reached.",
      });
      setShowErrorModal(true);
    }
  
    // Reset form
    setFormData({
      accountNumber: "",
      recipientName: "",
      amount: "",
      description: "",
      currency: "EUR",
    });
  
    setFormState({ status: "idle", errorMessage: "" });
  };
  
  
  return (
    <>
      {/* Success Modal */}
      {showSuccessModal && (
  <div className="fixed inset-0 flex z-10 items-center justify-center bg-black bg-opacity-50">
    <div className="bg-white p-6 rounded-lg shadow-lg text-center relative">
      {/* Close Button */}
      {/* <button
        className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        onClick={() => setShowSuccessModal(false)}
      >
        ✖
      </button> */}

      {/* Success Icon */}
      <CheckCircle size={50} className="text-green-500 mx-auto" />

      {/* Success Message */}
      <p className="text-lg font-semibold mt-4 text-gray-900">
        Transfer Successful!
      </p>
      <p className="text-sm text-gray-500">
        Your funds have been transferred successfully.
      </p>

      {/* Close Button */}
      <button
        onClick={() => setShowSuccessModal(false)}
        className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
      >
        OK
      </button>
    </div>
  </div>
)}


      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-10 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center">
            <AlertCircle size={40} className="text-red-500 mx-auto" />
            <p className="text-lg font-semibold mt-4">Transaction Failed!</p>
            <p className="text-sm text-gray-500">
              Couldn't process transaction. Please contact customer care.
            </p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        {/* Error Message */}
        {formState.status === "error" && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 mt-0.5" />
            <p className="text-sm text-red-700">{formState.errorMessage}</p>
          </div>
        )}

        {/* Recipient Details */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="accountNumber">
              Account Number
            </label>
            <input
              id="accountNumber"
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              required
              placeholder="Enter account number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" htmlFor="recipientName">
              Recipient Name
            </label>
            <input
              id="recipientName"
              name="recipientName"
              value={formData.recipientName}
              onChange={handleInputChange}
              required
              placeholder="Enter recipient name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Transfer Details */}
        <div className="space-y-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label htmlFor="amount" className="block text-sm font-medium mb-1">
                Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">€</span>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  min="0.01"
                  max="10000"
                  step="0.01"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  placeholder="0.00"
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Available balance: {formData.currency} {balance.toFixed(2)}
              </p>
            </div>

            <div className="w-24">
              <label htmlFor="currency" className="block text-sm font-medium mb-1">
                Currency
              </label>
              <select
                id="currency"
                name="currency"
                value={formData.currency}
                onChange={handleInputChange}
                className="w-full px-2 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium mb-1">
              Description (Optional)
            </label>
            <input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="What's this transfer for?"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={formState.status === "loading"}
            className={`px-6 py-3 bg-blue-600 text-white rounded-md text-sm font-medium flex items-center gap-2 ${
              formState.status === "loading" ? "opacity-70 cursor-not-allowed" : "hover:bg-blue-700"
            }`}
          >
            {formState.status === "loading" ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Processing...
              </>
            ) : (
              <>
                Transfer Funds <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default UserTransferForm;
