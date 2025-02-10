import { ChevronRight } from "lucide-react";

export default function EscalateIssueModal({ closeModal }) {
  return (
    <div className="fixed inset-0 flex justify-end bg-black bg-opacity-80 z-50">
      <div className="w-1/3 h-full bg-white font-poppins text-lg px-8 shadow-lg transform translate-x-full transition-transform duration-300 ease-in-out animate-slide-in">
        {/* Close button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-5 text-gray-600 hover:text-gray-800 border-2 border-gray-600 rounded-full px-2 font-semibold"
        >
          ✕
        </button>

        {/* Escalate Issue Form */}
        <div className="p-6 mt-20">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Escalate Issue</h2>

          <label className="block text-gray-700 mb-2">Reason:</label>
          <textarea className="w-full border rounded-lg p-2 h-28 focus:outline-none focus:ring focus:border-blue-300"></textarea>

          <label className="block text-gray-700 mt-4 mb-2">Assign To:</label>
          <select className="w-full border rounded-lg p-2 focus:outline-none focus:ring focus:border-blue-300">
            <option>Support Team</option>
            <option>Manager</option>
            <option>Technical Lead</option>
          </select>

          {/* Submit Button */}
          <button 
            onClick={closeModal} 
            className="mt-6 bg-blue-600 text-white py-2 px-6 rounded-lg hover:bg-blue-700 w-full"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}
