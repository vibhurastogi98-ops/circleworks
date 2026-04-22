"use client";

import React, { useState, useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, Search, Bell, Sun, Moon, X,
  Settings, User, LogOut, Sparkles
} from "lucide-react";

import { useSidebarStore } from "@/store/useSidebarStore";
import { usePlatformStore } from "@/store/usePlatformStore";
import { toast } from "sonner";
import Breadcrumb from "./Breadcrumb";
import NotificationPanel from "@/components/notifications/NotificationPanel";
import { useNotificationStore } from "@/store/useNotificationStore";
import CommandPalette from "@/components/CommandPalette";

export default function EmployeeTopBar() {
  const pathname = usePathname() || "/me";
  const router = useRouter();
  // Guest Mode: Authentication disabled
  const signOut = (options?: { redirectUrl?: string }) => { window.location.href = options?.redirectUrl || "/"; };
  const isSignedIn = true;
  const isLoaded = true;
  const user = { 
    firstName: "Guest", 
    lastName: "Employee", 
    fullName: "Guest Employee",
    primaryEmailAddress: { emailAddress: "employee@circleworks.com" },
    imageUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=Alex&backgroundColor=transparent",
    publicMetadata: { companyName: "CircleWorks" } 
  };


  // Local state for immediate UI updates
  const [localAuthState, setLocalAuthState] = useState({
    isSignedIn: false,
    displayName: "User",
    displayEmail: "user@company.com",
    avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=User&backgroundColor=transparent"
  });

  // Update local state immediately when auth state changes
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      setLocalAuthState({
        isSignedIn: true,
        displayName: user?.fullName || user?.firstName || "User",
        displayEmail: user?.primaryEmailAddress?.emailAddress || "user@company.com",
        avatarUrl: user?.imageUrl || `https://api.dicebear.com/7.x/notionists/svg?seed=${user?.firstName || 'User'}&backgroundColor=transparent`
      });
    } else if (isLoaded && !isSignedIn) {
      setLocalAuthState({
        isSignedIn: false,
        displayName: "User",
        displayEmail: "user@company.com",
        avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=User&backgroundColor=transparent"
      });
      // Close avatar menu immediately on logout
      setIsAvatarMenuOpen(false);
    }
  }, [isSignedIn, isLoaded, user]);

  // Use local state for immediate UI updates
  const { displayName, displayEmail, avatarUrl } = localAuthState;
  const { toggleSidebar } = useSidebarStore();

  const { isDarkMode, toggleDarkMode } = usePlatformStore();
  const { unreadCount } = useNotificationStore();

  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const avatarMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (avatarMenuRef.current && !avatarMenuRef.current.contains(event.target as Node)) {
        setIsAvatarMenuOpen(false);
      }
    };
    if (isAvatarMenuOpen) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isAvatarMenuOpen]);

  
  const pathParts = pathname.split("/").filter(Boolean);
  const mainTitle = pathParts.length > 1
    ? pathParts[pathParts.length - 1].charAt(0).toUpperCase() + pathParts[pathParts.length - 1].slice(1).replace(/-/g, " ")
    : "My Portal";

  const breadcrumbItems = pathParts.map((part, index) => {
    const label = part === "me" ? "My Portal" : part.charAt(0).toUpperCase() + part.slice(1).replace(/-/g, " ");
    const href = index < pathParts.length - 1 ? "/" + pathParts.slice(0, index + 1).join("/") : undefined;
    return { label, href };
  });

  return (
    <div className="sticky top-0 z-40 flex flex-col w-full shadow-sm">
      <header className="h-16 w-full bg-white dark:bg-[#0F172A] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 lg:px-6 transition-colors">
        {/* LEFT */}
        <div className="flex items-center gap-4 lg:gap-6 min-w-0 flex-shrink-0">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 -ml-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-4 min-w-0">
            <h1 className="text-[18px] font-bold text-slate-900 dark:text-white truncate hidden md:block">
              {mainTitle}
            </h1>
            <div className="hidden md:block w-px h-6 bg-slate-200 dark:bg-slate-700" />
            <div className="hidden sm:flex items-center gap-2 overflow-hidden text-[14px] whitespace-nowrap">
              {breadcrumbItems.length > 0 ? (
                <Breadcrumb items={breadcrumbItems} variant={isDarkMode ? "dark" : "light"} />
              ) : (
                <span className="text-slate-500 font-medium">Overview</span>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
          {/* Notifications */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsNotificationsOpen(true);
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors relative"
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2 flex w-2.5 h-2.5 justify-center items-center">
                <span className="absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75 animate-ping" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
              </span>
            )}
          </button>

          {/* Dark Mode */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleDarkMode();
            }}
            className="w-10 h-10 flex items-center justify-center rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          >
            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>

          {/* User Avatar */}
          <div className="relative ml-2" ref={avatarMenuRef}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsAvatarMenuOpen(!isAvatarMenuOpen);
              }}
              className="flex items-center justify-center w-[36px] h-[36px] rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 hover:ring-2 hover:ring-violet-500 hover:ring-offset-2 hover:ring-offset-white dark:hover:ring-offset-slate-900 transition-all cursor-pointer"
            >
              <img src={avatarUrl} alt="User Avatar" className="w-full h-full object-cover bg-slate-100 dark:bg-slate-800" />
            </button>

            <AnimatePresence>
              {isAvatarMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-3 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 overflow-hidden"
                >
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 select-none relative">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsAvatarMenuOpen(false);
                      }}
                      className="absolute top-3 right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                      title="Close"
                    >
                      <X size={16} />
                    </button>
                    <p className="text-[14px] font-bold text-slate-900 dark:text-white truncate pr-8" onContextMenu={(e) => e.preventDefault()}>{displayName}</p>
                    <p className="text-[12px] text-slate-500 dark:text-slate-400 truncate mt-0.5" onContextMenu={(e) => e.preventDefault()}>{displayEmail}</p>
                    <p className="text-[11px] text-blue-600 dark:text-blue-400 truncate mt-1 font-medium select-none">{(user?.publicMetadata?.companyName as string) || "Your Company"}</p>
                  </div>
                  <div className="p-2 flex flex-col gap-1">
                    <button onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsAvatarMenuOpen(false);
                      router.push("/me/profile");
                    }} className="w-full text-left px-3 py-2 text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md flex items-center gap-2 transition-colors">
                      <User size={16} className="text-slate-400" /> My Profile
                    </button>
                    <button onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsAvatarMenuOpen(false);
                      router.push("/dashboard");
                    }} className="w-full text-left px-3 py-2 text-[13px] font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md flex items-center gap-2 transition-colors">
                      <Settings size={16} className="text-slate-400" /> Admin Portal
                    </button>
                  </div>
                  <div className="p-2 border-t border-slate-100 dark:border-slate-700">
                    <button onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setIsAvatarMenuOpen(false);
                      // Immediate UI feedback - reset local state instantly
                      setLocalAuthState({
                        isSignedIn: false,
                        displayName: "User",
                        displayEmail: "user@company.com",
                        avatarUrl: "https://api.dicebear.com/7.x/notionists/svg?seed=User&backgroundColor=transparent"
                      });
                      // Then perform actual signOut
                      signOut({ redirectUrl: "/" });
                    }} className="w-full text-left px-3 py-2 text-[13px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md flex items-center gap-2 transition-colors">
                      <LogOut size={16} /> Log Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Slide-in Notification Panel */}
      <NotificationPanel isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
      
      {/* Global Command Palette */}
      <CommandPalette />
    </div>
  );
}
