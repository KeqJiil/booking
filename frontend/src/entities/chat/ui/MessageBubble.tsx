import type { IMessage } from "../model/types";

interface MessageBubbleProps {
  message: IMessage;
  isOwn: boolean;
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div className={`flex ${isOwn ? "justify-end" : "justify-start"} mb-2`}>
      <div className={`w-[70%] p-2 bg-primary rounded-lg`}>
        <p className="text-primary">{message.content}</p>
        <p className="text-primary opacity-70 mt-1 text-right">
          {new Date(message.createdAt).toLocaleTimeString("us-US", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}
