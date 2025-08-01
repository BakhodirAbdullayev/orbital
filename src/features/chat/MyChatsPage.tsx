// src/features/chat/MyChatsPage.tsx
import React, { useEffect, useState, useCallback } from 'react';
import { useChats } from '@/hooks/useChats';
import { useAuth } from '@/contexts/AuthContext';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { useNavigate, useParams } from 'react-router'; // react-router-dom dan import qilish kerak
import { sendMessage } from '@/lib/chatUtils';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { db } from '@/config/firebase';
import type { UserProfile, Chat } from '@/lib/types';
import { useUsers } from '@/hooks/useUsers';

const MyChatsPage: React.FC = () => {
  const { currentUser } = useAuth();
  const { chats, loading: chatsLoading, error: chatsError } = useChats();
  const { users, loading: usersLoading, error: usersError } = useUsers(); // <<<< users va usersLoading ni bu yerda olamiz
  const { dialogId, userId } = useParams<{
    dialogId?: string;
    userId?: string;
  }>();

  const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);
  const [isNewChatMode, setIsNewChatMode] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const processSelection = async () => {
      if (!currentUser || (dialogId === undefined && userId === undefined)) {
        setSelectedChat(null);
        setSelectedUser(null);
        setIsCreatingChat(false);
        setIsNewChatMode(false);
        return;
      }

      setIsCreatingChat(true);

      if (dialogId) {
        const foundChat = chats.find((chat) => chat.id === dialogId);
        setSelectedChat(foundChat || null);

        if (foundChat && users) {
          // <<<< users ga kirish bor joy
          const chatPartnerId = foundChat.members.find(
            (memberId) => memberId !== currentUser.uid
          );
          setSelectedUser(
            users.find((user) => user.uid === chatPartnerId) || null
          );
        } else {
          setSelectedUser(null);
        }
        setIsNewChatMode(false);
      } else if (userId) {
        const userToChatWith = users.find((user) => user.uid === userId); // <<<< users ga kirish bor joy
        setSelectedUser(userToChatWith || null);

        if (userToChatWith) {
          const foundChat = chats.find(
            (chat) =>
              chat.members.includes(currentUser.uid) &&
              chat.members.includes(userToChatWith.uid)
          );

          if (foundChat) {
            setSelectedChat(foundChat);
            setIsNewChatMode(false);
            if (dialogId !== foundChat.id) {
              navigate(`/chat/dialog/${foundChat.id}`, { replace: true });
            }
          } else {
            setSelectedChat(null);
            setIsNewChatMode(true);
          }
        } else {
          setSelectedChat(null);
          setIsNewChatMode(false);
        }
      }
      setIsCreatingChat(false);
    };

    if (!chatsLoading && !usersLoading) {
      processSelection();
    }
  }, [
    currentUser,
    dialogId,
    userId,
    chats,
    users, // <<<< users ni dependensiyalarga qo'shish kerak
    chatsLoading,
    usersLoading,
    navigate,
  ]);

  const onCreateAndSendMessage = useCallback(
    async (content: string, receiverUid: string) => {
      if (!currentUser || !selectedUser) {
        console.error(
          'Cannot create chat: currentUser or selectedUser is missing.'
        );
        return;
      }

      setIsCreatingChat(true);

      try {
        const newChatData = {
          members: [currentUser.uid, selectedUser.uid].sort(),
          lastMessage: content,
          lastMessageTimestamp: Timestamp.now(),
          createdAt: Timestamp.now(),
        };
        const docRef = await addDoc(collection(db, 'chats'), newChatData);
        const createdChat: Chat = { id: docRef.id, ...newChatData };
        setSelectedChat(createdChat);

        await sendMessage(
          currentUser.uid,
          createdChat.id,
          receiverUid,
          content
        );

        navigate(`/chat/dialog/${createdChat.id}`, { replace: true });
        setIsNewChatMode(false);
      } catch (error) {
        console.error(
          'Error creating new chat and sending first message:',
          error
        );
        setSelectedChat(null);
      } finally {
        setIsCreatingChat(false);
      }
    },
    [currentUser, selectedUser, navigate]
  );

  const handleSendMessageToExistingChat = async (
    receiverUid: string,
    content: string
  ) => {
    if (currentUser && selectedChat) {
      await sendMessage(currentUser.uid, selectedChat.id, receiverUid, content);
    } else {
      console.error(
        'Cannot send message: currentUser is not logged in or no chat is selected.'
      );
    }
  };

  if (chatsLoading || usersLoading || isCreatingChat) {
    return (
      <div className='flex items-center justify-center h-screen'>
        Loading chat...
      </div>
    );
  }

  if (chatsError || usersError) {
    return (
      <div className='flex items-center justify-center h-screen text-red-500'>
        Error loading data: {chatsError?.message || usersError?.message}
      </div>
    );
  }

  return (
    <>
      {selectedChat || (selectedUser && isNewChatMode) ? (
        <ChatWindow
          selectedChat={selectedChat}
          selectedUser={selectedUser}
          sendMessage={handleSendMessageToExistingChat}
          shouldShowStartChatButton={isNewChatMode}
          onCreateAndSendMessage={onCreateAndSendMessage}
          allUsers={users} // <<<<< users ni prop sifatida uzatamiz
          allUsersLoading={usersLoading} // <<<<< usersLoading ni prop sifatida uzatamiz
        />
      ) : (
        <div className='flex items-center justify-center h-full text-gray-500 dark:text-gray-400'>
          <p>
            Select a user from the left to start a conversation or view a chat.
          </p>
        </div>
      )}
    </>
  );
};

export default MyChatsPage;
