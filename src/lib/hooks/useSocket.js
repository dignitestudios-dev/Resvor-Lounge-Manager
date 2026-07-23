import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Cookies from "js-cookie";
import { baseUrl } from "@/axios";

/**
 * useSocket
 * Connects to the Socket.IO server using the stored JWT token.
 * Returns the socket instance and connection state.
 */
export const useSocket = () => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const token = Cookies.get("token") || Cookies.get("authorization");
    if (!token) return;

    const socket = io(baseUrl, {
      auth: { token: `Bearer ${token}` },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      console.log("Socket connected successfully!");
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      console.log("Socket disconnected");
    });

    socket.on("connect_error", (err) => {
      console.error("Socket connection error:", err.message);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, []);

  return { socket: socketRef.current, isConnected, socketRef };
};
