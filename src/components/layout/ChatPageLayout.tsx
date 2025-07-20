// src/components/layout/ChatPageLayout.tsx
import React from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Outlet, useLocation, useNavigate } from "react-router";

const ChatPageLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSelectFromSidebar = (
    selectionType: "user" | "chat",
    id: string
  ) => {
    if (selectionType === "user") {
      navigate(`/chat/user/${id}`);
    } else if (selectionType === "chat") {
      navigate(`/chat/dialog/${id}`);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden max-w-screen">
      <div
        className={`w-full md:max-w-80 lg:max-w-96 border-r dark:border-gray-700 ${
          !location.pathname.includes("dialog") ? "block" : "hidden md:block"
        }`}
      >
        {/* Sidebar komponentiga navigate qilish funksiyasini beramiz */}
        <Sidebar onSelect={handleSelectFromSidebar} />
      </div>
      <div
        className={`flex-1 max-h-dvh max-md:absolute max-md:w-full max-md:h-full max-md:left-0 max-md:top-0 max-md:bottom-0 max-md:z-10 ${
          !location.pathname.includes("dialog")
            ? "max-md:hidden"
            : "max-md:block"
        }`}
      >
        {/* Ichki routelar bu yerda render qilinadi */}
        <Outlet />
      </div>
    </div>
  );
};

export default ChatPageLayout;
