import { useState, useEffect } from "react";
import axios from "axios";

export default function UnreadMessages({ onSelectChat }) {
  const [allMessages, setAllMessages] = useState([]);
  const [latestMessages, setLatestMessages] = useState([]);
  const [displayedConversations, setDisplayedConversations] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [unreadConversations, setUnreadConversations] = useState(new Set());
  const [visibleCount, setVisibleCount] = useState(12); // Start with 9 conversations

  useEffect(() => {
    let pollingInterval;

    const fetchMessages = async () => {
      try {
        const response = await axios.get("/api/messages");
        console.log("📩 Fetched Messages:", response.data);

        const messages = response.data.conversations || [];
        if (!Array.isArray(messages)) {
          console.error("❌ Invalid API response format:", response.data);
          return;
        }

        setAllMessages(messages);

        // Get stored latest message IDs from localStorage
        const storedLatestMessages = JSON.parse(localStorage.getItem("latestMessages")) || {};

        // Keep only the latest message per conversation
        const latestMessagesMap = messages.reduce((acc, msg) => {
          if (!acc[msg.conversationId] || new Date(msg.timestamp) > new Date(acc[msg.conversationId].timestamp)) {
            acc[msg.conversationId] = msg;
          }
          return acc;
        }, {});

        const latestMessagesList = Object.values(latestMessagesMap);
        setLatestMessages(latestMessagesList);

        // Set initial displayed conversations
        setDisplayedConversations(latestMessagesList.slice(0, visibleCount));

        // Update unread messages state
        const newUnreadConversations = new Set();
        latestMessagesList.forEach((msg) => {
          if (storedLatestMessages[msg.conversationId] !== msg.id) {
            newUnreadConversations.add(msg.conversationId);
          }
        });

        setUnreadConversations(newUnreadConversations);

        // Store latest message IDs in localStorage
        const latestMessageIds = Object.fromEntries(
          latestMessagesList.map((msg) => [msg.conversationId, msg.id])
        );
        localStorage.setItem("latestMessages", JSON.stringify(latestMessageIds));
      } catch (error) {
        console.error("❌ Error fetching messages:", error);
      }
    };

    // Initial fetch
    fetchMessages();

    // Poll every 20 seconds
    pollingInterval = setInterval(fetchMessages, 20000);

    return () => clearInterval(pollingInterval);
  }, [visibleCount]); // Update when visible count changes

  const handleSelectChat = (conversationId) => {
    setSelectedConversationId(conversationId);

    // Remove from unread conversations
    setUnreadConversations((prevUnread) => {
      const newUnread = new Set(prevUnread);
      newUnread.delete(conversationId);
      return newUnread;
    });

    // Update localStorage to mark as read
    const storedLatestMessages = JSON.parse(localStorage.getItem("latestMessages")) || {};
    storedLatestMessages[conversationId] = latestMessages.find((msg) => msg.conversationId === conversationId)?.id;
    localStorage.setItem("latestMessages", JSON.stringify(storedLatestMessages));

    const selectedChatMessages = allMessages.filter((msg) => msg.conversationId === conversationId);
    onSelectChat({ conversationId, messages: selectedChatMessages });
  };

  // Load More Conversations
  const loadMoreConversations = () => {
    const newCount = visibleCount + 12; // Load 9 more
    setVisibleCount(newCount);
    setDisplayedConversations(latestMessages.slice(0, newCount));
  };

  return (
    <div className="max-w-lg mx-auto font-poppins bg-white flex flex-col">
      <div className="flex-1 overflow-hidden" style={{ maxHeight: "76vh", overflowY: "auto" }}>
        {displayedConversations.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">No messages available</p>
        ) : (
          displayedConversations.map((msg) => (
            <div
              key={msg.conversationId}
              className={`cursor-pointer px-4 py-2 border-b flex justify-between items-center transition ${
                selectedConversationId === msg.conversationId ? "bg-gray-200" : "bg-white"
              } hover:bg-gray-100`}
              onClick={() => handleSelectChat(msg.conversationId)}
            >
              <div className="flex items-start w-full">
                {/* Image before the message */}
                <img src="/images/pic.png" alt="Message Icon" className="w-12 h-12 mr-2" />

                <div className="flex justify-between items-start w-full">
                  <div>
                    <p className="font-medium  text-gray-900 mb-1 text-sm">{msg.from.name || msg.from.phoneNumber}</p>
                    <p className="text-gray-500  text-xs truncate">{msg.content}</p>
                  </div>
                  <div className="ml-auto">
                    <p className="text-sm text-gray-400">
                      {msg.timestamp
                        ? new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Blue Dot Indicator for Unread Messages */}
              {unreadConversations.has(msg.conversationId) && (
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              )}
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {visibleCount < latestMessages.length && (
        <button
          className=" border border-blue-500 text-blue-600 py-2 px-4 mt-3 rounded mx-2 transition"
          onClick={loadMoreConversations}
        >
          Load More
        </button>
      )}
    </div>
  );
}
