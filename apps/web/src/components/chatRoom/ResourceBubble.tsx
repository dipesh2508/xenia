import React from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@repo/ui/components/ui/avatar";
import { Button } from "@repo/ui/components/ui/button";
import {
  Download,
  FileText,
  Video,
  FileAudio,
  File,
  FileIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ResourceBubbleProps {
  content: string;
  sender?: string;
  avatar?: string | null;
  title?: string;
}

const ResourceBubble = ({
  content,
  sender = "User",
  avatar = null,
  title,
}: ResourceBubbleProps) => {
  // Extract file type to determine display method
  const getFileExtension = (url: string) => {
    if (!url) return "";
    const extension = url.split(".").pop()?.toLowerCase();
    return extension || "";
  };

  const fileExtension = getFileExtension(content);
  const isImage = ["jpg", "jpeg", "png", "gif", "webp", "svg"].includes(
    fileExtension
  );
  const isPdf = fileExtension === "pdf";
  const isVideo = ["mp4", "webm", "ogg", "mov", "avi"].includes(fileExtension);
  const isAudio = ["mp3", "wav", "ogg", "mpeg", "m4a"].includes(fileExtension);

  // Get file type for display
  const getFileType = () => {
    if (isPdf) return "PDF Document";
    if (isVideo) return "Video File";
    if (isAudio) return "Audio File";
    return "Document";
  };

  // Get appropriate icon based on file type
  const getFileIcon = () => {
    if (isPdf) return <FileText size={24} />;
    if (isVideo) return <Video size={24} />;
    if (isAudio) return <FileAudio size={24} />;
    return <File size={24} />;
  };

  return (
    <div className="flex items-start gap-2 max-w-sm mb-4">
      <Avatar className="h-8 w-8">
        <AvatarImage src={avatar || ""} alt={sender} />
        <AvatarFallback>{sender.charAt(0).toUpperCase()}</AvatarFallback>
      </Avatar>
      <div className="flex flex-col gap-1 w-full">
        <span className="text-xs text-muted-foreground">{sender}</span>
        <div className="bg-white shadow-sm rounded-bl-lg rounded-r-lg p-3 text-sm">
          {/* Only show images directly */}
          {isImage && (
            <Link
              href={content || ""}
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-2"
            >
              <Image
                src={content}
                alt={title || "Shared image"}
                className="w-full h-auto rounded-md mb-2"
                width={250}
                height={80}
              />
            </Link>
          )}

          {/* For non-image files*/}
          {!isImage && (
            <Link
              href={content || ""}
              target="_blank"
              rel="noopener noreferrer"
              className="block mb-2"
            >
              <div className="bg-gray-100 p-4 rounded-md flex items-center justify-between">
                <div className="flex items-center">
                  {getFileIcon()}
                  <span className="ml-2">{getFileType()}</span>
                </div>
                <Button size="sm" variant="ghost" className="h-8">
                  <Download size={14} />
                </Button>
              </div>
            </Link>
          )}

          {/* Title display */}
          <h4 className="font-medium mt-3">{title}</h4>

          {/* Download button */}
          <div className="mt-2 flex justify-end">
            <Link
              href={
                `${content?.replace("/upload/", "/upload/fl_attachment/")}` ||
                ""
              }
              download
              rel="noopener noreferrer"
              className="inline-flex items-center text-xs text-gray-600 hover:text-gray-900"
            >
              <Button size="sm" variant="outline" className="h-8 gap-1">
                <Download size={14} />
                Download
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceBubble;
