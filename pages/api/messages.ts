import type { NextApiRequest, NextApiResponse } from 'next';
import axios from "axios";

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
    return res.status(500).json({ error: "Error: Internal Server Error" });
  }
}

async function handleGetConversations(req: NextApiRequest, res: NextApiResponse, apiKey: string) {
  try {
    const conversationResponse = await axios.get(
      `https://conversations.messagebird.com/v1/conversations`,
      { headers: { Authorization: `AccessKey ${apiKey}` } }
    );

    const conversations = conversationResponse.data.items || [];

    if (conversations.length === 0) {
      return res.status(200).json({ conversations: [] });
    }

    const conversationsWithMessages = await Promise.all(
      conversations.map((conversation: any) => fetchMessagesForConversation(conversation, apiKey))
    );


    return res.status(200).json({ conversations: conversationsWithMessages });
  } catch (error) {
    return res.status(500).json({ error: "Error: Internal Server Error" });
  }
}

async function fetchMessagesForConversation(conversation: any, apiKey: string) {
  try {
    const messagesResponse = await axios.get(
      `https://conversations.messagebird.com/v1/conversations/${conversation.id}/messages`,
      { headers: { Authorization: `AccessKey ${apiKey}` } }
    );

    const messages = messagesResponse.data.items || [];

    const userReplied = messages.some((msg: any) => msg.from === "+447778024995");

    const status = userReplied ? "in-progress" : "unread";

    const formattedMessages = messages.map((msg: any) => {
      const isInteractive = msg.content?.interactive;
      const isButtonReply = isInteractive && msg.content.interactive.type === "button_reply";

      let contentText;
      if (isButtonReply) {
        contentText = msg.content.interactive.reply.text;
      } else if (isInteractive) {
        contentText = msg.content.interactive.body?.text || "No content";
      } else {
        contentText = msg.content?.text || "No content";
      }

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
    };
  } catch (error) {
    return { ...conversation, messages: [], status: "error" };
  }
}


