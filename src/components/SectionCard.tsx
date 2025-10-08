import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface SectionCardProps {
  title: string;
  children: ReactNode;
  action?: ReactNode;
}

export const SectionCard = ({ title, children, action }: SectionCardProps) => {
  return (
    <Card className="p-6 border-border bg-card hover:shadow-lg transition-shadow duration-300">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {children}
      </div>
    </Card>
  );
};
