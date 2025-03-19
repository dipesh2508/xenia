import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@repo/ui/components/ui/avatar";

interface RecieverChatBubbleProps {
  content: string;
  sender?: string;
  avatar?: string | null;
}

const RecieverChatBubble = ({ 
  content, 
  sender = "User", 
  avatar = null 
}: RecieverChatBubbleProps) => {
  return (
    <div className="flex items-start gap-2 max-w-sm">
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatar || ""} alt={sender} />
        <AvatarFallback>
          {sender.charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1">
        <span className="text-xs text-muted-foreground">{sender}</span>
        <div className="bg-white shadow-sm rounded-bl-lg rounded-r-lg p-3 text-sm">
          {content}
        </div>
      </div>
    </div>
  );
};

export default RecieverChatBubble;
