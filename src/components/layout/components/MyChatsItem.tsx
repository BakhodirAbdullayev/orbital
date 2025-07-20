import type { FC } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { Chat, UserProfile } from "@/lib/types";
import { NavLink } from "react-router";

interface Props {
  chatPartner: UserProfile;
  chat: Chat;
  onSelect: (
    selectionType: "user" | "chat",
    id: string,
    chatPartner?: UserProfile
  ) => void;
}

const MAX_MESSAGE_LENGTH = 32;

const MyChatsItem: FC<Props> = ({ chatPartner, chat, onSelect }) => {
  return (
    <NavLink
      key={chat.id}
      to={`/chat/dialog/${chat.id}`}
      className={({ isActive }) =>
        `flex items-center gap-2 py-3 px-4 hover:bg-muted border-y ${
          isActive
            ? "bg-blue-100 border-blue-300 hover:!bg-blue-200/90 dark:bg-blue-900/60 dark:border-blue-900 dark:hover:!bg-blue-900/70"
            : "border-transparent"
        }`
      }
      onClick={() => onSelect("chat", chat.id, chatPartner)}
    >
      <div className="relative">
        <Avatar>
          <AvatarImage
            src={chatPartner.photoURL || "/placeholder-avatar.jpg"}
          />
          <AvatarFallback className="border">
            {chatPartner.displayName ? chatPartner.displayName[0] : "?"}
          </AvatarFallback>
        </Avatar>
        <div className="absolute bottom-2 right-px size-2.5">
          {chatPartner.online ? (
            <span
              className="inline-block size-2.5 rounded-full bg-primary"
              title="Online"
            ></span>
          ) : (
            <span
              className="inline-block size-2.5 rounded-full bg-gray-400"
              title={`Last seen: ${
                // === FIX APPLIED HERE for chatPartner.lastOnline ===
                chatPartner.lastOnline &&
                typeof chatPartner.lastOnline === "object" &&
                "toDate" in chatPartner.lastOnline
                  ? chatPartner.lastOnline.toDate().toLocaleString()
                  : "N/A" // Fallback text
              }`}
            ></span>
          )}
        </div>
      </div>
      <div className="flex-1">
        <p className="font-medium text-base line-clamp-1 max-w-full flex items-center justify-between gap-3">
          <span>{chatPartner.displayName || chatPartner.email}</span>
          <span className="text-xs text-gray-400 dark:text-gray-500 font-normal">
            {/* === FIX APPLIED HERE for chat.lastMessageTimestamp === */}
            {chat.lastMessageTimestamp &&
            typeof chat.lastMessageTimestamp === "object" &&
            "toDate" in chat.lastMessageTimestamp
              ? new Date(chat.lastMessageTimestamp.toDate()).toLocaleTimeString(
                  [],
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                  }
                )
              : ""}
          </span>
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1 max-w-68">
          {chat.lastMessage.length > MAX_MESSAGE_LENGTH
            ? `${chat.lastMessage.slice(0, MAX_MESSAGE_LENGTH)}...`
            : chat.lastMessage}
        </p>
      </div>
    </NavLink>
  );
};

export default MyChatsItem;
