"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css"; // Default CSS for the date picker

const CopyButton = ({ text }) => {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
  };

  return (
    <button
      onClick={copyToClipboard}
      className="ml-2 px-2 py-1 text-blue-600 underline hover:text-blue-800"
    >
      Copy
    </button>
  );
};

// Generate 30 transactions
const generateTransactions = (count) => {
  return Array.from({ length: count }, (_, index) => ({
    name: `Customer ${index + 1}`,
    phone: `+2547${Math.floor(10000000 + Math.random() * 90000000)}`,
    kplcAccount: String(Math.floor(1000000000 + Math.random() * 9000000000)),
    amountKES: String(Math.floor(1000 + Math.random() * 9000)),
    amountGBP: (Math.random() * 500).toFixed(2),
    exchangeRate: "150",
    date: new Date(
      2024,
      Math.floor(Math.random() * 12),
      Math.floor(Math.random() * 28) + 1,
      Math.floor(Math.random() * 24),
      Math.floor(Math.random() * 60)
    ).toLocaleString(),
    channel: ["Card", "MPESA", "Paybill"][Math.floor(Math.random() * 3)],
    status: Math.random() > 0.5 ? "Tokens Dispatched" : "Tokens Not Dispatched",
  }));
};

const TransactionTable = () => {
  const [transactions] = useState(generateTransactions(30));
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [startDate, setStartDate] = useState(null); // For single date filter
  const [endDate, setEndDate] = useState(null); // For date range filter
  const recordsPerPage = 12;

  // Filter transactions by customer name and date/range
  const filteredTransactions = transactions.filter((transaction) => {
    const transactionDate = new Date(transaction.date).setHours(0, 0, 0, 0); // Normalize transaction date
    const matchesSearchTerm = transaction.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    // Filter by date range
    if (startDate && endDate) {
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      const end = new Date(endDate).setHours(23, 59, 59, 999);
      return (
        matchesSearchTerm && transactionDate >= start && transactionDate <= end
      );
    }

    // Filter by single date
    if (startDate && !endDate) {
      const start = new Date(startDate).setHours(0, 0, 0, 0);
      return matchesSearchTerm && transactionDate === start;
    }

    // If no date filter is applied
    return matchesSearchTerm;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTransactions.length / recordsPerPage);
  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * recordsPerPage,
    currentPage * recordsPerPage
  );

  return (
    <div className="p-6 bg-white w-full font-poppins rounded-lg shadow-md">
      {/* Search Input and Date Pickers */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-lg font-semibold">All Kplc Transactions</h1>
        <div className="flex items-center gap-4">
          <input
            type="text"
            placeholder="Search by customer name..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to first page when searching
            }}
            className="w-72 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <h1 className="text-gray-400 text-[14px] font-[500] ml-9">Filter By Date</h1>
          <div className="flex items-center gap-2">
            <DatePicker
              selected={startDate}
              onChange={(date) => {
                setStartDate(date);
                setEndDate(null); // Reset end date when selecting a new start date
                setCurrentPage(1); // Reset to first page when filtering
              }}
              placeholderText="Start Date"
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              dateFormat="dd/MM/yyyy"
              isClearable
            />
            <span>to</span>
            <DatePicker
              selected={endDate}
              onChange={(date) => {
                setEndDate(date);
                setCurrentPage(1); // Reset to first page when filtering
              }}
              placeholderText="End Date"
              className="p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              dateFormat="dd/MM/yyyy"
              isClearable
              minDate={startDate} // Ensure end date is not before start date
            />
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-[10px] text-left">
          <thead>
            <tr className="bg-gray-100 text-gray-500">
              <th className="p-3 font-semibold">Name</th>
              <th className="p-3 font-semibold">Phone</th>
              <th className="p-3 font-semibold">KPLC Account No</th>
              <th className="p-3 font-semibold">Amount (KES)</th>
              <th className="p-3 font-semibold">Amount (GBP)</th>
              <th className="p-3 font-semibold">Exchange Rate</th>
              <th className="p-3 font-semibold">Date</th>
              <th className="p-3 font-semibold">Channel</th>
              <th className="p-3 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.map((transaction, index) => (
              <tr
                key={index}
                className="border-b hover:bg-gray-50 text-[11px] transition-colors"
              >
                <td className="p-3 text-gray-500">{transaction.name}</td>
                <td className="p-3">
                  {transaction.phone} <CopyButton text={transaction.phone} />
                </td>
                <td className="p-3">
                  {transaction.kplcAccount}{" "}
                  <CopyButton text={transaction.kplcAccount} />
                </td>
                <td className="p-3">
                  {transaction.amountKES} <CopyButton text={transaction.amountKES} />
                </td>
                <td className="p-3">{transaction.amountGBP}</td>
                <td className="p-3">{transaction.exchangeRate}</td>
                <td className="p-3 text-gray-500">{transaction.date}</td>
                <td className="p-3 text-gray-500">{transaction.channel}</td>
                <td className="p-2">
                <span
                    className={`p-1 rounded-lg w-fit inline-block ${
                    transaction.status === "Tokens Dispatched"
                        ? "text-green-600 bg-green-100"
                        : "text-red-600 bg-red-100"
                    }`}
                >
                    {transaction.status}
                </span>
                </td>


              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      <div className="flex justify-center mt-6 space-x-2">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg text-[11px] ${
            currentPage === 1
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Prev
        </button>
        <span className="px-4 py-2 text-[11px] bg-gray-100 rounded-lg">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg text-[11px] ${
            currentPage === totalPages
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-blue-500 text-white hover:bg-blue-600"
          }`}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default TransactionTable;