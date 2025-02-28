import axios from 'axios';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { recipient, message } = req.body;

    if (!recipient || !message) {
      return res.status(400).json({ error: 'Recipient and message are required' });
    }

    const apiKey = process.env.MESSAGEBIRD_API_KEY;
    const channelId = process.env.MESSAGEBIRD_CHANNEL_ID;

    const response = await axios.post(
      'https://conversations.messagebird.com/v1/messages',
      {
        channelId: channelId,
        type: 'text',
        content: { text: message },
        to: recipient,
      },
      {
        headers: {
          'Authorization': `AccessKey ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return res.status(200).json({ success: true, data: response.data });
  } catch (error) {
    console.error('MessageBird API Error:', error.response?.data || error.message);
    return res.status(500).json({ error: 'Failed to send message', details: error.response?.data });
  }
}
