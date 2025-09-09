'use client';

import React from 'react';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarPinButton } from '@/components/ui/sidebar';
import { Trophy, Home, BarChart3, Users, Scale } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', label: 'Участники', icon: Home },
  { href: '/leaderboard', label: 'Рейтинг', icon: BarChart3 },
  { href: '/teams', label: 'Команды', icon: Users },
  { href: '/scoring', label: 'Таблица баллов', icon: Scale },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar collapsible="icon" className="hidden md:flex">
      <SidebarHeader>
        <div className="flex w-full items-center justify-between p-2">
            <div className="flex items-center gap-2">
                 <Trophy className="h-8 w-8 text-primary" />
                  <span className="font-bold text-lg text-sidebar-foreground group-data-[state=collapsed]:hidden">
                    Омский Кросс
                  </span>
            </div>
            <SidebarPinButton />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref>
                <SidebarMenuButton
                  asChild
                  size="lg"
                  isActive={pathname === item.href}
                  tooltip={item.label}
                  className={cn(
                    "justify-start",
                    pathname === item.href && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <div>
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </div>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
