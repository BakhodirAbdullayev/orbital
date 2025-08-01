import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Loader2, Smile } from 'lucide-react';
import type { UserProfile } from '@/lib/types';

import EmojiPicker from 'emoji-picker-react';
import { Theme, EmojiStyle } from 'emoji-picker-react';
import { useTheme } from '@/contexts/ThemeContext';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  shouldShowStartChatButton: boolean;
  onCreateAndSendMessage?: (
    content: string,
    receiverUid: string
  ) => Promise<void>;
  receiverUser: UserProfile | null;
  isDisabled: boolean;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  shouldShowStartChatButton,
  onCreateAndSendMessage,
  receiverUser,
  isDisabled,
}) => {
  const { theme } = useTheme();
  const [inputContent, setInputContent] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  const maxRows = 5;
  const minRows = 1;

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputContent]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(event.target as Node)
      ) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSend = async () => {
    if (!inputContent.trim() || isSending || isDisabled) return;

    setIsSending(true);
    setShowEmojiPicker(false);

    try {
      if (shouldShowStartChatButton && onCreateAndSendMessage && receiverUser) {
        await onCreateAndSendMessage(inputContent, receiverUser.uid);
      } else {
        await onSendMessage(inputContent);
      }

      setInputContent('');
      setTimeout(() => adjustTextareaHeight(), 0);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onEmojiClick = (emojiObject: { emoji: string }) => {
    setInputContent((prevContent) => prevContent + emojiObject.emoji);
    textareaRef.current?.focus();
  };

  const sendButtonText = shouldShowStartChatButton
    ? 'Send First Message'
    : 'Send';

  const buttonDisabled = isDisabled || isSending || !inputContent.trim();
  const textareaDisabled = isDisabled || isSending;
  const pickerTheme = theme === 'dark' ? Theme.DARK : Theme.LIGHT;

  return (
    <div className='bg-background py-2 px-4 border-t dark:border-gray-700 flex items-end md:items-center flex-col md:flex-row relative'>
      <div className='flex flex-1 w-full items-end'>
        <Button
          variant='ghost'
          size='icon'
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          disabled={textareaDisabled}
          className='mr-2'
        >
          <Smile className='h-5 w-5' />
        </Button>

        <textarea
          ref={textareaRef}
          placeholder='Write a message...'
          className='flex-1 mr-2 p-2 resize-none overflow-hidden border-none outline-none text-sm/tight bg-transparent'
          value={inputContent}
          onChange={(e) => {
            setInputContent(e.target.value);
          }}
          onKeyPress={handleKeyPress}
          disabled={textareaDisabled}
          rows={minRows}
          style={{ maxHeight: `${maxRows * 24}px` }}
        />
        <Button
          onClick={handleSend}
          disabled={buttonDisabled}
          className='ml-auto md:ml-0'
        >
          {isSending ? (
            <Loader2 className='h-5 w-5 animate-spin' />
          ) : (
            <Send className='h-5 w-5' />
          )}
          {shouldShowStartChatButton && (
            <span className='ml-2 hidden md:inline'>{sendButtonText}</span>
          )}
        </Button>
      </div>

      {showEmojiPicker && (
        <div
          ref={emojiPickerRef}
          className='absolute bottom-full left-0 mb-2 z-10'
        >
          <EmojiPicker
            onEmojiClick={onEmojiClick}
            theme={pickerTheme}
            emojiStyle={EmojiStyle.NATIVE}
          />
        </div>
      )}
    </div>
  );
};
