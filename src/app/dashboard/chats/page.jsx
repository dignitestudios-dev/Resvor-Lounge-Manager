"use client";
import React, { useState } from "react";
import ChatUI from "@/components/chats/ChatUI";
import { Button } from "@/components/ui/button";
import BroadcastMessageModal from "@/components/chats/BroadcastMessageModal";

const Chats = () => {
  const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

  return (
    <>
      <div className="flex justify-between items-center gap-10 mt-2">
        <h1 className="section-heading">Messages</h1>

        <div className="flex items-center gap-5">
          <Button
            onClick={() => setIsBroadcastOpen(true)}
            className={" border-2 h-12 text-[14px] px-6 cursor-pointer"}
          >
            Broadcast Message
          </Button>{" "}
        </div>
      </div>
      <ChatUI />
      <BroadcastMessageModal
        isOpen={isBroadcastOpen}
        onOpenChange={setIsBroadcastOpen}
      />
    </>
  );
};

export default Chats;
