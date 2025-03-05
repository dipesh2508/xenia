import { Input } from "@repo/ui/components/ui/input";
import React from "react";
import { Send } from "lucide-react";

const ChatArea = () => {
  return (
    <div>
      <div className="w-full px-6 py-4">
        <Input placeholder="Type your message" />
        <Send />
      </div>
    </div>
  );
};

export default ChatArea;
