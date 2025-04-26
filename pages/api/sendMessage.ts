import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Error: Method Not Allowed' });
  }

  console.log('Incoming request body:', req.body);

  const { recipientPhone, message }: { recipientPhone: string; message: string } = req.body;

  if (!recipientPhone || !message) {
    console.error('Missing recipientPhone or message:', { recipientPhone, message });
    return res.status(400).json({ error: 'Error: Recipient phone number and message are required.' });
  }

  try {
    const response = await axios.post(
      'https://conversations.messagebird.com/v1/send',
      {
        to: recipientPhone,
        from: process.env.MESSAGEBIRD_CHANNEL_ID,
        type: 'text',
        content: { text: message },
      },
      {
        headers: {
          Authorization: `AccessKey ${process.env.MESSAGEBIRD_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return res.status(200).json({ success: true, response: response.data });
  } catch (error: any) {
    console.error('Message sendingg error:', error.response?.data || error.message || error);
    return res.status(500).json({ success: false, error: error.message || 'Error: Internal Server Error' });
  }
}
