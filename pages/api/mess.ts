import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface Conversation {
  id: string;
  contact?: {
    msisdn?: string;
    displayName?: string;
  };
}

interface MessageItem {
  to?: string;
  content?: {
    text?: string;
  };
  createdDatetime: string;
}

interface MessageMapped {
  conversationId: string;
  from: {
    name: string;
    phoneNumber: string;
  };
  to: {
    phoneNumber: string;
  };
  content: string;
  timestamp: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log("🚀 API Handler Started");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Error: Method Not Allowed" });
  }

  try {
    const apiKey = process.env.MESSAGEBIRD_API_KEY;

    if (!apiKey) {
      console.error("❌ Missing API Key");
      return res.status(500).json({ error: "Error: Missing API Key" });
    }

    console.log("🔑 API Key Loaded");

    const { sender } = req.query as { sender?: string };

    const conversationResponse = await axios.get<{ items: Conversation[] }>(
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

    if (sender) {
      filteredConversations = conversations.filter(
        (conv) => conv.contact?.msisdn === sender
      );

      if (filteredConversations.length === 0) {
        return res.status(404).json({ error: "Error: No conversation found for this sender" });
      }

      console.log(`🔍 Found ${filteredConversations.length} Conversations for Sender: ${sender}`);
    }

    const messageRequests = filteredConversations.map(async (conversation) => {
      try {
        const messagesResponse = await axios.get<{ items: MessageItem[] }>(
          `https://conversations.messagebird.com/v1/conversations/${conversation.id}/messages`,
          {
            headers: { Authorization: `AccessKey ${apiKey}` },
          }
        );

        const messages = messagesResponse.data.items || [];
        console.log(`📩 ${messages.length} Messages for Conversation: ${conversation.id}`);

        return messages.map((msg): MessageMapped => ({
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
      } catch (err) {
        const error = err as Error;
        console.error(`❌ Error fetching messages for ${conversation.id}:`, error.message);
        return [];
      }
    });

    const messagesResults = await Promise.allSettled(messageRequests);

    const allMessages = messagesResults
      .filter((result): result is PromiseFulfilledResult<MessageMapped[]> => result.status === "fulfilled")
      .flatMap((result) => result.value);

    console.log("📩 Final Messages Sent to Frontend:", allMessages);

    return res.status(200).json({ messages: allMessages });
  } catch (err) {
    const error = err as Error;
    console.error("❌ Error fetching conversations:", error.message || error);
    return res.status(500).json({ error: "Error: Internal Server Error" });
  }
}
