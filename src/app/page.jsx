"use client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";

const App = () => {
  const router = useRouter();

  useEffect(() => {
    router.push("/auth/login");
  }, []);

  return (
    <div className="flex justify-center items-center h-screen w-screen">
      <Loader2 className="animate-spin" size={32} />
    </div>
  );
};

export default App;
