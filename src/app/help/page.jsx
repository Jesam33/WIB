"use client";
import { useState } from "react";
import Link from "next/link";
import {
  HelpCircle,
  Mail,
  Phone,
  MessageCircle,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
} from "lucide-react";

export default function HelpPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const faqs = [
    {
      id: 1,
      question: "Why was my transaction declined?",
      answer:
        "Transactions may be declined for several reasons including insufficient funds, suspicious activity detected, incorrect account information, or technical issues with our payment processor. If this is a recurring issue, please ensure your account details are up to date and your balance is sufficient for the transaction amount.",
    },
    {
      id: 2,
      question: "How do I update my account information?",
      answer:
        "To update your account information, go to your Account Settings page and select the 'Personal Details' section. From there, you can modify your personal information, contact details, and preferences. Don't forget to click 'Save Changes' when you're finished. Please note that some changes may require additional verification.",
    },
    {
      id: 3,
      question: "When will my transfer be completed?",
      answer:
        "Most transfers are processed within 1-2 business days. However, international transfers may take 3-5 business days depending on the destination country and banking system. If your transfer has been pending for longer than expected, please wait one more business day before contacting us again.",
    },
    {
      id: 4,
      question: "How do I report unauthorized transactions?",
      answer:
        "If you notice any unauthorized transactions on your account, please contact our security team immediately by calling our 24/7 hotline at +1-800-555-0123. For your protection, we recommend changing your password and enabling two-factor authentication on your account.",
    },
    {
      id: 5,
      question: "What are the transfer limits?",
      answer:
        "Standard accounts have a daily transfer limit of €10,000 and a monthly limit of €50,000. Premium accounts have higher limits of €25,000 daily and €100,000 monthly. If you need to make a larger transfer, please contact our customer service team to request a temporary limit increase.",
    },
    {
      id: 6,
      question: "I forgot my password, what should I do?",
      answer:
        "To reset your password, click on the 'Forgot Password' link on the login page. We'll send a password reset link to your registered email address. For security reasons, this link will expire after 24 hours. If you don't receive the email, please check your spam folder or contact customer support.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleEmailSupport = () => {
    window.location.href = "mailto:sglobalis35@gmail.com";
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50">
      <div className="flex-1 p-6 md:p-10">
        <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-md p-6 md:p-10 border border-gray-200">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-primary-600 hover:text-primary-800 text-sm font-medium mb-8"
          >
            <ArrowLeft size={16} />
            <span>Back to Dashboard</span>
          </Link>

          <h1 className="text-3xl font-bold text-primary-700 mb-6">Help Center</h1>

          {/* FAQ Section */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 bg-gray-50 transition-shadow hover:shadow-sm"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex justify-between items-center text-left"
                  >
                    <span className="text-base font-medium text-gray-800">
                      {faq.question}
                    </span>
                    {openFaqIndex === index ? (
                      <ChevronUp size={20} className="text-gray-500" />
                    ) : (
                      <ChevronDown size={20} className="text-gray-500" />
                    )}
                  </button>
                  {openFaqIndex === index && (
                    <p className="mt-3 text-sm text-gray-600">{faq.answer}</p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Contact Us Section */}
          <section className="mb-10">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Contact Us
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div
                className="cursor-pointer rounded-lg border p-4 hover:bg-primary-100 transition"
                onClick={handleEmailSupport}
              >
                <div className="flex items-center gap-3">
                  <Mail size={22} className="text-primary-600" />
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">
                      Email Support
                    </h3>
                  </div>
                </div>
              </div>

              <div
                className="cursor-pointer rounded-lg border p-4 hover:bg-primary-100 transition"
                onClick={handleEmailSupport}
              >
                <div className="flex items-center gap-3">
                  <Phone size={22} className="text-primary-600" />
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">
                      Phone Support
                    </h3>
                  </div>
                </div>
              </div>

              <div
                className="cursor-pointer rounded-lg border p-4 hover:bg-blue-50 transition"
                onClick={handleEmailSupport}
              >
                <div className="flex items-start gap-3">
                  <MessageCircle size={22} className="text-primary-600" />
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">
                      Live Chat
                    </h3>
                    <p className="text-xs text-gray-500">
                      Available 24/7 on the app
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Contact Form Section */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Send Us a Message
            </h2>
            <form className="space-y-5">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  placeholder="Enter your name"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter your email"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows={4}
                  placeholder="How can we help you?"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
                ></textarea>
              </div>

              <button
                type="submit"
                className="bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium px-6 py-2 rounded-md transition"
              >
                Send Message
              </button>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
