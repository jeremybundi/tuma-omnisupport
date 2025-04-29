import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

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

async function handleGetConversations(req: NextApiRequest, res: NextApiResponse, apiKey: string) {
  try {
    // Fetching conversations
    const conversationResponse = await axios.get(
      `https://conversations.messagebird.com/v1/conversations`,
      { headers: { Authorization: `AccessKey ${apiKey}` } }
    );

    const conversations = conversationResponse.data.items || [];

    if (conversations.length === 0) {
      return res.status(200).json({ conversations: [] });
    }

    // Fetching messages for each conversation and filter out undeliverable ones and self-sent messages
    const conversationsWithMessages = await Promise.all(
      conversations.map((conversation: any) => fetchMessagesForConversation(conversation, apiKey))
    );

    // Filter out conversations with undeliverable messages or where the sender is your number
    const filteredConversations = conversationsWithMessages.filter(
      (conversation: any) => 
        !conversation.hasUndeliverableMessages && 
        conversation.messages.some((msg: any) => msg.from !== '+447778024995')
    );

    return res.status(200).json({ conversations: filteredConversations });
  } catch (error) {
    console.error('Error fetching conversations:', error);
    return res.status(500).json({ error: "Error: Failed to fetch conversations" });
  }
}

async function fetchMessagesForConversation(conversation: any, apiKey: string) {
  try {
    // Fetching messages for a specific conversation
    const messagesResponse = await axios.get(
      `https://conversations.messagebird.com/v1/conversations/${conversation.id}/messages`,
      { headers: { Authorization: `AccessKey ${apiKey}` } }
    );

    const messages = messagesResponse.data.items || [];

    // Check if the user (your number) has replied
    const userNumber = "+447778024995"; // Replace with your actual number
    const userReplied = messages.some((msg: any) => msg.from === userNumber);
    const status = userReplied ? "in-progress" : "unread";

    // Check if any message has failed delivery (undeliverable)
    const hasUndeliverableMessages = messages.some((msg: any) => msg.status === 'failed');

    // Format messages and handle errors
    const formattedMessages = messages.map((msg: any) => {
      const isInteractive = msg.content?.interactive;
      const isButtonReply = isInteractive && msg.content.interactive.type === "button_reply";

      let contentText = "No content";

      if (isButtonReply) {
        contentText = msg.content.interactive?.reply?.text || "No content";
      } else if (isInteractive) {
        contentText = msg.content.interactive?.body?.text || "No content";
      } else if (msg.content?.text) {
        contentText = msg.content.text;
      }

      // Handling failed delivery
      if (msg.status === "failed") {
        console.log(`Message failed with error code: ${msg.error.code}`);
        console.log(`Error description: ${msg.error.description}`);
        console.log(`Failed message: ${JSON.stringify(msg)}`);
      }

      // Selecting button if the message is interactive
      const selectedButton = msg.buttons?.find((btn: any) => btn.selected);
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
        buttons: isInteractive
          ? msg.content?.interactive?.action?.buttons?.map((btn: any) => ({
              id: btn.id,
              title: btn.title,
              selected: btn.selected || false,
            })) || []
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
