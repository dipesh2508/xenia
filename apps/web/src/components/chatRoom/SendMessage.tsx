"use client";
import React, { useState } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { Textarea } from "@repo/ui/components/ui/textarea";
import { SendHorizontal } from "lucide-react";

interface SendMessageProps {
  onSendMessage: (message: string) => void;
  isConnected?: boolean;
  disabled?: boolean;
}

const SendMessage = ({ 
  onSendMessage, 
  isConnected = true, 
  disabled = false 
}: SendMessageProps) => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="sticky bottom-0 bg-chatroom-background p-4 pt-2">
      <div className="relative">
        {!isConnected && (
          <div className="absolute -top-6 left-0 right-0 text-center">
            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded-md">
              Disconnected - Reconnecting...
            </span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Textarea
            placeholder="Write a message..."
            className="min-h-12 max-h-32 resize-none bg-chatroom-input"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled}
          />
          <Button
            size="icon"
            className="rounded-full h-12 w-12 bg-chatroom-accent"
            onClick={handleSend}
            disabled={!message.trim() || disabled}
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SendMessage;
