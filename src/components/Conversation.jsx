import { useState, useEffect, useRef } from "react";
import Image from 'next/image';
import { MoreVertical } from "lucide-react";
import { Paperclip, Smile, MapPin, Send } from "lucide-react";
import Picker from "@emoji-mart/react";
import data from "@emoji-mart/data";
import Modal from "../components/Modal1"; // Import Modal component
import EscalateIssueModal from "../components/EscalateIssueModal"; 

//import { AnimatePresence } from "framer-motion";




export default function Conversation({ selectedChat, setSelectedChat }) {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const dropdownRef = useRef(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const currentUser = "User"; // Replace this with actual logged-in user data
  const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);



  useEffect(() => {
    if (selectedChat) {
      setMessages(selectedChat.messages || []);
    }
  }, [selectedChat]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isModalOpen]);


  useEffect(() => {
    if (isModalOpen || isEscalateModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
  }, [isModalOpen, isEscalateModalOpen]);
  


  const sendMessage = () => {
    if (newMessage.trim() === "") return;

    const userMsg = {
      id: messages.length + 1,
      sender: "User",
      message: newMessage,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };

    const botReply = {
      id: messages.length + 2,
      sender: "TUMA Support",
      message: "Thank you for reaching out! We'll assist you shortly.",
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
    };

    setMessages([...messages, userMsg, botReply]);
    setNewMessage("");
  };


  const addEmoji = (emoji) => {
    setNewMessage(newMessage + emoji.native);
    setShowEmojiPicker(false);
  };
  const handleCloseChat = () => {
    if (setSelectedChat) {
      setSelectedChat(null);
    } else {
      console.warn("setSelectedChat is not defined.");
    }
  };
  

  return (
    <div className="flex flex-col h-screen p-4">
      {selectedChat ? (
        <>
          {/* Header */}
          <div className="pb-2 mb-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img src="/images/pic.png" alt="User" className="w-12 h-12 rounded-full" />
              <h2 className="text-lg font-semibold">{selectedChat.sender}</h2>
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
              <EscalateIssueModal closeModal={() => setIsEscalateModalOpen(false)} />
            )}


            {/* Three-dot menu */}
            <div className="relative ">
              <button
                onClick={() => setIsModalOpen(true)} 
                className="p-2"
              >
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>
            
            
          </div>

          {/* Chat Container */}
          <div className="flex flex-col flex-1 border h-4/5 rounded-2xl  bg-white">
            {/* Scrollable messages container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.map((msg, index) => (
                <div key={index} className={`flex items-center ${msg.sender !== currentUser ? "justify-end" : "justify-start"}`}>
                {/* If the message is received, show image on the left */}
                {msg.sender !== currentUser && (
                  <Image src="/images/mess.png" alt="M" width={40} height={40} className="rounded-full mr-3" />
                )}
              
                {/* Message bubble */}
                <div className={`max-w-lg p-3 rounded-2xl text-[16px] shadow-md 
                    ${msg.sender === currentUser 
                      ? "bg-gray-200  text-gray-800  mb-2 rounded-bl-none" 
                      : "bg-blue-600 mb-2 text-white rounded-br-none"}`}>
                  <p className="break-words">{msg.message}</p>
                  <span className="text-xs text-gray-500 block mt-1 text-right">{msg.timestamp}</span>
                </div>
              
                {/* If the message is sent by currentUser, show image on the right */}
                {msg.sender === currentUser && (
                  <Image src="/images/mess.png" alt="M" width={40} height={40} className="rounded-full ml-4" />
                )}
              </div>
              
              ))}
            </div>

            {showEmojiPicker && (
  <div className="absolute bottom-16 right-10 z-10">
    <Picker data={data} onEmojiSelect={addEmoji} />
  </div>
)}

{/* Message Input - Fixed at the bottom */}
<div className="p-4 flex items-center bg-white">
  {/* Input container */}
  <div className="flex items-center flex-1 border rounded px-3 py-5">

    {/* Input Field */}
    <textarea
      value={newMessage}
      onChange={(e) => setNewMessage(e.target.value)}
      onInput={(e) => {
        e.target.style.height = "auto"; 
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
    console.log("Emoji Picker Toggled:", !showEmojiPicker);
    setShowEmojiPicker(!showEmojiPicker);
  }}
>
  <Smile className="w-7 h-7" />
</button>


    {/* Location Icon */}
    <button className="text-gray-500 hover:text-gray-700 mx-4">
      <MapPin className="w-7 h-7" />
    </button>
  </div>

  {/* Send Button */}
  <button onClick={sendMessage} className="bg-blue-600 text-white p-3 rounded-full ml-3">
    <Send className="w-5 h-5" />
  </button>
</div>


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
