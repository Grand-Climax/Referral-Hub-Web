import React from "react";
import { SidebarTrigger } from "../ui/sidebar";
import { ThemeToggle } from "../theme-toggler";
import { Notifications } from "../notifications";
import { ChatHeaderLink } from "../chat/ChatHeaderLink";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import Link from "next/link";
const Header = () => {
  return (
    <header className="flex justify-between h-16 shrink-0 items-center gap-2 border-b bg-background p-4">
      <SidebarTrigger className="-ml-1" />

      <div className="flex items-center gap-4">
        <ChatHeaderLink />
        <Notifications />
        <ThemeToggle />
      </div>
    </header>
  );
};

export default Header;
