import { Card } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface InfoCardProps {
  label: string;
  value: string | number;
  monospace?: boolean;
  copyable?: boolean;
}

export const InfoCard = ({ label, value, monospace = false, copyable = false }: InfoCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(String(value));
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-base font-medium ${monospace ? 'font-mono' : ''}`}>
          {value || "—"}
        </span>
        {copyable && value && (
          <button
            onClick={handleCopy}
            className="p-1 hover:bg-muted rounded-md transition-colors"
            aria-label="Copy to clipboard"
          >
            {copied ? (
              <Check className="w-4 h-4 text-success" />
            ) : (
              <Copy className="w-4 h-4 text-muted-foreground" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};
