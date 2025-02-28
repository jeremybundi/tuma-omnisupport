import axios from "axios";

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

    console.log("🔑 API Key Loaded");

    const { sender } = req.query;

    // Fetch all conversations
    const conversationResponse = await axios.get(
      `https://conversations.messagebird.com/v1/conversations`,
      {
        headers: { Authorization: `AccessKey ${apiKey}` },
      }
    );

    const conversations = conversationResponse.data.items || [];
    console.log(`✅ Found ${conversations.length} Conversations`);

    if (conversations.length === 0) {
      return res.status(200).json({ messages: [] });
    }

    let filteredConversations = conversations;

    // If sender is provided, filter by sender's phone number
    if (sender) {
      filteredConversations = conversations.filter(
        (conv) => conv.contact?.msisdn === sender
      );

      if (filteredConversations.length === 0) {
        return res.status(404).json({ error: "No conversation found for this sender" });
      }

      console.log(`🔍 Found ${filteredConversations.length} Conversations for Sender: ${sender}`);
    }

    // Fetch messages for each conversation
    const messageRequests = filteredConversations.map(async (conversation) => {
      try {
        const messagesResponse = await axios.get(
          `https://conversations.messagebird.com/v1/conversations/${conversation.id}/messages`,
          {
            headers: { Authorization: `AccessKey ${apiKey}` },
          }
        );

        const messages = messagesResponse.data.items || [];
        console.log(`📩 ${messages.length} Messages for Conversation: ${conversation.id}`);

        return messages.map((msg) => ({
          conversationId: conversation.id,
          from: {
            name: conversation.contact?.displayName || "Unknown",
            phoneNumber: conversation.contact?.msisdn || "Unknown",
          },
          to: {
            phoneNumber: msg.to || "Unknown",
          },
          content: msg.content?.text || "No content",
          timestamp: msg.createdDatetime,
        }));
      } catch (error) {
        console.error(`❌ Error fetching messages for ${conversation.id}:`, error.message);
        return [];
      }
    });

    // Process all promises and get results
    const messagesResults = await Promise.allSettled(messageRequests);
    const allMessages = messagesResults
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value);

    console.log("📩 Final Messages Sent to Frontend:", allMessages);
    return res.status(200).json({ messages: allMessages });
  } catch (error) {
    console.error("❌ Error fetching conversations:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
