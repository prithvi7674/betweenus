"use client";

import { useEffect, useRef, useState } from "react";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "@/components/providers/AuthProvider";
import { db } from "@/firebase/firestore";

type ChatMessage = {
  id: string;
  text: string;
  userEmail: string;
  createdAtMs: number | null;
};

function formatTimestamp(createdAtMs: number | null) {
  if (!createdAtMs) {
    return "Just now";
  }

  return new Date(createdAtMs).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function MessagesChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!user) {
      return;
    }

    const messagesQuery = query(
      collection(db, "messages"),
      orderBy("createdAt", "asc"),
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const nextMessages = snapshot.docs
          .map((doc) => {
            const data = doc.data();

            if (
              typeof data.text !== "string" ||
              typeof data.userEmail !== "string"
            ) {
              return null;
            }

            return {
              id: doc.id,
              text: data.text,
              userEmail: data.userEmail,
              createdAtMs:
                typeof data.createdAt?.toMillis === "function"
                  ? data.createdAt.toMillis()
                  : null,
            } satisfies ChatMessage;
          })
          .filter((item): item is ChatMessage => item !== null);

        setMessages(nextMessages);

        window.setTimeout(() => {
          bottomRef.current?.scrollIntoView({ behavior: "smooth" });
        }, 50);
      },
      () => {
        setError("Unable to load messages right now.");
      },
    );

    return unsubscribe;
  }, [user]);

  const sendMessage = async () => {
    if (!input.trim() || !user?.email || isSending) {
      return;
    }

    setError("");
    setIsSending(true);

    try {
      await addDoc(collection(db, "messages"), {
        text: input.trim(),
        userEmail: user.email,
        createdAt: serverTimestamp(),
      });

      setInput("");
    } catch {
      setError("Unable to send your message right now.");
    } finally {
      setIsSending(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-[#FDE2E4] to-[#E7B6F6]">
      <div className="mx-auto flex h-full w-full max-w-md flex-col px-5 pb-36 pt-6">
        <div className="mb-6">
          <h1 className="mb-2 text-4xl font-bold text-[#1C1C1E]">Messages 💌</h1>
          <p className="text-lg text-[#1C1C1E]/60">Stay connected</p>
        </div>

        <div className="flex-1 overflow-y-auto pb-6">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-center text-lg text-[#1C1C1E]/50">
                Start your conversation 💖
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => {
                const isMe = message.userEmail === user.email;

                return (
                  <div
                    key={message.id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`flex max-w-[72%] flex-col gap-1 ${
                        isMe ? "items-end" : "items-start"
                      }`}
                    >
                      <div
                        className={`rounded-2xl px-4 py-3 shadow-sm transition-all duration-200 ${
                          isMe
                            ? "bg-[#EC5C7A] text-white shadow-pink-500/20"
                            : "bg-white/90 text-[#1C1C1E] shadow-black/5 backdrop-blur-sm"
                        }`}
                      >
                        <p className="text-[15px] leading-relaxed">{message.text}</p>
                      </div>
                      <span className="px-2 text-xs text-[#1C1C1E]/40">
                        {formatTimestamp(message.createdAtMs)}
                      </span>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <div className="fixed bottom-24 left-1/2 z-20 w-full max-w-md -translate-x-1/2 px-4">
          <div className="flex items-center gap-3 rounded-full bg-white/90 px-5 py-3 shadow-sm shadow-black/5 backdrop-blur-xl">
            <input
              type="text"
              placeholder="Type a message..."
              value={input}
              onChange={(event) => setInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void sendMessage();
                }
              }}
              className="flex-1 bg-transparent text-[#1C1C1E] outline-none placeholder:text-[#1C1C1E]/40"
            />
            <button
              onClick={() => void sendMessage()}
              disabled={input.trim() === "" || isSending}
              className={`flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#EC5C7A] to-[#D8B4F8] text-white shadow-md shadow-pink-500/30 transition-all duration-200 active:scale-95 ${
                input.trim() === "" || isSending ? "opacity-50" : "opacity-100"
              }`}
              aria-label="Send message"
            >
              <span className="text-sm font-semibold">➤</span>
            </button>
          </div>

          {error ? (
            <div className="mt-3 rounded-2xl bg-[#FDECEF] px-4 py-3 text-sm text-[#B23A55]">
              {error}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
