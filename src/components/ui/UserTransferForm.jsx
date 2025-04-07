import { useState, useRef } from "react";
import { ArrowRight, CheckCircle, AlertCircle } from "lucide-react";

const UserTransferForm = ({ userData, onComplete = () => {} }) => {
  const [formData, setFormData] = useState({
    accountNumber: "",
    recipientName: "",
    amount: "",
    description: "",
    currency: "EUR",
    otp: "",
  });

  const [formState, setFormState] = useState({
    status: "idle",
    errorMessage: "",
  });

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [balance, setBalance] = useState(userData.balance);
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState(["", "", "", "", "", ""]);
  const otpInputsRef = useRef([]);
  const otpKey = "userOtp";
  const transferKey = `transferCount_${userData.id}`;
  const [correctOtp, setCorrectOtp] = useState("");

  const generateOtp = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    localStorage.setItem(otpKey, otp);
    setCorrectOtp(otp); // Also store in state for verification
    return otp;
  };

  const getTypedOtp = () => otpDigits.join("");

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

  const handleOtpVerify = (e) => {
    e.preventDefault();
    const enteredOtp = getTypedOtp();
    const storedOtp = localStorage.getItem(otpKey);

    if (enteredOtp === storedOtp) {
      setOtpSent(false);
      handleSubmit(); // Proceed with transfer
    } else {
      setFormState({
        status: "error",
        errorMessage: "Invalid OTP. Please try again.",
      });
      setShowErrorModal(true);
      setOtpSent(false);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();

    const transferAmount = parseFloat(formData.amount);
    const currentCount = parseInt(localStorage.getItem(transferKey) || "0");

    if (currentCount >= 5) {
      setFormState({
        status: "error",
        errorMessage: "Transfer limit reached. Contact customer care.",
      });
      setShowErrorModal(true);
      return;
    }

    if (!otpSent) {
      const generatedOtp = generateOtp();
      alert(`OTP has been sent: ${generatedOtp}`); // Replace with email logic
      setOtpSent(true);
      return;
    }

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

    setFormState({ status: "loading", errorMessage: "" });

    await new Promise((resolve) => setTimeout(resolve, 5000));

    localStorage.setItem(transferKey, (currentCount + 1).toString());
    setBalance((prev) => prev - transferAmount);
    setShowSuccessModal(true);

    setFormData({
      accountNumber: "",
      recipientName: "",
      amount: "",
      description: "",
      currency: "EUR",
      otp: "",
    });

    setOtpDigits(["", "", "", "", "", ""]);
    setFormState({ status: "idle", errorMessage: "" });
  };

  return (
    <>
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 flex z-10 items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center relative">
            <CheckCircle size={50} className="text-green-500 mx-auto" />
            <p className="text-lg font-semibold mt-4 text-gray-900">
              Transfer Successful!
            </p>
            <p className="text-sm text-gray-500">
              Your funds have been transferred successfully.
            </p>
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
            <p className="text-sm text-gray-500">{formState.errorMessage}</p>
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
        {formState.status === "error" && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
            <AlertCircle size={18} className="text-red-500 mt-0.5" />
            <p className="text-sm text-red-700">{formState.errorMessage}</p>
          </div>
        )}

        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Account Number</label>
            <input
              name="accountNumber"
              value={formData.accountNumber}
              onChange={handleInputChange}
              required
              placeholder="Enter account number"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Recipient Name</label>
            <input
              name="recipientName"
              value={formData.recipientName}
              onChange={handleInputChange}
              required
              placeholder="Enter recipient name"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Amount</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">€</span>
                <input
                  name="amount"
                  type="number"
                  min="0.01"
                  max="10000"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                  className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Available balance: {formData.currency} {balance.toFixed(2)}
              </p>
            </div>

            <div className="w-24">
              <label className="block text-sm font-medium mb-1">Currency</label>
              <select
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
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="What's this transfer for?"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={formState.status === "loading"}
            className={`px-6 py-3 bg-blue-600 text-white rounded-md text-sm font-medium flex items-center gap-2 ${
              formState.status === "loading" ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {formState.status === "loading" ? "Processing..." : "Continue"}
            <ArrowRight size={16} />
          </button>
        </div>
      </form>

      {/* OTP Modal */}
      {otpSent && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg text-center w-[90%] max-w-md relative">
            <button
              onClick={() => setOtpSent(false)}
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 text-xl"
            >
              &times;
            </button>
            <h2 className="text-lg font-semibold mb-4">Enter the OTP</h2>
            <div className="flex justify-center gap-2 mb-4">
              {otpDigits.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (otpInputsRef.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/, "");
                    const newDigits = [...otpDigits];
                    newDigits[index] = value;
                    setOtpDigits(newDigits);
                    if (value && index < 5) {
                      otpInputsRef.current[index + 1]?.focus();
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Backspace" && !otpDigits[index] && index > 0) {
                      otpInputsRef.current[index - 1]?.focus();
                    }
                  }}
                  className="w-10 h-12 text-center border border-gray-300 rounded-md text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ))}
            </div>
            <button
              onClick={handleOtpVerify}
              className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Verify & Continue
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UserTransferForm;
