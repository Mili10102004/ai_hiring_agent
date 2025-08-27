import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
  messages?: any[];
}

export const ChatInput = ({ onSendMessage, disabled, placeholder = "Type your response...", messages }: ChatInputProps) => {
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled, messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 p-4 bg-card border-t border-border">
      <Input
        ref={inputRef}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          "flex-1 bg-background border-border focus:ring-primary",
          "transition-smooth"
        )}
      />
      <Button 
        type="submit" 
        disabled={!message.trim() || disabled}
        className={cn(
          "bg-primary hover:bg-primary-glow text-primary-foreground",
          "transition-smooth shadow-elegant"
        )}
      >
        <Send className="w-4 h-4" />
      </Button>
    </form>
  );
}