import ChatUI from "@/components/chats/ChatUI";
import { Button } from "@/components/ui/button";
import React from "react";

const Chats = () => {
  return (
    <>
      <div className="flex justify-between items-center gap-10 mt-2">
        <h1 className="section-heading">Messages</h1>

        <div className="flex items-center gap-5">
          <Button className={" border-2 h-12 text-[14px] px-6"}>
            Broadcast Message
          </Button>{" "}
        </div>
      </div>

      <ChatUI />
    </>
  );
};

export default Chats;
