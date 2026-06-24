"use client";

import { useState, useEffect } from "react";
import LoungeModal from "./LoungeModal";
import CreateLoungeModal from "../lounge-components/CreateLoungeModal";
import { useAuthContext } from "@/lib/context/AuthProvider";

export default function LoungeModalWrapper() {

  const [isOpen, setIsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const fromLogin = localStorage.getItem("fromLogin");

    if (fromLogin === "true") {
      setIsOpen(true);
      localStorage.removeItem("fromLogin");
    }
  }, []);

  if (!isMounted) return null;

  const handleAddLounge = () => {
    setIsOpen(false);
    setIsCreateOpen(true);
  };

  return (
    <>
      <LoungeModal
        isOpen={isOpen}
        onClose={() => {
          setIsOpen(false);
          localStorage.removeItem("fromLogin");
        }}
        onAddLounge={handleAddLounge}
      />
      <CreateLoungeModal
        open={isCreateOpen}
        setOpen={setIsCreateOpen}
        handleNext={() => {
          setIsCreateOpen(false);
        }}
      />
    </>
  );
}
