import type { NextApiRequest, NextApiResponse } from 'next';
import axios from "axios";

interface Conversation {
  id: string;
  contact: {
    displayName: string;
  };
}

interface Message {
  id: string;
  from: string;
  to: string;
  content?: {
    text?: string;
    interactive?: {
      type: string;
      body?: {
        text?: string;
      };
      action?: {
        buttons?: {
          id: string;
          title: string;
          selected?: boolean;
        }[];
      };
      reply?: {
        text: string;
      };
    };
  };
  buttons?: {
    id: string;
    title: string;
    selected?: boolean;
  }[];
  createdDatetime: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const apiKey = process.env.MESSAGEBIRD_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "Error: Missing API Key" });
  }

  try {
    if (req.method === "GET") {
      return await handleGetConversations(req, res, apiKey);
    } else {
      return res.status(405).json({ error: "Error: Method Not Allowed" });
    }
  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: "Error: Internal Server Error" });
  }
}

async function handleGetConversations(req: NextApiRequest, res: NextApiResponse, apiKey: string) {
  try {
    const conversationResponse = await axios.get<{ items: Conversation[] }>(
      `https://conversations.messagebird.com/v1/conversations`,
      { headers: { Authorization: `AccessKey ${apiKey}` } }
    );

    const conversations = conversationResponse.data.items || [];

    if (conversations.length === 0) {
      return res.status(200).json({ conversations: [] });
    }

    const conversationsWithMessages = await Promise.all(
      conversations.map((conversation) => fetchMessagesForConversation(conversation, apiKey))
    );

    return res.status(200).json({ conversations: conversationsWithMessages });
  } catch (error) {
    console.error('handleGetConversations error:', error);
    return res.status(500).json({ error: "Error: Internal Server Error" });
  }
}

async function fetchMessagesForConversation(conversation: Conversation, apiKey: string) {
  try {
    const messagesResponse = await axios.get<{ items: Message[] }>(
      `https://conversations.messagebird.com/v1/conversations/${conversation.id}/messages`,
      { headers: { Authorization: `AccessKey ${apiKey}` } }
    );

    const messages = messagesResponse.data.items || [];

    const userReplied = messages.some((msg) => msg.from === "+447778024995");
    const status = userReplied ? "in-progress" : "unread";

    const formattedMessages = messages.map((msg) => {
      const isInteractive = msg.content?.interactive;
      const isButtonReply = isInteractive && msg.content?.interactive?.type === "button_reply";

      let contentText: string;
      if (isButtonReply) {
        contentText = msg.content?.interactive?.reply?.text ?? "No content";
      } else if (isInteractive) {
        contentText = msg.content?.interactive?.body?.text ?? "No content";
      } else {
        contentText = msg.content?.text ?? "No content";
      }

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
        content: responseText,
        buttons: isInteractive
          ? msg.content?.interactive?.action?.buttons?.map((btn) => ({
              id: btn.id,
              title: btn.title,
              selected: btn.selected || false,
            })) ?? []
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
    console.error('fetchMessagesForConversation error:', error);
    return { ...conversation, messages: [], status: "error" };
  }
}
