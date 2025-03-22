import { useState, useEffect, useRef } from "react";
import axios from "axios";

export default function InProgressMessages({ onSelectChat, activeChat }) {
  const [inProgressConversations, setInProgressConversations] = useState([]);
  const [visibleCount, setVisibleCount] = useState(10);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const firstLoad = useRef(true);

  useEffect(() => {
    const fetchInProgressConversations = async () => {
      try {
        if (firstLoad.current) {
          setLoading(true);
        }
        setError(null);

        const response = await axios.get("/api/messages");
        console.log("✅ Conversations API Response:", response.data);

        const conversations = response.data.conversations || [];
        const inProgress = conversations.filter((conv) => conv.status === "in-progress");

        // Update conversations with new message flags
        const updatedConversations = inProgress.map((conv) => {
          if (conv.messages.length > 0) {
            // Sort messages to get the newest one
            const sortedMessages = [...conv.messages].sort(
              (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
            );
            const newestMessage = sortedMessages[0]; // Newest message is first

            // Get the stored message ID from localStorage
            const storedMessageId = localStorage.getItem(`lastMessage_${conv.id}`);

            // Check if the newest message ID is different from the stored one
            const hasNewMessage = newestMessage.id !== storedMessageId;

            return {
              ...conv,
              hasNewMessage,
            };
          }
          return conv;
        });

        setInProgressConversations(updatedConversations);
      } catch (error) {
        console.error("❌ Error fetching in-progress messages:", error);
        setError("Failed to fetch in-progress messages. Please try again later.");
      } finally {
        setLoading(false);
        firstLoad.current = false;
      }
    };

    fetchInProgressConversations();
    const interval = setInterval(fetchInProgressConversations, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const loadMoreConversations = () => {
    setVisibleCount((prevCount) => prevCount + 10);
  };

  const handleSelectChat = (conversation) => {
    // Mark the conversation as read by updating localStorage
    if (conversation.messages.length > 0) {
      const sortedMessages = [...conversation.messages].sort(
        (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
      );
      const newestMessageId = sortedMessages[0].id;
      localStorage.setItem(`lastMessage_${conversation.id}`, newestMessageId);
    }

    // Notify the parent component of the selected chat
    onSelectChat(conversation);
  };

  return (
    <div className="max-w-lg mx-auto font-poppins bg-white flex flex-col">
      <div className="flex-1 overflow-hidden" style={{ maxHeight: "77vh", overflowY: "auto" }}>
        {loading ? (
          <p className="text-gray-500 text-center mt-4">Loading in-progress messages...</p>
        ) : error ? (
          <p className="text-red-500 text-center mt-4">{error}</p>
        ) : inProgressConversations.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">No in-progress messages available</p>
        ) : (
          inProgressConversations.slice(0, visibleCount).map((conv) => {
            if (!Array.isArray(conv.messages) || conv.messages.length === 0) return null;

            // Sort messages to get the newest one
            const sortedMessages = [...conv.messages].sort(
              (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
            );
            const lastMessage = sortedMessages[0]; // Newest message is first

            return (
              <div
                key={conv.id}
                className={`cursor-pointer px-4 py-2 border-b flex justify-between items-center transition ${
                  activeChat?.id === conv.id
                    ? "bg-gray-100" // Highlight active chat
                    : conv.hasNewMessage
                    ? "bg-gray-200" // Highlight new messages
                    : "bg-white"
                }`}
                onClick={() => handleSelectChat(conv)}
              >
                <div className="flex items-start w-full">
                  <img src="/images/pic.png" alt="Message Icon" className="w-12 h-12 mr-2" />
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <p className="font-medium text-gray-900 mb-1 text-sm">
                        {lastMessage.from.name || lastMessage.from.phoneNumber}
                      </p>
                      <p className="text-gray-500 text-xs truncate">{lastMessage.content}</p>
                    </div>
                    <div className="ml-auto flex items-center">
                      <p className="text-sm text-gray-400">
                        {new Date(lastMessage.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>

                      {/* Show dot for new messages */}
                      {conv.hasNewMessage && (
                        <span className="ml-2 bg-red-500 w-3 h-3 rounded-full"></span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Load more button */}
      {visibleCount < inProgressConversations.length && (
        <button
          className="border border-blue-500 text-blue-600 py-2 px-4 mt-3 rounded mx-2 transition"
          onClick={loadMoreConversations}
        >
          Load More
        </button>
      )}
    </div>
  );
}