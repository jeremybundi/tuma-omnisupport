import { useState, useEffect } from "react";
import axios from "axios";

export default function UnreadMessages({ onSelectChat }) {
  const [allMessages, setAllMessages] = useState([]);
  const [latestMessages, setLatestMessages] = useState([]);
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [unreadConversations, setUnreadConversations] = useState(new Set());

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

        // Keep only the latest message per conversation
        const latestMessagesMap = messages.reduce((acc, msg) => {
          if (!acc[msg.conversationId] || new Date(msg.timestamp) > new Date(acc[msg.conversationId].timestamp)) {
            acc[msg.conversationId] = msg;
          }
          return acc;
        }, {});

        setLatestMessages(Object.values(latestMessagesMap));

        // Update unread messages state
        setUnreadConversations((prevUnread) => {
          const newUnread = new Set(prevUnread);
          messages.forEach((msg) => {
            if (!newUnread.has(msg.conversationId)) {
              newUnread.add(msg.conversationId);
            }
          });
          return newUnread;
        });
      } catch (error) {
        console.error("❌ Error fetching messages:", error);
      }
    };

    // Initial fetch
    fetchMessages();

    // Poll every 5 seconds
    pollingInterval = setInterval(fetchMessages, 5000);

    return () => clearInterval(pollingInterval); // Cleanup on unmount
  }, []);

  const handleSelectChat = (conversationId) => {
    setSelectedConversationId(conversationId);

    // Remove from unread conversations
    setUnreadConversations((prevUnread) => {
      const newUnread = new Set(prevUnread);
      newUnread.delete(conversationId);
      return newUnread;
    });

    const selectedChatMessages = allMessages.filter((msg) => msg.conversationId === conversationId);
    onSelectChat({ conversationId, messages: selectedChatMessages });
  };

  return (
    <div className="max-w-lg mx-auto font-poppins bg-white flex flex-col">
      <div className="flex-1 overflow-hidden" style={{ maxHeight: "76vh", overflowY: "auto" }}>
        {latestMessages.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">No messages available</p>
        ) : (
          latestMessages.map((msg) => (
            <div
              key={msg.conversationId}
              className={`cursor-pointer p-4 border-b flex justify-between items-center transition ${
                selectedConversationId === msg.conversationId ? "bg-gray-200" : "bg-white"
              } hover:bg-gray-100`}
              onClick={() => handleSelectChat(msg.conversationId)}
            >
              <div>
                <p className="font-semibold">{msg.from.name || msg.from.phoneNumber}</p>
                <p className="text-gray-600 text-sm truncate">{msg.content}</p>
                <p className="text-xs text-gray-400">
                  {msg.timestamp ? new Date(msg.timestamp).toLocaleString() : ""}
                </p>
              </div>

              {/* Blue Dot Indicator for Unread Messages */}
              {unreadConversations.has(msg.conversationId) && (
                <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
