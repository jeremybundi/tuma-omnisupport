import { useState, useEffect } from "react";
import axios from "axios";

export default function UnreadMessages({ onSelectChat }) {
  const [groupedMessages, setGroupedMessages] = useState({});
  const [selectedSender, setSelectedSender] = useState(null);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await axios.get("/api/messages");
        const messages = response.data.messages;

        console.log("Retrieved Messages:", messages);

        if (Array.isArray(messages)) {
          const grouped = messages.reduce((acc, msg) => {
            const senderKey = msg.sender?.phoneNumber || "Unknown Sender";
            if (!acc[senderKey]) acc[senderKey] = [];
            acc[senderKey].push(msg);
            return acc;
          }, {});
          setGroupedMessages(grouped);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, []);

  return (
    <div className="max-w-lg mx-auto font-poppins bg-white flex flex-col">
      <div className="flex-1 overflow-hidden" style={{ maxHeight: "76vh", overflowY: "auto" }}>
        {Object.keys(groupedMessages).length === 0 ? (
          <p className="text-center text-gray-500 mt-4">No messages available</p>
        ) : (
          Object.keys(groupedMessages).map((senderKey) => {
            const messages = groupedMessages[senderKey];

            // Find the first text message in the conversation
            const firstTextMessage = messages.find(
              (msg) => msg.content?.text
            ) || messages[0]; // Fallback to the first message if no text found

            //console.log("📩 First Text Message Debug:", firstTextMessage);

            return (
              <div
                key={senderKey}
                className={`cursor-pointer p-4 border-b transition ${
                  selectedSender === senderKey ? "bg-gray-200" : "bg-white"
                } hover:bg-gray-100`}
                onClick={() => {
                  setSelectedSender(senderKey);
                  onSelectChat({ sender: senderKey, messages });
                }}
              >
                <p className="font-semibold">{firstTextMessage?.sender?.name || senderKey}</p>

                <p className="text-gray-600 text-sm truncate">
                  {firstTextMessage?.content?.text ??
                    firstTextMessage?.content?.hsm?.text ??
                    firstTextMessage?.content?.interactive?.body?.text ??
                    firstTextMessage?.content?.media?.url ??
                    "No content available"}
                </p>

                <p className="text-xs text-gray-400">
                  {firstTextMessage?.timestamp
                    ? new Date(firstTextMessage.timestamp).toLocaleString()
                    : ""}
                </p>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
