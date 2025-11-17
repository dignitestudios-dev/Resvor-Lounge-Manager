import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogHeader,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { IoIosArrowForward } from "react-icons/io";
import { Button } from "../ui/button";

const NotificationSettings = () => {
  const [toggles, setToggles] = useState([
    { id: 1, title: "Notification title", value: true },
    { id: 2, title: "Notification title", value: true },
    { id: 3, title: "Notification title", value: false },
    { id: 4, title: "Notification title", value: false },
    { id: 5, title: "Notification title", value: false },
  ]);

  // control dialog open state so we can close it programmatically on save
  const [open, setOpen] = useState(false);

  function toggleItem(id) {
    setToggles((prev) =>
      prev.map((t) => (t.id === id ? { ...t, value: !t.value } : t))
    );
  }

  function handleSave() {
    // TODO: persist settings to an API or context
    console.log("Saved notification settings:", toggles);
    // close the modal after saving
    setOpen(false);
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
            Choose which notifications you'd like to receive.
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
                    className="sr-only"
                  />
                  <span
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ${
                      t.value ? "bg-green-400" : "bg-gray-300"
                    }`}
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

        <DialogFooter className="mt-8">
          <div className="w-full flex justify-center">
            <Button onClick={handleSave} className={"w-full max-w-xl"}>
              Save
            </Button>
          </div>
        </DialogFooter>

        <DialogClose />
      </DialogContent>
    </Dialog>
  );
};

export default NotificationSettings;
