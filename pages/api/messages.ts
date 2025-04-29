import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface MessageContent {
  text?: string;
  interactive?: {
    type: string;
    body?: { text: string };
    reply?: { id: string; text: string };
    action?: {
      buttons?: Array<{
        id: string;
        title: string;
        selected?: boolean;
      }>;
    };
  };
}

interface Message {
  id: string;
  from: string;
  to: string;
  content: MessageContent;
  type: string;
  createdDatetime: string;
  status?: string;
  error?: { code: string; description: string };
  buttons?: Array<{ id: string; title: string; selected?: boolean }>;
}

interface Conversation {
  id: string;
  contact?: { displayName?: string };
}

interface ExtendedConversation extends Conversation {
  messages: FormattedMessage[];
  status: string;
  hasUndeliverableMessages: boolean;
}

interface FormattedMessage {
  id: string;
  conversationId: string;
  from: {
    name: string;
    phoneNumber: string;
  };
  to: {
    phoneNumber: string;
  };
  content: string;
  type: string;
  isFromUser: boolean;
  buttons: { id: string; title: string; selected: boolean }[];
  timestamp: string;
}

const userNumber = "+447778024995"; // Replace with your number

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
    console.error('Error:', error);
    return res.status(500).json({ error: "Error: Internal Server Error" });
  }
}

async function handleGetConversations(
  req: NextApiRequest,
  res: NextApiResponse,
  apiKey: string
) {
  try {
    const conversationResponse = await axios.get<{ items: Conversation[] }>(
      `https://conversations.messagebird.com/v1/conversations`,
      { headers: { Authorization: `AccessKey ${apiKey}` } }
    );

    const conversations = conversationResponse.data.items || [];

    const conversationsWithMessages: ExtendedConversation[] = await Promise.all(
      conversations.map((conversation) =>
        fetchMessagesForConversation(conversation, apiKey)
      )
    );

    const filteredConversations = conversationsWithMessages.filter(
      (conversation) =>
        !conversation.hasUndeliverableMessages &&
        conversation.messages.some((msg) => msg.from.phoneNumber !== userNumber)
    );

    return res.status(200).json({ conversations: filteredConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({ error: "Error: Failed to fetch conversations" });
  }
}

async function fetchMessagesForConversation(
  conversation: Conversation,
  apiKey: string
): Promise<ExtendedConversation> {
  try {
    const messagesResponse = await axios.get<{ items: Message[] }>(
      `https://conversations.messagebird.com/v1/conversations/${conversation.id}/messages`,
      { headers: { Authorization: `AccessKey ${apiKey}` } }
    );

    const messages = messagesResponse.data.items || [];

    const userReplied = messages.some((msg) => msg.from === userNumber);
    const status = userReplied ? "in-progress" : "unread";

    const hasUndeliverableMessages = messages.some((msg) => msg.status === 'failed');

    const formattedMessages: FormattedMessage[] = messages.map((msg) => {
      const isInteractive = msg.content?.interactive;
      const isButtonReply = msg.content?.interactive?.type === "button_reply";

      let contentText = "No content";

      if (isButtonReply) {
        contentText = msg.content.interactive?.reply?.text || "No content";
      } else if (isInteractive) {
        contentText = msg.content.interactive?.body?.text || "No content";
      } else if (msg.content?.text) {
        contentText = msg.content.text;
      }

      if (msg.status === "failed") {
        console.log(`Message failed with error code: ${msg.error?.code}`);
        console.log(`Error description: ${msg.error?.description}`);
        console.log(`Failed message: ${JSON.stringify(msg)}`);
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
        type: msg.type || "text",
        isFromUser: msg.from === userNumber,
        buttons: isInteractive && Array.isArray(msg.content?.interactive?.action?.buttons)
          ? (msg.content.interactive.action.buttons as { id: string; title: string; selected?: boolean }[]).map((btn) => ({
              id: btn.id,
              title: btn.title,
              selected: btn.selected || false,
            }))
          : [],
        timestamp: msg.createdDatetime,
      };
    });

    return {
      ...conversation,
      messages: formattedMessages,
      status,
      hasUndeliverableMessages,
    };
  } catch (error) {
    console.error(`Error fetching messages for conversation ${conversation.id}:`, error);
    return { ...conversation, messages: [], status: "error", hasUndeliverableMessages: false };
  }
}
