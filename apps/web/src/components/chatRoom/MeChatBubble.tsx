import React from "react";

const MeChatBubble = ({ content }: { content: string }) => {
  return (
    <div className="flex flex-col self-end gap-1 mt-2">
      <div className="rounded-xl bg-chatroom-primary shadow-sm px-3 py-2 font-medium text-sm shadow-chatroom-accent/40">
        {content}
      </div>
      <p className="text-secondary-4 text-right text-xs font-normal tracking-tight">
        Today 11:54
      </p>
    </div>
  );
};

export default MeChatBubble;
