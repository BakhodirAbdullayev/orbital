// src/components/layout/Sidebar.tsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "@/contexts/AuthContext";
import { useUsers } from "@/hooks/useUsers";
import { useChats } from "@/hooks/useChats";
import type { UserProfile, Chat } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Loader2, Search, X, Settings } from "lucide-react";
import MyChatsItem from "./components/MyChatsItem";
import { ScrollArea, ScrollBar } from "../ui/scroll-area";
import { Input } from "@/components/ui/input";
import Logo from "../logo";
import AllChatsItem from "./components/AllChatsItem";

interface SidebarProps {
  onSelect: (
    selectionType: "user" | "chat",
    id: string,
    chatPartner?: UserProfile
  ) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onSelect }) => {
  // Barcha hook'lar eng yuqorida chaqirilishi kerak
  const { currentUser, signOut: logout } = useAuth();
  const { users, loading: usersLoading, error: usersError } = useUsers();
  const { chats, loading: chatsLoading, error: chatsError } = useChats();
  const navigate = useNavigate();
  // const location = useLocation();

  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // useMemo ham shartli return'lardan oldin chaqirilishi kerak
  const otherUsers = useMemo(() => {
    // otherUsers ni ham useMemo ichiga olishimiz kerak, chunki users o'zgarishi mumkin
    return users.filter((user) => user.uid !== currentUser?.uid);
  }, [users, currentUser]);

  const chatsWithProfiles = useMemo(() => {
    const sortedChats = chats
      .map((chat) => {
        const chatPartnerId = chat.members.find(
          (memberId) => memberId !== currentUser?.uid
        );
        const chatPartner = users.find((user) => user.uid === chatPartnerId);
        if (chatPartner) {
          return { chat, chatPartner };
        }
        return null;
      })
      .filter(Boolean) as { chat: Chat; chatPartner: UserProfile }[];

    sortedChats.sort((a, b) => {
      const timeA = a.chat.lastMessageTimestamp?.toDate() || new Date(0);
      const timeB = b.chat.lastMessageTimestamp?.toDate() || new Date(0);
      return timeB.getTime() - timeA.getTime();
    });
    return sortedChats;
  }, [chats, users, currentUser]); // Qaramliklarni to'g'ri ko'rsatish

  const filteredUsers = useMemo(() => {
    if (!searchTerm) return [];
    return otherUsers.filter(
      (user) =>
        user.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, otherUsers]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  // Endi loading va error holatlarini hook'lar chaqirilgandan keyin tekshiramiz
  if (usersLoading || chatsLoading) {
    return (
      <div className="p-4 flex flex-col h-full bg-background">
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      </div>
    );
  }

  if (usersError || chatsError) {
    return (
      <div className="p-4 text-red-500">
        Error loading: {usersError?.message || chatsError?.message}
      </div>
    );
  }

  // Hozirda qidiruv faolmi yoki "My Chats" ko'rsatilishi kerakligini aniqlash
  const showMyChatsSection = !isSearching;
  const showSearchResultsSection = isSearching && searchTerm.length > 0;

  return (
    <div className="flex flex-col h-full bg-background">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Logo />

        <Button onClick={handleLogout} variant="outline" size="icon">
          <Settings />
        </Button>
      </div>

      <div className="flex w-full h-full">
        {/* Chapdagi faqat My Chats iconi */}
        {/* this section commints for using later */}
        {/* <div className="flex flex-col h-full bg-gray-200 dark:bg-gray-700 border-r dark:border-gray-700">
          <NavLink
            to="/chat"
            end
            className={({ isActive }) =>
              `py-2.5 w-18 flex items-center justify-center flex-col ${
                (isActive && !isSearching) ||
                (location.pathname.startsWith("/chat/dialog/") &&
                  !isSearching) ||
                (!isActive &&
                  !location.pathname.startsWith("/chat/dialog/") &&
                  !isSearching &&
                  !location.pathname.startsWith("/chat/user/"))
                  ? "text-blue-500 bg-gray-300 dark:bg-gray-600"
                  : "text-gray-500 dark:text-gray-400"
              }`
            }
            onClick={() => {
              setIsSearching(false);
              setSearchTerm("");
            }}
          >
            <UserRound />
            <span className="text-xs font-medium mt-1">My chats</span>
          </NavLink>
        </div> */}

        {/* Asosiy kontent maydoni (My Chats yoki Qidiruv Natijalari) */}
        <div className="flex-1 flex flex-col">
          {/* Qidiruv maydoni */}
          <div className="group">
            <div className="mx-4 my-2 flex items-center border rounded-sm px-2 group-focus-within:ring-1 group-focus-within:ring-primary">
              <Search size={18} className="text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search users..."
                className="flex-1 border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 pl-2"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsSearching(e.target.value.length > 0);
                }}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setSearchTerm("");
                    setIsSearching(false);
                  }}
                  aria-label="Clear search"
                  className="rounded-full size-7"
                >
                  <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </Button>
              )}
            </div>
          </div>

          <ScrollArea className="flex-1">
            {/* My Chats ro'yxati */}
            {showMyChatsSection && (
              <div className="my-2">
                <h3 className="text-muted-foreground text-xs font-semibold uppercase px-4 mb-1">
                  My Chats
                </h3>
                {chatsWithProfiles.length === 0 ? (
                  <p className="px-4 text-muted-foreground text-center">
                    No chats yet.
                  </p>
                ) : (
                  chatsWithProfiles.map(({ chat, chatPartner }) => (
                    <MyChatsItem
                      key={chat.id}
                      chatPartner={chatPartner}
                      chat={chat}
                      onSelect={onSelect}
                    />
                  ))
                )}
              </div>
            )}

            {/* Qidiruv natijalari */}
            {showSearchResultsSection && (
              <div className="my-2">
                <h3 className="text-muted-foreground text-xs font-semibold uppercase px-4 mb-1">
                  Search Results
                </h3>
                {filteredUsers.length === 0 ? (
                  <p className="px-4 text-muted-foreground text-center break-all mt-5 leading-5">
                    No users found matching "{searchTerm}"
                  </p>
                ) : (
                  filteredUsers.map((user) => {
                    const existingChat = chats.find(
                      (chat) =>
                        chat.members.includes(currentUser!.uid) &&
                        chat.members.includes(user.uid)
                    );

                    return (
                      <AllChatsItem
                        key={user.uid}
                        user={user}
                        existingChat={existingChat}
                        onSelect={onSelect}
                      />
                    );
                  })
                )}
              </div>
            )}
            <ScrollBar orientation="vertical" />
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};
