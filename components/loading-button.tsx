"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  loadingText?: string;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function LoadingButton({
  children,
  loading,
  loadingText,
  className,
  variant = "default",
  disabled,
  ...props
}: LoadingButtonProps) {
  const { pending } = useFormStatus();
  const isPending = pending || loading;

  return (
    <Button
      variant={variant}
      className={cn("relative", className)}
      disabled={isPending || disabled}
      {...props}
    >
      {isPending && (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
      )}
      {isPending && loadingText ? loadingText : children}
    </Button>
  );
}
