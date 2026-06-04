"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import LoungeModal from "./LoungeModal";

export default function LoungeModalWrapper() {
  const [isOpen, setIsOpen] = useState(false);
  const searchParams = useSearchParams();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Only open modal if user is coming from login screen
    const fromLogin = searchParams.get("fromLogin");

    if (fromLogin === "true") {
      setIsOpen(true);
    }
  }, [searchParams]);

  if (!isMounted) return null;

  return (
    <LoungeModal
      isOpen={isOpen}
      onClose={() => {
        setIsOpen(false);
      }}
    />
  );
}
