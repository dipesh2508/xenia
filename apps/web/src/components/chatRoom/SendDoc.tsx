"use client";
import React, { useState, useRef } from "react";
import { Button } from "@repo/ui/components/ui/button";
import { SendHorizontal, FilePlus2, X } from "lucide-react";
import { z } from "zod";
import { toast } from "sonner";
import { Input } from "@repo/ui/components/ui/input";
import { useApi } from "@/hooks/useApi";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];

const fileSchema = z.object({
  file: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, {
      message: `The file is too large. Please choose a file smaller than 5MB.`,
    })
    .refine((file) => ACCEPTED_FILE_TYPES.includes(file.type), {
      message:
        "Please upload a valid file type (JPEG, PNG, WebP, PDF, DOC, DOCX).",
    }),
});

interface SendMessageProps {
  isConnected?: boolean;
  disabled?: boolean;
  communityId?: string;
  handleSend: (
    message: string,
    selectedFile: File,
    communityId: string
  ) => void;
}

const SendDocs = ({
  isConnected = true,
  disabled = false,
  communityId,
  handleSend,
}: SendMessageProps) => {
  const [message, setMessage] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onSubmit = async () => {
    if ((!message.trim() && !selectedFile) || disabled || !isConnected) return;
    if (!communityId) {
      toast.error("Community ID is required", {
        description: "Please provide a valid community ID.",
      });
      return;
    }
    if (!selectedFile) {
      toast.error("File is required", {
        description: "Please select a file to upload.",
      });
      return;
    }

    await handleSend(message, selectedFile as File, communityId as string);
    setMessage("");
    setSelectedFile(null);
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit();
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      fileSchema.parse({ file });
      setSelectedFile(file);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error("File error", {
          description: error.message,
        });
      }
    }

    // Reset the input value to allow selecting the same file again
    e.target.value = "";
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
  };

  return (
    <div className="sticky bg-chatroom-background px-4 pt-2 border-t border-gray-200 dark:border-gray-800">
      <div className="relative">
        {selectedFile && (
          <div className="mb-2 bg-secondary-0/50 p-2 rounded-lg flex items-center justify-between">
            <span className="text-sm truncate max-w-[200px]">
              {selectedFile.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={removeSelectedFile}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="flex items-center gap-3 p-2 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 w-full">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              onChange={handleFileChange}
              accept={ACCEPTED_FILE_TYPES.join(",")}
            />

            <Button
              size="icon"
              variant="ghost"
              className="h-10 w-10 hover:bg-chatroom-accent/20 transition-all duration-200 rounded-full"
              onClick={triggerFileUpload}
              disabled={disabled || !isConnected} // Disable upload button
            >
              <FilePlus2 className="text-indigo-950 text-sm" />
            </Button>

            <Input
              placeholder="Write a message..."
              className="min-h-12 max-h-32 resize-none bg-secondary-0 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 px-3 py-2.5 text-sm"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={disabled} // Disable input
            />
          </div>

          <Button
            size="icon"
            className="rounded-full h-10 w-10 bg-chatroom-accent hover:bg-chatroom-accent/90 transition-all duration-200 flex-shrink-0 shadow-sm hover:shadow-md"
            onClick={onSubmit}
            disabled={
              (!message.trim() && !selectedFile) || disabled || !isConnected
            }
          >
            <SendHorizontal className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SendDocs;
