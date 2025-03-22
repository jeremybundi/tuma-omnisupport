import axios from "axios";
import { wss } from "./socket"; // Import WebSocket server

export default async function handler(req, res) {
  console.log("🚀 API Handler Started");

  const apiKey = process.env.MESSAGEBIRD_API_KEY;

  if (!apiKey) {
    console.error("❌ Missing API Key");
    return res.status(500).json({ error: "Missing API Key" });
  }

  try {
    if (req.method === "GET") {
      return await handleGetConversations(req, res, apiKey);
    } else {
      return res.status(405).json({ error: "Method Not Allowed" });
    }
  } catch (error) {
    console.error("❌ API Error:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Fetch all conversations and messages
 */
async function handleGetConversations(req, res, apiKey) {
  console.log("📡 Fetching Conversations...");

  try {
    const conversationResponse = await axios.get(
      `https://conversations.messagebird.com/v1/conversations`,
      { headers: { Authorization: `AccessKey ${apiKey}` } }
    );

    const conversations = conversationResponse.data.items || [];
    console.log(`✅ Found ${conversations.length} Conversations`);

    if (conversations.length === 0) {
      return res.status(200).json({ conversations: [] });
    }

    const conversationsWithMessages = await Promise.all(
      conversations.map((conversation) => fetchMessagesForConversation(conversation, apiKey))
    );

    // Broadcast the conversations to WebSocket clients
    broadcastToClients({ type: "conversations", data: conversationsWithMessages });

    return res.status(200).json({ conversations: conversationsWithMessages });
  } catch (error) {
    console.error("❌ Error Fetching Conversations:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Fetch messages for a specific conversation
 */
async function fetchMessagesForConversation(conversation, apiKey) {
  try {
    const messagesResponse = await axios.get(
      `https://conversations.messagebird.com/v1/conversations/${conversation.id}/messages`,
      { headers: { Authorization: `AccessKey ${apiKey}` } }
    );

    const messages = messagesResponse.data.items || [];
    console.log(`📩 Found ${messages.length} Messages for ${conversation.id}`);

    // Determine conversation status
    const userReplied = messages.some((msg) => msg.from === "+447778024995"); // Replace with your phone number

    const status = userReplied ? "in-progress" : "unread";

    // Format messages
    const formattedMessages = messages.map((msg) => {
      const isInteractive = msg.content?.interactive;
      const isButtonReply = isInteractive && msg.content.interactive.type === "button_reply";

      // Extract the content text based on the message type
      let contentText;
      if (isButtonReply) {
        // If it's a button reply, use the button text as the content
        contentText = msg.content.interactive.reply.text;
      } else if (isInteractive) {
        // If it's an interactive message (but not a button reply), use the body text
        contentText = msg.content.interactive.body?.text || "No content";
      } else {
        // For non-interactive messages, use the text content
        contentText = msg.content?.text || "No content";
      }

      // Check if the message is a button selection
      const selectedButton = msg.buttons?.find((btn) => btn.selected);
      const responseText = selectedButton
        ? `Customer selected "${selectedButton.title}"`
        : contentText;

      return {
        id: msg.id,
        conversationId: conversation.id,
        from: {
          name: conversation.contact?.displayName || "Unknown",
          phoneNumber: msg.from || "Unknown",
        },
        to: { phoneNumber: msg.to || "Unknown" },
        content: responseText, // Use the dynamic response text
        buttons: isInteractive
          ? msg.content?.interactive?.action?.buttons?.map((btn) => ({
              id: btn.id,
              title: btn.title,
              selected: btn.selected || false, // Track if the button was selected
            })) || []
          : [],
        timestamp: msg.createdDatetime,
      };
    });

    return {
      ...conversation,
      messages: formattedMessages,
      status,
    };
  } catch (error) {
    console.error(`❌ Error Fetching Messages for ${conversation.id}:`, error.message);
    return { ...conversation, messages: [], status: "error" };
  }
};

/**
 * Broadcast messages to WebSocket clients
 */
function broadcastToClients(data) {
  if (wss) {
    wss.clients.forEach((client) => {
      if (client.readyState === 1) {
        client.send(JSON.stringify(data));
      }
    });
  }
}