"use client";
import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { Send, Search, Loader2, MessageSquare, Wifi, WifiOff } from "lucide-react";
import { Button } from "../ui/button";
import { useGetChats } from "@/lib/hooks/queries/useChats";
import { useGetBartenders } from "@/lib/hooks/queries/useBartenders";
import {
  useInitiateChat,
  useSendMessage,
} from "@/lib/hooks/mutations/ChatMutations";
import { useSocket } from "@/lib/hooks/useSocket";
import axiosInstance from "@/axios";
import { useQueryClient } from "@tanstack/react-query";
import { format, isToday, isYesterday } from "date-fns";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getInitials = (name = "") => {
  if (!name) return "??";
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
};

const formatTime = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, "hh:mm a");
  if (isYesterday(d)) return "Yesterday";
  return format(d, "MMM d");
};

const formatMessageTime = (dateStr) => {
  if (!dateStr) return "";
  return format(new Date(dateStr), "hh:mm a");
};

const groupMessagesByDate = (messages) => {
  const groups = [];
  let currentDate = null;
  messages.forEach((msg) => {
    const d = new Date(msg.createdAt);
    let label;
    if (isToday(d)) label = "Today";
    else if (isYesterday(d)) label = "Yesterday";
    else label = format(d, "MMMM d, yyyy");
    if (label !== currentDate) {
      groups.push({ type: "label", label });
      currentDate = label;
    }
    groups.push({ type: "message", ...msg });
  });
  return groups;
};

// ─── Avatar Component ─────────────────────────────────────────────────────────
function Avatar({ name, img, size = "md" }) {
  const [imgError, setImgError] = useState(false);
  const sizeClass = size === "sm" ? "w-9 h-9 text-xs" : "w-11 h-11 text-sm";

  if (img && !imgError) {
    return (
      <img
        src={img}
        alt={name}
        onError={() => setImgError(true)}
        className={`${sizeClass} rounded-full object-cover flex-shrink-0`}
      />
    );
  }
  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center text-white font-semibold flex-shrink-0`}
    >
      {getInitials(name)}
    </div>
  );
}

// ─── Chat List Item ───────────────────────────────────────────────────────────
function ChatListItem({ item, isSelected, onClick }) {
  const name =
    item.otherParticipant?.details?.fullName ||
    item.otherParticipant?.details?.firstName ||
    item.otherParticipant?.details?.name ||
    "Unknown";
  const img =
    item.otherParticipant?.details?.profileImage ||
    item.otherParticipant?.details?.profilePicture;
  const lastMsg = item.lastMessage?.payload?.text || "";
  const time = formatTime(item.updatedAt || item.createdAt);
  const unread = item.unreadCount || 0;

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-gray-50 border-l-4 ${isSelected
        ? "border-indigo-950 bg-gray-50"
        : "border-transparent"
        }`}
    >
      <Avatar name={name} img={img} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-0.5">
          <h3
            className={`text-sm truncate ${unread > 0 ? "font-bold text-gray-900" : "font-medium text-gray-800"
              }`}
          >
            {name}
          </h3>
          <span className="text-[11px] text-gray-400 ml-2 flex-shrink-0">
            {time}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p
            className={`text-xs truncate max-w-[140px] ${unread > 0 ? "text-gray-700 font-medium" : "text-gray-500"
              }`}
          >
            {lastMsg || "Start a conversation"}
          </p>
          {unread > 0 && (
            <span className="ml-2 w-5 h-5 rounded-full bg-indigo-900 text-white text-[10px] flex items-center justify-center font-bold flex-shrink-0">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Bartender-only item (no existing chat yet) ───────────────────────────────
function BartenderInitItem({ bartender, onClick }) {
  const name = bartender.fullName || bartender.name || "Unknown";
  const img = bartender.profileImage || bartender.profilePicture;

  return (
    <div
      onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 cursor-pointer transition-all hover:bg-gray-50 border-l-4 border-transparent"
    >
      <Avatar name={name} img={img} />
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-medium text-gray-800 truncate">{name}</h3>
        <p className="text-xs text-gray-400">Tap to start chat</p>
      </div>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, isOwn, selectedUser }) {
  const name =
    selectedUser?.otherParticipant?.details?.fullName ||
    selectedUser?.otherParticipant?.details?.firstName ||
    "User";
  const img =
    selectedUser?.otherParticipant?.details?.profileImage ||
    selectedUser?.otherParticipant?.details?.profilePicture;

  return (
    <div className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
      {!isOwn && <Avatar name={name} img={img} size="sm" />}
      <div className={`flex flex-col ${isOwn ? "items-end" : "items-start"} max-w-[65%]`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isOwn
            ? "bg-gradient text-white rounded-tr-none"
            : "bg-[#E6E6E6] text-gray-900 rounded-tl-none"
            }`}
        >
          {msg.payload?.text || msg.text || ""}
        </div>
        <span className="text-[11px] text-gray-400 mt-1 px-1">
          {formatMessageTime(msg.createdAt)}
          {/* {isOwn && (
            <span className="ml-1">
              {msg.isRead ? " ✓✓" : msg.isDelivered ? " ✓✓" : " ✓"}
            </span>
          )} */}
        </span>
      </div>
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-8 gap-4">
      <div className="w-20 h-20 rounded-full bg-indigo-50 flex items-center justify-center">
        <MessageSquare className="w-10 h-10 text-indigo-300" />
      </div>
      <div>
        <p className="text-gray-700 font-semibold text-lg">No conversation selected</p>
        <p className="text-gray-400 text-sm mt-1">
          Choose a user or bartender from the list to start messaging
        </p>
      </div>
    </div>
  );
}

// ─── Main ChatUI ──────────────────────────────────────────────────────────────
export default function ChatUI() {
  const queryClient = useQueryClient();

  // ── State ──
  const [activeTab, setActiveTab] = useState("users");
  const [selectedChat, setSelectedChat] = useState(null); // full chat object
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const messagesEndRef = useRef(null);
  const activeChatIdRef = useRef(null);

  // ── Data Hooks ──
  const {
    data: chats = [],
    isLoading: chatsLoading,
    refetch: refetchChats,
  } = useGetChats();

  const { data: bartendersData, isLoading: bartendersLoading } =
    useGetBartenders({ limit: 100 });
  const allBartenders = bartendersData?.data || [];

  // ── Mutation Hooks ──
  const initiateChat = useInitiateChat();
  const sendMessageMutation = useSendMessage();

  // ── Socket ──
  const { socketRef, isConnected } = useSocket();

  // ── Derived: split chats by type ──
  const userChats = useMemo(
    () =>
      chats.filter(
        (c) =>
          c.otherParticipant?.model === "User" ||
          c.type === "USER_LOUNGE_MANAGER",
      ),
    [chats],
  );

  const bartenderChats = useMemo(
    () =>
      chats.filter(
        (c) =>
          c.otherParticipant?.model === "Bartender" ||
          c.type === "BARTENDER_LOUNGE_MANAGER",
      ),
    [chats],
  );

  // Bartenders who don't have a chat yet (for proactive initiation)
  const bartendersWithChatIds = useMemo(() => {
    return new Set(
      bartenderChats
        .map((c) =>
          c.otherParticipant?.id?.toString() ||
          c.otherParticipant?.details?._id?.toString(),
        )
        .filter(Boolean),
    );
  }, [bartenderChats]);

  const bartendersWithoutChat = useMemo(
    () =>
      allBartenders.filter(
        (b) => !bartendersWithChatIds.has(b._id?.toString()),
      ),
    [allBartenders, bartendersWithChatIds],
  );

  // ── Search filter ──
  const filteredUserChats = useMemo(() => {
    if (!searchQuery) return userChats;
    const q = searchQuery.toLowerCase();
    return userChats.filter((c) => {
      const name =
        c.otherParticipant?.details?.fullName ||
        c.otherParticipant?.details?.firstName ||
        "";
      return name.toLowerCase().includes(q);
    });
  }, [userChats, searchQuery]);

  const filteredBartenderChats = useMemo(() => {
    if (!searchQuery) return bartenderChats;
    const q = searchQuery.toLowerCase();
    return bartenderChats.filter((c) => {
      const name =
        c.otherParticipant?.details?.fullName ||
        c.otherParticipant?.details?.firstName ||
        "";
      return name.toLowerCase().includes(q);
    });
  }, [bartenderChats, searchQuery]);

  const filteredBartendersWithoutChat = useMemo(() => {
    if (!searchQuery) return bartendersWithoutChat;
    const q = searchQuery.toLowerCase();
    return bartendersWithoutChat.filter((b) =>
      (b.fullName || b.name || "").toLowerCase().includes(q),
    );
  }, [bartendersWithoutChat, searchQuery]);

  // ── Load messages for a chat ──
  const loadMessages = useCallback(async (chatId) => {
    setIsLoadingMessages(true);
    try {
      const { data } = await axiosInstance.get(
        `/chats/${chatId}/messages?page=1&limit=50`,
      );
      const msgs = data?.data || [];
      const sorted = [...msgs].sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
      );
      setMessages(sorted);
    } catch (err) {
      console.error("Failed to load messages:", err);
      setMessages([]);
    } finally {
      setIsLoadingMessages(false);
    }
  }, []);

  // ── Scroll to bottom ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ── Socket event listeners ──
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket) return;

    const handleNewMessage = (message) => {
      const incomingChatId = message.chatId?.toString() || message.chat?.toString();
      // Append to current conversation
      if (incomingChatId === activeChatIdRef.current) {
        setMessages((prev) => {
          // If message already exists in state, don't duplicate
          if (prev.some((m) => m._id === message._id)) {
            return prev;
          }
          // If an optimistic message exists for this text, replace it
          const optimisticIndex = prev.findIndex(
            (m) =>
              typeof m._id === "string" &&
              m._id.startsWith("optimistic-") &&
              (m.payload?.text === message.payload?.text || m.text === message.text)
          );
          if (optimisticIndex !== -1) {
            const updated = [...prev];
            updated[optimisticIndex] = {
              ...message,
              isOwn:
                message.senderModel === "LoungeManager" ||
                message.sender?.model === "LoungeManager",
            };
            return updated.sort(
              (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
            );
          }
          // Otherwise append and sort chronologically
          return [...prev, message].sort(
            (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
          );
        });
        // If we're viewing this chat, it's already read — emit mark_as_read
        socket.emit("mark_as_read", { chatId: incomingChatId });
      }
      // Always refresh the chat list to update unread counts + last message
      refetchChats();
    };

    const handleMarkAsRead = ({ chatId }) => {
      if (chatId?.toString() === activeChatIdRef.current) {
        setMessages((prev) =>
          prev.map((m) => ({ ...m, isRead: true, isDelivered: true })),
        );
      }
      refetchChats();
    };

    socket.on("new_message", handleNewMessage);
    socket.on("mark_as_read", handleMarkAsRead);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("mark_as_read", handleMarkAsRead);
    };
  }, [socketRef.current, refetchChats]);

  // ── Select a chat (from existing chat list) ──
  const handleSelectChat = useCallback(
    async (chat) => {
      const socket = socketRef.current;

      // Leave previous chat
      if (activeChatIdRef.current && socket) {
        socket.emit("leave_chat", { chatId: activeChatIdRef.current });
      }

      const chatId = chat._id?.toString();
      setSelectedChat(chat);
      activeChatIdRef.current = chatId;
      setMessages([]);

      // Enter new chat via socket (marks as read)
      if (socket) {
        socket.emit("enter_chat", { chatId }, (res) => {
          if (!res?.success) {
            console.warn("enter_chat failed:", res?.error);
          }
        });
      }

      await loadMessages(chatId);

      // Optimistically clear unread in UI
      queryClient.setQueryData(["chats-list"], (old) =>
        (old || []).map((c) =>
          c._id?.toString() === chatId ? { ...c, unreadCount: 0 } : c,
        ),
      );
    },
    [socketRef, loadMessages, queryClient],
  );

  // ── Initiate new chat with a bartender ──
  const handleInitiateBartenderChat = useCallback(
    async (bartender) => {
      try {
        const result = await initiateChat.mutateAsync({
          bartenderId: bartender._id,
        });
        // result is the new/existing chat object
        if (result) {
          await refetchChats();
          // Find the newly created chat in the refreshed list and select it
          const updatedChats = queryClient.getQueryData(["chats-list"]) || [];
          const newChat = updatedChats.find(
            (c) => c._id?.toString() === result._id?.toString(),
          );
          if (newChat) {
            handleSelectChat(newChat);
          } else {
            // fallback: use the returned chat directly
            handleSelectChat(result);
          }
        }
      } catch (err) {
        console.error("Failed to initiate chat:", err);
      }
    },
    [initiateChat, refetchChats, queryClient, handleSelectChat],
  );

  // ── Send message ──
  const handleSendMessage = useCallback(
    async (e) => {
      e?.preventDefault();
      const trimmed = inputText.trim();
      if (!trimmed || !selectedChat || isSending) return;

      const chatId = selectedChat._id?.toString();
      setInputText("");
      setIsSending(true);

      // Optimistic message
      const optimisticMsg = {
        _id: `optimistic-${Date.now()}`,
        chatId,
        payload: { text: trimmed },
        isOwn: true,
        isDelivered: false,
        isRead: false,
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) =>
        [...prev, optimisticMsg].sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt),
        ),
      );

      try {
        const sentMessage = await sendMessageMutation.mutateAsync({
          chatId,
          text: trimmed,
          type: "TEXT",
        });
        // Replace optimistic with real message (or remove optimistic if real message was already added via socket)
        setMessages((prev) => {
          const alreadyAdded = prev.some((m) => m._id === sentMessage._id);
          if (alreadyAdded) {
            return prev.filter((m) => m._id !== optimisticMsg._id);
          }
          return prev
            .map((m) =>
              m._id === optimisticMsg._id ? { ...sentMessage, isOwn: true } : m,
            )
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        });
        refetchChats();
      } catch (err) {
        console.error("Failed to send message:", err);
        // Remove optimistic on failure
        setMessages((prev) =>
          prev.filter((m) => m._id !== optimisticMsg._id),
        );
        setInputText(trimmed);
      } finally {
        setIsSending(false);
      }
    },
    [inputText, selectedChat, isSending, sendMessageMutation, refetchChats],
  );

  // ── Handle Enter key ──
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // ── Tab switch: clear selection ──
  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    setSearchQuery("");
    if (selectedChat) {
      const socket = socketRef.current;
      if (socket && activeChatIdRef.current) {
        socket.emit("leave_chat", { chatId: activeChatIdRef.current });
      }
      setSelectedChat(null);
      setMessages([]);
      activeChatIdRef.current = null;
    }
  };

  // ── Group messages for rendering ──
  const groupedMessages = useMemo(
    () => groupMessagesByDate(messages),
    [messages],
  );

  const selectedChatName =
    selectedChat?.otherParticipant?.details?.fullName ||
    selectedChat?.otherParticipant?.details?.firstName ||
    selectedChat?.otherParticipant?.details?.name ||
    "";

  const selectedChatImg =
    selectedChat?.otherParticipant?.details?.profileImage ||
    selectedChat?.otherParticipant?.details?.profilePicture;

  // ── Render ──
  return (
    <div className="flex bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 h-[calc(100vh-160px)] mt-4">
      {/* ── Left Sidebar ── */}
      <div className="w-80 bg-white border-r border-gray-100 flex flex-col flex-shrink-0">
        {/* Search */}
        <div className="p-3 border-b border-gray-100">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="w-full pl-9 pr-4 py-2.5 bg-gray-50 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 border border-transparent focus:border-indigo-200 transition-all"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="p-3 border-b border-gray-100">
          <div className="flex gap-1  rounded-md bg-gray-200 p-1">
            <button
              onClick={() => handleTabSwitch("users")}
              className={`flex-1 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === "users"
                ? "bg-primary text-white"
                : "bg-white text-[#181818] hover:bg-white"
                }`}
            >
              Users
              {userChats.some((c) => c.unreadCount > 0) && (
                <span className="ml-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] inline-flex items-center justify-center">
                  {userChats.reduce((s, c) => s + (c.unreadCount || 0), 0)}
                </span>
              )}
            </button>
            <button
              onClick={() => handleTabSwitch("bartenders")}
              className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${activeTab === "bartenders"
                ? "bg-primary text-white"
                : "bg-white text-[#181818] hover:bg-white"
                }`}
            >
              Work Force
              {bartenderChats.some((c) => c.unreadCount > 0) && (
                <span className="ml-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] inline-flex items-center justify-center">
                  {bartenderChats.reduce(
                    (s, c) => s + (c.unreadCount || 0),
                    0,
                  )}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === "users" ? (
            chatsLoading ? (
              <div className="flex items-center justify-center h-32 text-gray-400">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                <span className="text-sm">Loading chats...</span>
              </div>
            ) : filteredUserChats.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-gray-400 px-6 text-center">
                <MessageSquare className="w-8 h-8 mb-2 text-gray-300" />
                <p className="text-sm">No user conversations yet</p>
                <p className="text-xs mt-1 text-gray-300">
                  Users appear here when they message you first
                </p>
              </div>
            ) : (
              filteredUserChats.map((chat) => (
                <ChatListItem
                  key={chat._id}
                  item={chat}
                  isSelected={selectedChat?._id?.toString() === chat._id?.toString()}
                  onClick={() => handleSelectChat(chat)}
                />
              ))
            )
          ) : (
            <>
              {/* Existing bartender chats */}
              {chatsLoading ? (
                <div className="flex items-center justify-center h-20 text-gray-400">
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  <span className="text-sm">Loading...</span>
                </div>
              ) : (
                filteredBartenderChats.map((chat) => (
                  <ChatListItem
                    key={chat._id}
                    item={chat}
                    isSelected={
                      selectedChat?._id?.toString() === chat._id?.toString()
                    }
                    onClick={() => handleSelectChat(chat)}
                  />
                ))
              )}

              {/* Divider — bartenders without chat */}
              {filteredBartendersWithoutChat.length > 0 && (
                <>
                  {filteredBartenderChats.length > 0 && (
                    <div className="px-4 py-2 bg-gray-50 border-y border-gray-100">
                      <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">
                        Start a new conversation
                      </p>
                    </div>
                  )}
                  {bartendersLoading ? (
                    <div className="flex items-center justify-center h-16 text-gray-400">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  ) : (
                    filteredBartendersWithoutChat.map((b) => (
                      <BartenderInitItem
                        key={b._id}
                        bartender={b}
                        onClick={() => handleInitiateBartenderChat(b)}
                      />
                    ))
                  )}
                </>
              )}

              {!chatsLoading &&
                !bartendersLoading &&
                filteredBartenderChats.length === 0 &&
                filteredBartendersWithoutChat.length === 0 && (
                  <div className="flex flex-col items-center justify-center h-32 text-gray-400 px-6 text-center">
                    <p className="text-sm">No bartenders found</p>
                  </div>
                )}
            </>
          )}
        </div>

        {/* Socket status indicator */}
        {/* <div className="px-4 py-2 border-t border-gray-100 flex items-center gap-1.5">
          {isConnected ? (
            <>
              <Wifi className="w-3 h-3 text-green-500" />
              <span className="text-[11px] text-green-600">Live</span>
            </>
          ) : (
            <>
              <WifiOff className="w-3 h-3 text-gray-400" />
              <span className="text-[11px] text-gray-400">Connecting...</span>
            </>
          )}
        </div> */}
      </div>

      {/* ── Right Chat Area ── */}
      <div className="flex-1 flex flex-col bg-gray-50">
        {selectedChat ? (
          <>
            {/* Header */}
            <div className="bg-white border-b border-gray-100 px-5 py-3.5 flex items-center gap-3 flex-shrink-0">
              <Avatar name={selectedChatName} img={selectedChatImg} />
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {selectedChatName}
                </h2>
                {/* <p className="text-[11px] text-gray-400">
                  {selectedChat.type === "BARTENDER_LOUNGE_MANAGER"
                    ? "Bartender"
                    : "User"}
                </p> */}
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {isLoadingMessages ? (
                <div className="flex items-center justify-center h-full text-gray-400">
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                  <span className="text-sm">Loading messages...</span>
                </div>
              ) : groupedMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center text-gray-400">
                    <MessageSquare className="w-10 h-10 mx-auto mb-2 text-gray-200" />
                    <p className="text-sm">No messages yet</p>
                    <p className="text-xs mt-1">Be the first to say something!</p>
                  </div>
                </div>
              ) : (
                groupedMessages.map((item, idx) =>
                  item.type === "label" ? (
                    <div key={`label-${idx}`} className="flex justify-center my-2">
                      <span className="px-3 py-1 bg-gray-200 text-gray-800 text-xs rounded-sm">
                        {item.label}
                      </span>
                    </div>
                  ) : (
                    <MessageBubble
                      key={item._id || idx}
                      msg={item}
                      isOwn={
                        item.isOwn ||
                        item.senderModel === "LoungeManager" ||
                        item.sender?.model === "LoungeManager"
                      }
                      selectedUser={selectedChat}
                    />
                  ),
                )
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white border-t border-gray-100 px-4 py-3 flex-shrink-0">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-indigo-300 transition-all"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  disabled={isSending}
                  className="flex-1 text-sm bg-transparent focus:outline-none text-gray-800 placeholder-gray-400"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim() || isSending}
                  className="w-9 h-9 bg-indigo-900 text-white rounded-lg flex items-center justify-center hover:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-all flex-shrink-0"
                >
                  {isSending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </button>
              </form>
            </div>
          </>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
