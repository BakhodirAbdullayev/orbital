// src/components/user/UserListItem.tsx

import React from "react";
import { type UserProfile } from "../../lib/types";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"; // Assuming Shadcn UI Avatar

interface UserListItemProps {
  user: UserProfile;
  onClick: (user: UserProfile) => void;
}

export const UserListItem: React.FC<UserListItemProps> = ({
  user,
  onClick,
}) => {
  return (
    <div
      className="flex items-center p-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md transition-colors"
      onClick={() => onClick(user)}
    >
      <Avatar className="h-9 w-9">
        <AvatarImage
          src={user.photoURL || undefined}
          alt={user.displayName || "User"}
        />
        <AvatarFallback>
          {user.displayName ? user.displayName.charAt(0).toUpperCase() : "U"}
        </AvatarFallback>
      </Avatar>
      <div className="ml-3 text-sm font-medium truncate">
        {user.displayName || user.email || "Unknown User"}
      </div>
      {/* Optional: Add online status indicator here later */}
    </div>
  );
};
