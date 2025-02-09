import { useState, useEffect, useRef } from "react";
import { MoreVertical } from "lucide-react";

export default function Conversation({ selectedChat }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    if (selectedChat) {
      console.log("Chat selected:", selectedChat);
      setMessages(selectedChat.messages || []);
    }
  }, [selectedChat]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowOptions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sendMessage = () => {
    if (newMessage.trim() === "") return;

    const userMsg = {
      id: messages.length + 1,
      sender: "User",
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };

    const botReply = {
      id: messages.length + 2,
      sender: "TUMA Support",
      message: "Thank you for reaching out! We'll assist you shortly.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };

    setMessages([...messages, userMsg, botReply]);
    setNewMessage("");
  };

  return (
    <div className="flex flex-col h-screen p-4">
      {selectedChat ? (
        <>
          {/* Header with three dots */}
          <div className="pb-2 mb-4 flex items-center justify-between relative">
            <div className="flex items-center space-x-3">
              <img src="/images/pic.png" alt="User" className="w-12 h-12 rounded-full" />
              <h2 className="text-lg font-semibold">{selectedChat.sender}</h2>
            </div>

            {/* Three-dot menu */}
            <div className="relative">
              <button onClick={() => setShowOptions(!showOptions)} className="p-2">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>

              {/* Dropdown Menu */}
              {showOptions && (
                <div
                  ref={dropdownRef}
                  className="absolute right-0 mt-2 w-40 bg-white shadow-md rounded-md p-2 text-sm z-10"
                >
                  <button className="block w-full text-left px-3 py-2 hover:bg-gray-100">Delete</button>
                  <button className="block w-full text-left px-3 py-2 hover:bg-gray-100">Close</button>
                  <button className="block w-full text-left px-3 py-2 hover:bg-gray-100" onClick={() => setShowOptions(false)}>Cancel</button>
                </div>
              )}
            </div>
          </div>
        <div>
          
        </div>
          {/* Chat messages */}
          <div className="flex-1 overflow-y-auto space-y-3 p-2">
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === "User" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs p-3 rounded-2xl text-sm shadow-md ${
                    msg.sender === "User"
                      ? "bg-blue-600 text-white rounded-br-none"
                      : "bg-gray-200 text-gray-800 rounded-bl-none"
                  }`}
                >
                  <p className="break-words">{msg.message}</p>
                  <span className="text-xs text-gray-500 block mt-1 text-right">{msg.timestamp}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Message input */}
          <div className="mt-4 flex">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              className="flex-1 p-2 border rounded-l-md"
              placeholder="Type a message..."
            />
            <button onClick={sendMessage} className="bg-blue-600 text-white px-4 rounded-r-md">
              Send
            </button>
          </div>
        </>
      ) : (
        <div className="text-gray-500 flex justify-center items-center h-full">
          Select a chat to start a conversation
        </div>
      )}
    </div>
  );
}
