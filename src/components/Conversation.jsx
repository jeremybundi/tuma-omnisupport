import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import axios from 'axios';
import { MoreVertical } from 'lucide-react';
import { Paperclip, Smile, Pin, Send } from 'lucide-react';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import Modal from '../components/Modal1'; 
import EscalateIssueModal from '../components/EscalateIssueModal';

export default function Conversation({ selectedChat, setSelectedChat }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const currentUserPhone = '+447778024995';
  const [isModalOpen, setIsModalOpen] = useState(false); 
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const messagesEndRef = useRef(null);

    useEffect(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);


  useEffect(() => {
    if (selectedChat) {
      console.log('Messages received:', selectedChat.messages || []);
      
      // Sort messages by timestamp (oldest to newest)
      const sortedMessages = [...(selectedChat.messages || [])].sort(
        (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
      );
  
      setMessages(sortedMessages);
    }
  }, [selectedChat]);
  

  

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isModalOpen]);

  useEffect(() => {
    if (isModalOpen || isEscalateModalOpen) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
  }, [isModalOpen, isEscalateModalOpen]);

 


  const sendMessage = async () => {
    if (newMessage.trim() === '') {
      console.error('Message is empty');
      return;
    }
  
    if (!selectedChat || !selectedChat.messages || selectedChat.messages.length === 0) {
      console.error('No messages in selected chat.');
      return;
    }
  
    // Extract recipient phone number from the first message in selectedChat
    const recipientPhoneNumber = selectedChat.messages[0]?.to?.phoneNumber;
  
    if (!recipientPhoneNumber) {
      console.error('Recipient phone number is missing.');
      return;
    }
  
    console.log('Sending message to:', recipientPhoneNumber); // Debugging
  
    try {
      const response = await axios.post('/api/sendMessage', {
        recipientPhone: recipientPhoneNumber, // Ensure the correct key is sent
        message: newMessage,
      });
  
      if (response.data.success) {
        const userMsg = {
          id: messages.length + 1,
          sender: 'User',
          content: newMessage,
          timestamp: new Date().toISOString(),
          from: { phoneNumber: currentUserPhone },
          to: { phoneNumber: recipientPhoneNumber },
        };
  
        setMessages([...messages, userMsg]);
        setNewMessage('');
      } else {
        console.error('Failed to send message:', response.data.error);
      }
    } catch (error) {
      console.error('Error sending message:', error.response?.data || error);
    }
  };
  
  
  
  

  const addEmoji = (emoji) => {
    setNewMessage(newMessage + emoji.native);
    setShowEmojiPicker(false);
  };
  const handleCloseChat = () => {
    if (setSelectedChat) {
      setSelectedChat(null);
    } else {
      console.warn('setSelectedChat is not defined.');
    }
  };

  return (
    <div className="flex flex-col h-screen p-4">
      {selectedChat ? (
        <>
          {/* Header */}
          <div className="pb-2 mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src="/images/pic.png"
                alt="User"
                className="w-12 h-12 rounded-full"
              />
            <h2 className="text-lg font-semibold">
              {selectedChat?.messages?.[0]?.to?.phoneNumber || 'Unknown'}
            </h2>
            </div>

            {isModalOpen && (
              <Modal
                closeModal={() => setIsModalOpen(false)}
                closeChat={handleCloseChat}
                openEscalateModal={() => {
                  setIsModalOpen(false);
                  setIsEscalateModalOpen(true);
                }}
              />
            )}

            {isEscalateModalOpen && (
              <EscalateIssueModal
                closeModal={() => setIsEscalateModalOpen(false)}
              />
            )}

            {isEscalateModalOpen && (
              <EscalateIssueModal
                closeModal={() => setIsEscalateModalOpen(false)}
                goBackToModal1={() => {
                  setIsEscalateModalOpen(false);
                  setIsModalOpen(true); 
                }}
              />
            )}

            {/* Three-dot menu */}
            <div className="relative border  rounded-md ">
              <button
                onClick={() => setIsModalOpen(true)}
                className="p-1 hover:bg-slate-50"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex flex-col flex-1 border h-4/5 rounded-2xl overflow-y-auto bg-white  p-4 space-y-3">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex items-center  ${msg.from.phoneNumber === currentUserPhone ? 'justify-end' : 'justify-start'}`}
              >
                {msg.from.phoneNumber === currentUserPhone && (
                  <Image src="/images/mess.png" alt="M" width={40} height={40} className="rounded-full mr-3" />
                )}

                <div
                  className={`max-w-lg p-3 rounded-2xl text-[16px] shadow-md ${
                    msg.from.phoneNumber === currentUserPhone
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-gray-200 text-gray-800 rounded-bl-none'
                  }`}
                >
                  <p className="break-words">{msg.content}</p>
                  <span className="text-xs text-gray-500 block mt-1 text-right">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                  </span>
                </div>

                {msg.from.phoneNumber !== currentUserPhone && (
                  <Image src="/images/mess.png" alt="M" width={40} height={40} className="rounded-full ml-4" />
                )}
              </div>
            ))}

      

            {showEmojiPicker && (
              <div className="absolute bottom-16 right-10 z-10">
                <Picker data={data} onEmojiSelect={addEmoji} />
              </div>
            )}
            </div>

            {/* Message Input - Fixed at the bottom */}
            <div className=" bg-white p-4 border-t flex items-center">
            {/* Input container */}
              <div className="flex items-center flex-1 border rounded px-3 py-5">
                {/* Input Field */}
                <textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onInput={(e) => {
                    e.target.style.height = 'auto';
                    e.target.style.height = `${e.target.scrollHeight}px`;
                  }}
                  rows={1}
                  className="flex-1 bg-transparent px-3 py-2 text-lg focus:outline-none resize-none overflow-hidden"
                  placeholder="Type a message..."
                ></textarea>

                {/* Attach Icon */}
                <button className="text-gray-500 hover:text-gray-700">
                  <Paperclip className="w-7 h-7" />
                </button>

                <button
                  className="text-gray-500 hover:text-gray-700 ml-4"
                  onClick={() => {
                    console.log('Emoji Picker Toggled:', !showEmojiPicker);
                    setShowEmojiPicker(!showEmojiPicker);
                  }}
                >
                  <Smile className="w-7 h-7" />
                </button>

                {/* Location Icon */}
                <button className="text-gray-500 hover:text-gray-700 mx-4">
                  <Pin className="w-7 h-7" />
                </button>
              </div>

              {/* Send Button */}
              <button
                onClick={sendMessage}
                className="bg-blue-600 text-white p-3 rounded-full ml-3"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          
        </>
      ) : (
        <div className="text-gray-500 flex justify-center items-center h-full">
          Select a chat to start a conversation
        </div>
      )}
    </div>
  );
}
