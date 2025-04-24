import { useState, useEffect } from "react";
import axios from "axios";
import PropTypes from "prop-types"; // For prop validation

export default function UnreadMessages({ onSelectChat, filter, sortOrder }) {
  const [unreadConversations, setUnreadConversations] = useState([]);
  const [visibleCount, setVisibleCount] = useState(100); // Start with 10 conversations
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  useEffect(() => {
    const fetchUnreadConversations = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch conversations
        const response = await axios.get("/api/messages");
        console.log('Conversations API Response:', response.data); // Debugging
        const conversations = response.data.conversations || [];

        // Filter unread conversations
        const unread = conversations.filter((conv) => conv.status === "unread");

        // Apply filter and sort
        const filtered = unread.filter((conv) =>
          conv.messages.some((msg) =>
            msg.content.toLowerCase().includes(filter.toLowerCase())
          )
        );

        const sorted = filtered.sort((a, b) => {
          const lastMessageA = a.messages[a.messages.length - 1];
          const lastMessageB = b.messages[b.messages.length - 1];
          return sortOrder === "newest"
            ? new Date(lastMessageB.timestamp) - new Date(lastMessageA.timestamp)
            : new Date(lastMessageA.timestamp) - new Date(lastMessageB.timestamp);
        });

        console.log('Unread Conversations:', sorted); // Debugging
        setUnreadConversations(sorted.slice(0, visibleCount));
      } catch (error) {
        console.error("❌ Error fetching unread messages:", error);
        setError("Failed to fetch unread messages. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchUnreadConversations();
   
  }, [filter, sortOrder, visibleCount]);

  const loadMoreConversations = () => {
    setVisibleCount((prev) => prev + 100); // Load 10 more conversations
  };

  if (loading) {
    return (
      <div className="max-w-lg mx-auto font-poppins bg-white flex flex-col items-center justify-center p-4">
        <p className="text-gray-500">Loading unread messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto font-poppins bg-white flex flex-col items-center justify-center p-4">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto font-poppins bg-white flex flex-col">
      <div className="flex-1 overflow-hidden" style={{ maxHeight: "77vh", overflowY: "auto" }}>
        {unreadConversations.length === 0 ? (
          <p className="text-center text-gray-500 mt-4">No unread messages available</p>
        ) : (
          unreadConversations.map((conv) => {
            if (!Array.isArray(conv.messages)) {
              return null; // Skip rendering if messages are missing
            }

            const lastMessage = conv.messages[conv.messages.length - 1];
            if (!lastMessage || !lastMessage.from || !lastMessage.content || !lastMessage.timestamp) {
              return null; // Skip rendering if last message is invalid
            }

            return (
              <div
                key={conv.id}
                className="cursor-pointer px-4 py-2 border-b flex justify-between items-center transition bg-white hover:bg-gray-100"
                onClick={() => onSelectChat(conv)}
                role="button"
                tabIndex={0}
                aria-label={`Open conversation with ${lastMessage.from.name || lastMessage.from.phoneNumber}`}
              >
                <div className="flex items-start w-full">
                  <img
                    src="/images/pic.png"
                    alt="Message Icon"
                    className="w-12 h-12 mr-2"
                    aria-hidden="true"
                  />
                  <div className="flex justify-between items-start w-full">
                    <div>
                      <p className="font-medium text-gray-900 mb-1 text-sm">
                        {lastMessage.from.name || lastMessage.from.phoneNumber}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        {lastMessage.content}
                      </p>
                    </div>
                    <div className="ml-auto">
                      <p className="text-sm text-gray-400">
                        {new Date(lastMessage.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: true,
                        })}
                      </p>
                    </div>
                  </div>
                </div>
                <span className="w-3 h-3 bg-blue-500 rounded-full" aria-label="Unread message"></span>
              </div>
            );
          })
        )}
      </div>

      {visibleCount < unreadConversations.length && (
        <button
          className="border border-blue-500 text-blue-600 py-2 px-4 mt-3 rounded mx-2 transition"
          onClick={loadMoreConversations}
          aria-label="Load more conversations"
        >
          Load More
        </button>
      )}
    </div>
  );
}

// Prop validation
UnreadMessages.propTypes = {
  onSelectChat: PropTypes.func.isRequired,
  filter: PropTypes.string,
  sortOrder: PropTypes.oneOf(["newest", "oldest"]),
};

UnreadMessages.defaultProps = {
  filter: "",
  sortOrder: "newest",
};