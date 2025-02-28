import axios from "axios";

export default async function handler(req, res) {
  console.log("🚀 API Handler Started");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const apiKey = process.env.MESSAGEBIRD_API_KEY;
    const channelId = process.env.MESSAGEBIRD_CHANNEL_ID;

    if (!apiKey || !channelId) {
      console.error("❌ Missing API Key or Channel ID");
      return res.status(500).json({ error: "Missing API Key or Channel ID" });
    }

    console.log(`🔑 API Key: Exists | 🎯 Channel ID: ${channelId}`);

    // Fetch conversations
    const conversationResponse = await axios.get(
      `https://conversations.messagebird.com/v1/conversations?channelId=${channelId}`,
      {
        headers: { Authorization: `AccessKey ${apiKey}` },
      }
    );

    const conversations = conversationResponse.data.items || [];
    console.log(`✅ Found ${conversations.length} Conversations for Channel: ${channelId}`);

    if (conversations.length === 0) {
      return res.status(200).json({ messages: [] });
    }

    // Fetch messages concurrently for all conversations
    const messageRequests = conversations.map(async (conversation) => {
      try {
        const messagesInfo = conversation.messages; // Contains totalCount and href

        if (!messagesInfo || !messagesInfo.href || messagesInfo.totalCount === 0) {
          console.log(`⚠️ No messages found for conversation: ${conversation.id}`);
          return [];
        }

        console.log(`🔍 Fetching messages from: ${messagesInfo.href}`);

        const messagesResponse = await axios.get(messagesInfo.href, {
          headers: { Authorization: `AccessKey ${apiKey}` },
        });

        return messagesResponse.data.items.map((msg) => {
          const senderId = msg.originator || "Unknown Sender";
          let senderInfo = { name: "Unknown", phoneNumber: senderId };

          let messageContent =
            msg.content ||
            (msg.content?.hsm ? msg.content.hsm.text : "No content available");

          // Fetch contact details to get the sender's name
          const contact = conversation.contact;
          if (contact) {
            senderInfo = {
              name: contact.displayName || "Unknown",
              phoneNumber: contact.msisdn || senderId,
            };
          }

          return {
            id: msg.id,
            conversationId: conversation.id,
            sender: senderInfo,
            content: messageContent,
            timestamp: msg.createdDatetime,
          };
        });
      } catch (error) {
        console.error(`❌ Error fetching messages for conversation ${conversation.id}:`, error.message);
        return []; // Return empty array on failure
      }
    });

    // Wait for all message requests to complete
    const messagesResults = await Promise.allSettled(messageRequests);
    const allMessages = messagesResults
      .filter((result) => result.status === "fulfilled")
      .flatMap((result) => result.value);

    console.log(" Final Messages Sent to Frontend:", allMessages);
    return res.status(200).json({ messages: allMessages });
  } catch (error) {
    console.error(" Error fetching conversations:", error.message);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
