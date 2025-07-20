// src/components/chat/ChatWindow.tsx

import React, { useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeftFromLine } from "lucide-react";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { useAuth } from "@/contexts/AuthContext";
import { useMessages } from "@/hooks/useMessages";
import type { Chat, UserProfile } from "@/lib/types";
import { MessageInput } from "./MessageInput";
import { Link } from "react-router";
import { Button } from "../ui/button";

interface ChatWindowProps {
  selectedChat: Chat | null;
  selectedUser: UserProfile | null;
  sendMessage: (receiverUid: string, content: string) => Promise<void>;
  shouldShowStartChatButton?: boolean;
  onCreateAndSendMessage?: (
    content: string,
    receiverUid: string
  ) => Promise<void>;
  allUsers: UserProfile[];
  allUsersLoading: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  selectedChat,
  selectedUser,
  sendMessage,
  shouldShowStartChatButton = false,
  onCreateAndSendMessage,
  allUsers,
  allUsersLoading,
}) => {
  const { currentUser } = useAuth();

  const {
    messages,
    loading: messagesLoading,
    error: messagesError,
  } = useMessages(selectedChat?.id || null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView();
  }, [messages]);

  const getChatPartnerProfile = () => {
    if (!currentUser || !selectedChat || !selectedUser) return null;
    return selectedUser;
  };

  const chatPartner = getChatPartnerProfile();

  if (!selectedChat && !selectedUser) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
        <p>Select a user or chat to start messaging.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <header className="p-4 border-b dark:border-gray-700 flex items-center bg-background">
        {chatPartner ? (
          <div className="flex items-center gap-3">
            <Link to="/chat" className="md:hidden block">
              <Button variant="ghost">
                <ArrowLeftFromLine size={24} />
              </Button>
            </Link>
            <div className="relative">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={chatPartner.photoURL || "/placeholder-avatar.jpg"}
                />
                <AvatarFallback>
                  {chatPartner.displayName?.charAt(0).toUpperCase() ||
                    chatPartner.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="absolute bottom-2 right-px size-2.5">
                {chatPartner.online ? (
                  <span
                    className="inline-block size-2.5 rounded-full bg-primary"
                    title="Online"
                  />
                ) : (
                  <span
                    className="inline-block size-2.5 rounded-full bg-gray-400"
                    title={`Last seen: ${chatPartner.lastOnline?.toLocaleString()}`}
                  />
                )}
              </div>
            </div>
            <div>
              <h2 className="text-lg leading-2 mt-2 font-semibold dark:text-white">
                {chatPartner.displayName || chatPartner.email?.split("@")[0]}
              </h2>
              {chatPartner.online ? (
                <span className="text-primary font-normal text-xs">Online</span>
              ) : (
                <span className="text-muted-foreground text-sm">
                  {chatPartner?.lastOnline?.toLocaleString()}
                </span>
              )}
            </div>
          </div>
        ) : (
          <h2 className="ml-3 text-lg font-semibold dark:text-white">
            {selectedUser
              ? selectedUser.displayName || selectedUser.email?.split("@")[0]
              : "New Chat"}
          </h2>
        )}
      </header>
      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1 bg-sidebar">
        {messagesError ? (
          <div className="text-red-500 text-center">
            Error loading messages: {messagesError.message}
          </div>
        ) : (
          messages.map((msg, index) => {
            const isCurrentUserMessage = msg.senderId === currentUser?.uid;

            const isNextSameUserMessage =
              messages[index + 1] &&
              messages[index + 1].senderId === msg.senderId;

            const senderProfile = isCurrentUserMessage
              ? currentUser
              : allUsers.find((u) => u.uid === msg.senderId);

            if (!senderProfile) {
              console.warn(
                `Sender profile not found for message ID: ${msg.id}, senderId: ${msg.senderId}`
              );

              return null;
            }

            return (
              <ChatMessageBubble
                key={msg.id}
                message={msg}
                isCurrentUser={isCurrentUserMessage}
                senderProfile={senderProfile}
                isNextSameUserMessage={isNextSameUserMessage}
              />
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput
        key={selectedChat?.id || "default-chat-input"}
        onSendMessage={async (content) => {
          if (selectedUser) {
            await sendMessage(selectedUser.uid, content);
          }
        }}
        shouldShowStartChatButton={shouldShowStartChatButton}
        onCreateAndSendMessage={onCreateAndSendMessage}
        receiverUser={selectedUser}
        isDisabled={
          !currentUser ||
          (shouldShowStartChatButton && !selectedUser) ||
          (!shouldShowStartChatButton && !selectedChat) ||
          messagesLoading ||
          allUsersLoading
        }
      />
    </div>
  );
};
