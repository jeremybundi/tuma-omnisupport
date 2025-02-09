
"use client"
import { useState } from "react";
import SideNav from "../components/SideNav";
import Messages from "../components/Messages";
import Conversation from "../components/Conversation";

export default function Page() {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="flex w-full">
      <div className="w-[20%]">
        <SideNav />
      </div>
      <div className="w-[30%] border-r border-r-[#E9EBEE] h-screen flex flex-col">
        <Messages onSelectChat={setSelectedChat} />
      </div>
      <div className="w-[50%] p-4 h-screen flex flex-col">
      <Conversation selectedChat={selectedChat} />
      </div>
    </div>
  );
}
