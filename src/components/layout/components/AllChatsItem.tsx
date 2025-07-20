import type { Chat, UserProfile } from "@/lib/types";
import type { FC } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { NavLink } from "react-router";

interface Props {
  user: UserProfile;
  existingChat?: Chat;
  onSelect: (
    selectionType: "user" | "chat",
    id: string,
    chatPartner?: UserProfile
  ) => void;
}

const AllChatsItem: FC<Props> = ({ user, existingChat, onSelect }) => {
  return (
    <NavLink
      to={
        existingChat
          ? `/chat/dialog/${existingChat.id}`
          : `/chat/user/${user.uid}`
      }
      className={({ isActive }) =>
        `flex items-center gap-2 py-3 px-4 hover:bg-muted border-y ${
          isActive
            ? "bg-blue-100 border-blue-300 hover:!bg-blue-200/90 dark:bg-blue-900/60 dark:border-blue-900 dark:hover:!bg-blue-900/70"
            : "border-transparent"
        }`
      }
      onClick={() => {
        if (existingChat) {
          onSelect("chat", existingChat.id, user);
        } else {
          onSelect("user", user.uid, user);
        }
      }}
    >
      <Avatar className="h-10 w-10">
        <AvatarImage src={user.photoURL || "/placeholder-avatar.jpg"} />
        <AvatarFallback>
          {user.displayName?.charAt(0).toUpperCase() ||
            user.email?.split("@")[0].charAt(0).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="ml-3 flex-1">
        <h3 className="font-semibold dark:text-white">
          {user.displayName || user.email?.split("@")[0]}
        </h3>
      </div>
    </NavLink>
  );
};

export default AllChatsItem;
