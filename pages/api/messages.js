import axios from "axios";
import { wss } from "./socket"; // Import WebSocket server

export default async function handler(req, res) {
  console.log("🚀 API Handler Started");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const apiKey = process.env.MESSAGEBIRD_API_KEY;

    if (!apiKey) {
      console.error("❌ Missing API Key");
      return res.status(500).json({ error: "Missing API Key" });
    }

    // ✅ Fetch all conversations
    const conversationResponse = await axios.get(
      `https://conversations.messagebird.com/v1/conversations`,
      { headers: { Authorization: `AccessKey ${apiKey}` } }
    );

    const conversations = conversationResponse.data.items || [];
    console.log(`✅ Found ${conversations.length} Conversations`);

    if (conversations.length === 0) {
      return res.status(200).json({ conversations: [] });
    }

    // ✅ Fetch messages for each conversation
    const messageRequests = conversations.map(async (conversation) => {
      try {
        const messagesResponse = await axios.get(
          `https://conversations.messagebird.com/v1/conversations/${conversation.id}/messages`,
          { headers: { Authorization: `AccessKey ${apiKey}` } }
        );

        const messages = messagesResponse.data.items || [];
        console.log(`📩 Found ${messages.length} Messages for Conversation: ${conversation.id}`);

        // Format messages
        return messages.map((msg) => {
          const isInteractive = msg.content?.interactive;
          const contentText = isInteractive
            ? msg.content?.interactive?.body?.text || "No content"
            : msg.content?.text || "No content";

          return {
            id: msg.id, // Add message ID here
            conversationId: conversation.id,
            from: {
              name: conversation.contact?.displayName || "Unknown",
              phoneNumber: msg.from || "Unknown",
            },
            to: { phoneNumber: msg.to || "Unknown" },
            content: contentText,
            buttons: isInteractive
              ? msg.content?.interactive?.action?.buttons?.map((btn) => ({
                  id: btn.id,
                  title: btn.title,
                })) || []
              : [],
            timestamp: msg.createdDatetime,
          };
        });

        
            
      } catch (error) {
        console.error(`❌ Error fetching messages for conversation ${conversation.id}:`, error.message);
        return [];
      }
    });

    // ✅ Wait for all message fetches to complete
    const messagesResults = await Promise.allSettled(messageRequests);
    const allMessages = messagesResults
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value);

    console.log("📩 Final Messages Sent to Frontend:", allMessages);
    
    // ✅ Send new messages to all WebSocket clients
    if (wss) {
      wss.clients.forEach((client) => {
        if (client.readyState === 1) {
          client.send(JSON.stringify(allMessages));
        }
      });
    }

    return res.status(200).json({ conversations: allMessages });
  } catch (error) {
    console.error("❌ Error fetching conversations:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
