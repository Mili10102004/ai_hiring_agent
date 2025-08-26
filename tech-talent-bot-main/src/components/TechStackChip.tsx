import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface TechStackChipProps {
  tech: string;  
  onRemove?: () => void;
  selected?: boolean;
  onClick?: () => void;
}

export function TechStackChip({ tech, onRemove, selected, onClick }: TechStackChipProps) {
  return (
    <div className={cn(
      "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-smooth",
      "border cursor-pointer hover:shadow-chat",
      selected 
        ? "bg-primary text-primary-foreground border-primary" 
        : "bg-secondary text-secondary-foreground border-border hover:border-primary/50"
    )}
    onClick={onClick}
    >
      <span>{tech}</span>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="hover:bg-white/20 rounded-full p-0.5 transition-smooth"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}