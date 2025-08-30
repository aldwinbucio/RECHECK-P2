'use client';

import * as React from 'react';

import { data as DATA } from "@/Data"
import { sidebarMenus } from "@/constants/sidebarMenus"
import { formsCatalog, getFormSubmissionCounts } from "@/constants/forms"
import type { NavItem } from "@/Data"
import useAuth from "@/hooks/useAuth"
import { useUserRole } from "@/hooks/useUserRole"

import {
  SidebarProvider,
  SidebarTrigger,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from '@/components/animate-ui/radix/sidebar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/animate-ui/radix/dropdown-menu';
import { BadgeCheck, ChevronsUpDown, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Link, useLocation } from 'react-router-dom';



export function RadixSidebarDemo({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const { role: userRole } = useUserRole(user);
  const main = DATA.main[0];

  
  const role: keyof typeof sidebarMenus = (userRole as keyof typeof sidebarMenus) || (DATA.user.role as keyof typeof sidebarMenus) || "Researcher";
  const menu: NavItem[] = sidebarMenus[role] || sidebarMenus["Researcher"];
  const [showFormsSub, setShowFormsSub] = React.useState<boolean>(false);
  const researcherForms = role === 'Researcher' ? formsCatalog : [];
  const [formCounts, setFormCounts] = React.useState<Record<string, number>>({});
  React.useEffect(() => {
    try { setFormCounts(getFormSubmissionCounts()); } catch { }
  }, []);
  const location = useLocation();
  const activeFormId = React.useMemo(() => {
    try {
      const sp = new URLSearchParams(location.search);
      return sp.get('form') || '';
    } catch {
      return '';
    }
  }, [location.search]);

  return (
    <>
      <SidebarProvider>
        <Sidebar {...props}>
          <SidebarHeader>
            {/* Team Switcher */}
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                      <main.logo className="size-4" />
                    </div>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-semibold">
                        RECheck
                      </span>
                      <span className="truncate text-xs">
                        UIC REC
                      </span>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
            {/* Team Switcher */}
          </SidebarHeader>

          <SidebarContent>
            {/* Nav Main */}
            <SidebarGroup>
              <SidebarGroupLabel>Platform</SidebarGroupLabel>
              <SidebarMenu>
                {menu.map((item: NavItem) => {
                  const isFormsParent = item.title === 'Forms' && researcherForms.length > 0;
                  return (
                    <SidebarMenuItem key={item.title}>
                      <div className="flex flex-col">
                        <SidebarMenuButton asChild={false} tooltip={item.title} onClick={() => {
                          if (isFormsParent) {
                            setShowFormsSub(prev => !prev);
                          }
                        }} className="justify-between">
                          <div className="flex items-center gap-2 flex-1">
                            <Link to={item.url} className="flex items-center gap-2 flex-1">
                              {item.icon && <item.icon />}
                              <span>{item.title}</span>
                            </Link>
                            {isFormsParent && (
                              <ChevronDown className={`size-4 transition-transform ${showFormsSub ? 'rotate-180' : ''}`} />
                            )}
                          </div>
                        </SidebarMenuButton>
                        {isFormsParent && showFormsSub && (
                          <div className="ml-6 mt-1 space-y-0.5 border-l border-white/10 pl-3 animate-in fade-in slide-in-from-top-1">
                            {researcherForms.map(f => {
                              const isActive = activeFormId === f.id;
                              return (
                                <Link
                                  key={f.id}
                                  to={`/researcher/forms?form=${f.id}`}
                                  className={`group flex items-center gap-2 rounded-md px-2 py-1 pr-2 text-xs transition-colors
                                    ${isActive
                                      ? 'bg-white/10 text-white font-medium shadow-sm'
                                      : 'text-white/70 hover:text-white hover:bg-white/5'}
                                  `}
                                >
                                  {f.icon ? <f.icon className={`size-3 ${isActive ? 'text-white' : 'text-white/60 group-hover:text-white'}`} /> : <span className="text-[10px]">•</span>}
                                  <span className="flex-1 truncate">{f.title}</span>
                                  {formCounts[f.id] && formCounts[f.id] > 0 && (
                                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-[9px] font-semibold tracking-tight
                                      ${isActive ? 'bg-blue-500 text-white' : 'bg-blue-500/80 text-white'}
                                    `}>{formCounts[f.id]}</span>
                                  )}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroup>
            {/* Nav Main */}
          </SidebarContent>
          <SidebarFooter>
            {/* Nav User */}
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <Avatar className="h-8 w-8 rounded-lg">
                        <AvatarImage
                          src={DATA.user.avatar}
                          alt={DATA.user.name}
                        />
                        <AvatarFallback className="rounded-lg">{DATA.user.name[0].toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {DATA.user.name}
                        </span>
                        <span className="truncate text-xs">
                          {DATA.user.email}
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    side={isMobile ? 'bottom' : 'right'}
                    align="end"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="p-0 font-normal">
                      <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                        <Avatar className="h-8 w-8 rounded-lg">
                          <AvatarImage
                            src={DATA.user.avatar}
                            alt={DATA.user.name}
                          />
                          <AvatarFallback className="rounded-lg">
                            {DATA.user.name[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid flex-1 text-left text-sm leading-tight">
                          <span className="truncate font-semibold">
                            {DATA.user.name}
                          </span>
                          <span className="truncate text-xs">
                            {DATA.user.email}
                          </span>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                      <Link to="/profile">
                        <DropdownMenuItem>
                          <BadgeCheck />
                          Profile
                        </DropdownMenuItem>
                      </Link>
                      <Link to="/settings">
                        <DropdownMenuItem>
                          <BadgeCheck />
                          Settings
                        </DropdownMenuItem>
                      </Link>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <a href="/login">
                      <DropdownMenuItem>
                        <BadgeCheck />
                        Logout
                      </DropdownMenuItem>
                    </a>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
            {/* Nav User */}
          </SidebarFooter>
        </Sidebar>
        <SidebarTrigger className="mx-4 my-2 min-md:invisible md:transition-none z-30 fixed" onClick={() => console.log("ww")} />
      </SidebarProvider >
    </>
  );
}