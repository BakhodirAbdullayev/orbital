// src/components/chat/ChatMessageBubble.tsx

import React from 'react';

import type { Message, UserProfile } from '@/lib/types'; // Make sure UserProfile is imported

import { cn } from '@/lib/utils';

// Avatar component (or inline JSX) for reusability/readability

const Avatar = ({
  senderProfile,

  isInvisible,
}: {
  senderProfile: UserProfile;

  isInvisible?: boolean;
}) => {
  // Extract avatar URL and display name, with fallbacks

  const avatarUrl = senderProfile.photoURL;

  const displayName =
    senderProfile.displayName || senderProfile.email?.split('@')[0] || 'User';

  const initials = displayName.charAt(0).toUpperCase();

  return (
    <div
      className={cn(
        'flex-shrink-0 w-8 h-8 rounded-full overflow-hidden bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-200',

        {
          'opacity-0': isInvisible,
        }
      )}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={displayName}
          className='w-full h-full object-cover'
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  );
};

interface ChatMessageBubbleProps {
  message: Message;
  isCurrentUser: boolean; // Prop to determine if the message from the current user
  senderProfile: UserProfile; // New prop: The profile of the message sende
  isNextSameUserMessage: boolean;
}

export const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  message,
  isCurrentUser,
  senderProfile, // Destructure the new prop
  isNextSameUserMessage,
}) => {
  return (
    // Adjust the main flex container to align items (avatar and bubble) and add gap

    <div
      className={`flex items-end gap-2 max-w-full relative ${
        isCurrentUser ? 'justify-end' : 'justify-start'
      }`}
    >
      {/* Render avatar on the left for others' messages */}
      {!isCurrentUser && (
        <Avatar
          isInvisible={isNextSameUserMessage}
          senderProfile={senderProfile}
        />
      )}
      {/* Message Bubble */}
      <div
        className={cn(
          `max-w-3/5 p-3 rounded-lg ${
            isCurrentUser
              ? 'bg-primary text-white rounded-br-none'
              : 'bg-gray-200 text-gray-900 dark:bg-gray-600 dark:text-gray-200 rounded-bl-none'
          }`,

          {
            'rounded-b-lg': isNextSameUserMessage,
          }
        )}
      >
        <p className='break-all w-full text-base/tight'>{message.content}</p>

        <span className='text-xs opacity-75 mt-1 block text-right'>
          {message.timestamp &&
          typeof message.timestamp === 'object' &&
          'toDate' in message.timestamp
            ? new Date(message.timestamp.toDate()).toLocaleTimeString([], {
                hour: '2-digit',

                minute: '2-digit',

                hour12: false,
              })
            : ''}
        </span>
      </div>
      {/* Render avatar on the right for current user's messages */}
      {isCurrentUser && (
        <Avatar
          isInvisible={isNextSameUserMessage}
          senderProfile={senderProfile}
        />
      )}
    </div>
  );
};
