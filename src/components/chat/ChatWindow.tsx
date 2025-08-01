// src/components/chat/ChatWindow.tsx

import React, { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ArrowLeftFromLine } from 'lucide-react';
import { ChatMessageBubble } from './ChatMessageBubble';
import { useAuth } from '@/contexts/AuthContext';
import { useMessages } from '@/hooks/useMessages';
import type { Chat, UserProfile } from '@/lib/types';
import { MessageInput } from './MessageInput';
import { Link } from 'react-router';
import { Button } from '../ui/button';

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
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const getChatPartnerProfile = () => {
    if (!currentUser || !selectedChat) {
      return selectedUser;
    }

    const partnerUid = selectedChat.members.find(
      (uid) => uid !== currentUser.uid
    );
    return allUsers.find((user) => user.uid === partnerUid);
  };

  const chatPartner = getChatPartnerProfile();

  // Helper funksiya: ikkita sana bir kunga tegishli ekanligini tekshiradi
  const isSameDay = (d1: Date, d2: Date) => {
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  };

  // Helper funksiya: sanani formatlaydi
  const formatDate = (date: Date) => {
    const today = new Date();
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };

    if (date.getFullYear() !== today.getFullYear()) {
      options.year = 'numeric';
    }

    return date.toLocaleDateString('en-US', options);
  };

  if (!selectedChat && !selectedUser) {
    return (
      <div className='flex items-center justify-center h-full text-gray-500 dark:text-gray-400'>
        <p>Select a user or chat to start messaging.</p>
      </div>
    );
  }

  return (
    <div className='flex flex-col h-full bg-background'>
      {/* Chat Header */}
      <header className='p-4 border-b dark:border-gray-700 flex items-center'>
        {chatPartner ? (
          <div className='flex items-center gap-3'>
            <Link to='/chat' className='md:hidden block'>
              <Button variant='ghost'>
                <ArrowLeftFromLine size={24} />
              </Button>
            </Link>
            <div className='relative'>
              <Avatar className='h-10 w-10'>
                <AvatarImage
                  src={chatPartner.photoURL || '/placeholder-avatar.jpg'}
                />
                <AvatarFallback>
                  {chatPartner.displayName?.charAt(0).toUpperCase() ||
                    chatPartner.email?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className='absolute bottom-2 right-px size-2.5'>
                {chatPartner.online ? (
                  <span
                    className='inline-block size-2.5 rounded-full bg-primary'
                    title='Online'
                  />
                ) : (
                  <span
                    className='inline-block size-2.5 rounded-full bg-gray-400'
                    title={`Last seen: ${chatPartner.lastOnline
                      ?.toDate()
                      .toLocaleString()}`}
                  />
                )}
              </div>
            </div>
            <div className='flex flex-col'>
              <h2 className='text-lg font-semibold dark:text-white'>
                {chatPartner.displayName || chatPartner.email?.split('@')[0]}
              </h2>
              {chatPartner.online ? (
                <p className='text-primary font-normal text-sm'>Online</p>
              ) : (
                <p className='text-muted-foreground text-xs'>
                  Last seen: {chatPartner.lastOnline?.toDate().toLocaleString()}
                </p>
              )}
            </div>
          </div>
        ) : (
          <h2 className='ml-3 text-lg font-semibold dark:text-white'>
            {selectedUser
              ? selectedUser.displayName || selectedUser.email?.split('@')[0]
              : 'New Chat'}
          </h2>
        )}
      </header>
      {/* Chat Messages */}
      <div className='flex-1 overflow-y-auto p-4 space-y-1 bg-sidebar'>
        {messagesError ? (
          <div className='text-red-500 text-center'>
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

            // Date separator logic
            const currentMessageDate = msg.timestamp.toDate();
            const previousMessageDate =
              index > 0 ? messages[index - 1].timestamp.toDate() : null;

            const shouldShowDateSeparator =
              !previousMessageDate ||
              !isSameDay(currentMessageDate, previousMessageDate);

            return (
              <React.Fragment key={msg.id}>
                <ChatMessageBubble
                  message={msg}
                  isCurrentUser={isCurrentUserMessage}
                  senderProfile={senderProfile}
                  isNextSameUserMessage={
                    isNextSameUserMessage && !shouldShowDateSeparator
                  }
                />
                {shouldShowDateSeparator && (
                  <div className='relative flex justify-center mb-2 mt-4'>
                    <span className='bg-background px-2 text-sm text-gray-500 dark:text-gray-400'>
                      {formatDate(currentMessageDate)}
                    </span>
                  </div>
                )}
              </React.Fragment>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>
      <MessageInput
        key={selectedChat?.id || 'default-chat-input'}
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
