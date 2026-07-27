import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { IoIosArrowForward } from "react-icons/io";
import axiosInstance from "@/axios";
import { SuccessToast, ErrorToast } from "@/components/ui/toaster";
import { useAuthMe } from "@/lib/hooks/queries/useQueries";
import { useAuthContext } from "@/lib/context/AuthProvider";

const NotificationSettings = () => {
  const { data: authMeData, refetch } = useAuthMe();
  const authContext = useAuthContext();
  const user = authMeData?.user || authMeData || authContext?.user || {};

  const isNotificationEnabled = user?.isNotificationEnabled ?? true;

  const [toggles, setToggles] = useState([
    { id: 1, title: "Notifications", value: isNotificationEnabled },
  ]);

  useEffect(() => {
    setToggles((prev) =>
      prev.map((t) =>
        t.id === 1 ? { ...t, value: isNotificationEnabled } : t
      )
    );
  }, [isNotificationEnabled]);

  // control dialog open state
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function toggleItem(id) {
    const currentItem = toggles.find((t) => t.id === id);
    if (!currentItem || loading) return;
    const newValue = !currentItem.value;

    setToggles((prev) =>
      prev.map((t) => (t.id === id ? { ...t, value: newValue } : t))
    );

    try {
      setLoading(true);
      const response = await axiosInstance.patch("notifications", {
        notifications: newValue,
      });
      SuccessToast(
        response?.data?.message || `Notifications turned ${newValue ? "ON" : "OFF"}`
      );
      if (refetch) await refetch();
      if (authContext?.refetchAuth) await authContext.refetchAuth();
    } catch (error) {
      console.error("Failed to update notification settings:", error);
      setToggles((prev) =>
        prev.map((t) => (t.id === id ? { ...t, value: currentItem.value } : t))
      );
      ErrorToast(
        error?.response?.data?.message || "Failed to update notification settings."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button className="w-full border-b flex items-center justify-between p-6 cursor-pointer hover:bg-gray-50">
          <p>Notification Settings</p>
          <IoIosArrowForward size={24} />
        </button>
      </DialogTrigger>

      <DialogContent className="min-w-3xl max-w-full">
        <DialogHeader className="pt-2">
          <DialogTitle className="text-3xl">Notification Settings</DialogTitle>
          <DialogDescription className="mt-2 text-base text-gray-600">
            Toggle notifications on or off.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-8 space-y-4">
          {toggles.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between bg-gray-50 rounded-xl p-4"
            >
              <div>
                <p className="font-medium">{t.title}</p>
              </div>

              <div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={t.value}
                    onChange={() => toggleItem(t.id)}
                    disabled={loading}
                    className="sr-only"
                  />
                  <span
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                      t.value ? "bg-green-400" : "bg-gray-300"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <span
                      className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                        t.value ? "translate-x-6" : "translate-x-0"
                      }`}
                    />
                  </span>
                </label>
              </div>
            </div>
          ))}
        </div>

        <DialogClose />
      </DialogContent>
    </Dialog>
  );
};

export default NotificationSettings;
