import { cn } from "@/lib/utils";
import { User, Bot } from "lucide-react";

interface ChatMessageProps {
  message: string;
  isUser: boolean;
  timestamp?: Date;
  isTyping?: boolean;
}

export function ChatMessage({ message, isUser, timestamp, isTyping }: ChatMessageProps) {
  return (
    <div className={cn(
      "flex gap-3 p-4 animate-fade-in",
      isUser ? "flex-row-reverse" : "flex-row"
    )}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        isUser 
          ? "bg-primary text-primary-foreground" 
          : "bg-card border border-border"
      )}>
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Bot className="w-4 h-4 text-primary" />
        )}
      </div>
      
      <div className={cn(
        "max-w-[80%] rounded-2xl px-4 py-3 shadow-chat",
        isUser 
          ? "bg-chat-bubble-user text-chat-bubble-user-text rounded-br-lg" 
          : "bg-chat-bubble-bot text-chat-bubble-bot-text border border-border rounded-bl-lg"
      )}>
        {isTyping ? (
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-typing"></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-typing" style={{ animationDelay: '0.2s' }}></div>
            <div className="w-2 h-2 bg-muted-foreground rounded-full animate-typing" style={{ animationDelay: '0.4s' }}></div>
          </div>
        ) : (
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        )}
      </div>
      
      {timestamp && (
        <div className="text-xs text-muted-foreground self-end mb-1">
          {timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      )}
    </div>
  );
}