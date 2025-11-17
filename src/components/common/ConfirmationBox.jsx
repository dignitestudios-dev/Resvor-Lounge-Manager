import React from "react";
import { Button } from "@/components/ui/button";
import CustomPopup from "./custom-popup";

const ConfirmationBox = ({
  isOpen,
  onOpenChange,
  title,
  description,
  variant = "delete",
  icon,
  confirmButtonText = "Yes",
  cancelButtonText = "No",
  onConfirm,
  onCancel,
  confirmButtonVariant = "destructive",
  isLoading = false,
}) => {
  const handleCancel = () => {
    if (onCancel) onCancel();
    onOpenChange(false);
  };

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <CustomPopup
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title={title}
      description={description}
      variant={variant}
      icon={icon}
      showTriggerButton={false}
    >
      <div className="flex justify-end gap-3 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
        >
          {cancelButtonText}
        </Button>
        <Button
          type="button"
          variant={confirmButtonVariant}
          onClick={handleConfirm}
          disabled={isLoading}
        >
          {isLoading ? "Processing..." : confirmButtonText}
        </Button>
      </div>
    </CustomPopup>
  );
};

export default ConfirmationBox;
