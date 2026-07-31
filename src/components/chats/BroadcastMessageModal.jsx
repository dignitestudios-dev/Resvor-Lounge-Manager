"use client";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2, Send } from "lucide-react";
import { useBroadcastMessage } from "@/lib/hooks/mutations/ChatMutations";
import { ErrorToast, SuccessToast } from "@/components/ui/toaster";

const BroadcastMessageModal = ({ isOpen, onOpenChange }) => {
  const [text, setText] = useState("");
  const { mutate: sendBroadcast, isPending } = useBroadcastMessage();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;

    sendBroadcast(
      { text: text.trim() },
      {
        onSuccess: (data) => {
          SuccessToast(data?.message || "Broadcast message sent successfully.");
          setText("");
          onOpenChange(false);
        },
        onError: (error) => {
          ErrorToast(
            error?.response?.data?.message || "Failed to send broadcast message."
          );
        },
      }
    );
  };

  const handleOpenChange = (open) => {
    if (isPending) return;
    if (!open) setText("");
    onOpenChange(open);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="max-w-md"
        showCloseButton={!isPending}
        onPointerDownOutside={(e) => {
          if (isPending) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (isPending) e.preventDefault();
        }}
      >
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Broadcast Message
          </DialogTitle>
          <DialogDescription className="mt-1 text-sm text-gray-500">
            Send an announcement or broadcast message.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="mt-2 space-y-4">
          <div className="w-full flex flex-col gap-2">
            <Label className="text-base text-black font-medium">Message</Label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your broadcast message here..."
              rows={5}
              disabled={isPending}
              className="w-full p-3 text-sm border rounded-lg resize-none"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            {/* <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
              className="h-11 px-5 cursor-pointer"
            >
              Cancel
            </Button> */}
            <Button
              type="submit"
              disabled={isPending || !text.trim()}
              className="h-11 px-6 flex items-center gap-2 cursor-pointer"
            >
              {isPending ? (
                <Loader2 className="animate-spin h-4 w-4" />
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Send Broadcast</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default BroadcastMessageModal;
