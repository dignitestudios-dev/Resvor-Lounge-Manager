// components/ui/custom-popup.js
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle2,
  Mail,
  UserPlus,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import { IoCheckmark } from "react-icons/io5";
import { cn } from "@/lib/utils";

const variantIcons = {
  success: CheckCircle2,
  info: Mail,
  warning: AlertTriangle,
  error: AlertTriangle,
  delete: Trash2,
};

const variantColors = {
  primary: "text-primary",
  success: "text-green-500",
  info: "text-blue-500",
  warning: "text-yellow-500",
  error: "text-red-500",
  delete: "text-red-500",
};

const typeIcons = {
  "email-sent": Mail,
  "account-created": UserPlus,
  "delete-confirmation": Trash2,
  success: IoCheckmark,
};

const CustomPopup = ({
  isOpen,
  onOpenChange,
  title,
  description,
  variant = "primary",
  type = "success",
  icon,
  triggerButtonTitle = "Open Dialog",
  onTriggerClick,
  showTriggerButton = false,
  children,
}) => {
  // Determine which icon to use
  const getIcon = () => {
    if (icon) return icon;

    const TypeIcon = typeIcons[type];
    if (TypeIcon)
      return <TypeIcon className={cn("h-6 w-6", variantColors[variant])} />;

    const VariantIcon = variantIcons[variant];
    return <VariantIcon className={cn("h-6 w-6", variantColors[variant])} />;
  };

  return (
    <>
      {showTriggerButton && (
        <button
          onClick={onTriggerClick}
          className={cn(
            "px-4 py-2 rounded-md font-medium transition-colors",
            variant === "success" &&
              "bg-green-500 text-white hover:bg-green-600",
            variant === "info" && "bg-blue-500 text-white hover:bg-blue-600",
            variant === "warning" &&
              "bg-yellow-500 text-white hover:bg-yellow-600",
            variant === "error" && "bg-red-500 text-white hover:bg-red-600",
            variant === "delete" && "bg-red-500 text-white hover:bg-red-600"
          )}
        >
          {triggerButtonTitle}
        </button>
      )}

      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">{getIcon()}</div>
              <div>
                <DialogTitle
                  className={cn("text-2xl font-bold", variantColors[variant])}
                >
                  {title}
                </DialogTitle>
                {description && (
                  <DialogDescription className="text-base mt-2">
                    {description}
                  </DialogDescription>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="mt-4">{children}</div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CustomPopup;
