

import { LayoutDashboard, BookCopy, User, PencilRuler, Megaphone, MessageCircle, Settings, FileText } from "lucide-react";

export const sidebarMenus = {
  Staff: [
  { title: "Dashboard", url: "/sdash", icon: LayoutDashboard },
  { title: "Assign Reviewer", url: "/sassign-reviewer", icon: User },
  { title: "Review Submission", url: "/sreview-submission", icon: BookCopy },
  { title: "Deviation Management", url: "/sdevi", icon: PencilRuler },
  { title: "Create Announcement", url: "/screate-announcement", icon: Megaphone },
  { title: "Announcements", url: "/announcements", icon: Megaphone },
  { title: "Message", url: "/smessages", icon: MessageCircle },
  { title: "Settings", url: "/staff/settings", icon: Settings },
  ],
  Researcher: [
    {
      title: "Dashboard",
  url: "/researcher/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Submissions",
  url: "/researcher/submissions",
      icon: BookCopy,
    },
    {
      title: "Forms",
      url: "/researcher/forms",
      icon: FileText,
    },
  { title: "Deviation Reports", url: "/rdevi1", icon: PencilRuler },
    {
      title: "Message",
  
  url: "/smessages",
      icon: MessageCircle,
    },
  { title: "Announcements", url: "/announcements", icon: Megaphone },
    {
      title: "Settings",
  
  url: "/researcher/settings",
      icon: Settings,
    },
  ],
  Reviewer: [
    {
      title: "Dashboard",
      url: "/reviewer/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Assigned Reviews",
  
  url: "/reviewerreviews",
      icon: BookCopy,
    },
    {
      title: "Message",
  url: "/smessages",
      icon: MessageCircle,
    },
  { title: "Announcements", url: "/announcements", icon: Megaphone },
    {
      title: "Settings",
  url: "/reviewer/settings",
      icon: Settings,
    },
  ],
};
