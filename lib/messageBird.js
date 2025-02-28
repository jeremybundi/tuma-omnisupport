import axios from "axios";

const apiKey = process.env.MESSAGEBIRD_API_KEY;
const channelId = process.env.MESSAGEBIRD_CHANNEL_ID;

if (!apiKey || !channelId) {
  console.error("❌ Missing API Key or Channel ID");
  throw new Error("Missing API Key or Channel ID");
}

/**
 * Fetches all active conversations from MessageBird
 * @returns {Promise<Array>} List of conversations
 */
export async function fetchConversations() {
  try {
    console.log("🚀 Fetching Conversations...");

    const response = await axios.get(
      `https://conversations.messagebird.com/v1/conversations?channelId=${channelId}`,
      {
        headers: { Authorization: `AccessKey ${apiKey}` },
      }
    );

    const conversations = response.data.items || [];
    console.log(`✅ Found ${conversations.length} Conversations`);
    return conversations;
  } catch (error) {
    console.error("❌ Error fetching conversations:", error.message);
    return [];
  }
}

/**
 * Fetches messages for a specific conversation
 * @param {string} conversationId - ID of the conversation
 * @returns {Promise<Array>} List of messages
 */
export async function fetchMessages(conversationId) {
  if (!conversationId) {
    console.error("❌ Missing conversationId");
    return [];
  }

  try {
    console.log(`📥 Fetching Messages for Conversation ID: ${conversationId}`);

    const response = await axios.get(
      `https://conversations.messagebird.com/v1/conversations/${conversationId}/messages`,
      {
        headers: { Authorization: `AccessKey ${apiKey}` },
      }
    );

    const messages = response.data.items.map((msg) => ({
      id: msg.id,
      sender: msg.originator || "Unknown Sender",
      content: msg.content?.text || "No content available",
      timestamp: msg.createdDatetime,
    }));

    console.log(`✅ Retrieved ${messages.length} messages for conversation ${conversationId}`);
    return messages;
  } catch (error) {
    console.error(`❌ Error fetching messages for ${conversationId}:`, error.message);
    return [];
  }
}
