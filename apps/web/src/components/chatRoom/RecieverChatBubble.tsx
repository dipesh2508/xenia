import React from "react";

const RecieverChatBubble = ({ content }: { content: string }) => {
  return (
    <div className="flex flex-col self-start mt-2 gap-1">
      <div className="rounded-xl bg-chatroom-secondary shadow-sm shadow-primary-1 px-3 py-2 font-medium text-sm">
        {content}
      </div>
      <p className="text-secondary-4 text-left text-xs font-normal tracking-tight">
        Today 11:54
      </p>
    </div>
  );
};

export default RecieverChatBubble;
