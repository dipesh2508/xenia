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
    <div className="sticky bg-chatroom-background px-4 pt-2 border-t border-gray-200 dark:border-gray-800">
      <div className="relative">
        <div className="flex items-center gap-3 p-2 rounded-2xl shadow-sm">
          <Textarea
            placeholder="Write a message..."
            className="min-h-12 max-h-32 resize-none bg-secondary-0 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-3 py-2.5 text-sm"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={disabled || !isConnected}
          />
          <Button
            size="icon"
            className="rounded-full h-10 w-10 bg-chatroom-accent hover:bg-chatroom-accent/90 transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow-md"
            onClick={handleSend}
            disabled={!message.trim() || disabled || !isConnected}
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SendMessage;
