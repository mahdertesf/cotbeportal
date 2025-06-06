'use client';
import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import useAppStore, { type UserRole } from '@/stores/appStore';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { SidebarProvider, Sidebar, SidebarHeader, SidebarContent, SidebarFooter, SidebarTrigger, SidebarInset, SidebarRail } from '@/components/ui/sidebar';
import { SidebarNav } from '@/components/navigation/SidebarNav';
import { GlobalHelpAssistant } from '@/components/GlobalHelpAssistant';
import Link from 'next/link';
import Image from 'next/image';
import { LogOut, UserCircle, Settings } from 'lucide-react';

const getRoleBasePath = (role: UserRole | undefined): string => {
  if (!role) return 'general';
  switch (role) {
    case 'Student': return 'student';
    case 'Teacher': return 'teacher';
    case 'Staff Head': return 'staff';
    default: return 'general';
  }
};

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = useAppStore((state) => state.user);
  const logoutUser = useAppStore((state) => state.logoutUser);
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  if (!user) {
    // Render a loading state or null while redirecting
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const handleLogout = () => {
    logoutUser();
    router.push('/login');
  };

  const getInitials = (firstName?: string, lastName?: string) => {
    const first = firstName?.[0] || '';
    const last = lastName?.[0] || '';
    return `${first}${last}`.toUpperCase() || 'U';
  };
  
  const userRolePath = getRoleBasePath(user.role);

  return (
    <SidebarProvider defaultOpen>
        <Sidebar collapsible="icon" side="left" variant="sidebar">
          <SidebarHeader className="flex flex-col items-center p-4 border-b border-sidebar-border">
             <Link href="/dashboard" className="mb-2">
                <Image 
                    src="/cotbe-logo.png" 
                    alt="CoTBE Portal Logo" 
                    width={42} 
                    height={40}
                    priority
                    data-ai-hint="university emblem"
                 />
             </Link>
          </SidebarHeader>
          <SidebarContent>
            <SidebarNav />
          </SidebarContent>
          <SidebarFooter className="p-2 border-t border-sidebar-border">
            {/* Footer content if any */}
          </SidebarFooter>
        </Sidebar>
        <SidebarRail />

        <SidebarInset>
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/80 px-4 shadow-sm backdrop-blur-md sm:px-6">
            <div className="flex items-center">
                <SidebarTrigger className="md:hidden mr-2" />
                <h1 className="text-xl font-headline font-semibold hidden sm:block">
                    CoTBE Portal <span className="text-sm font-body text-muted-foreground">({user.role})</span>
                </h1>
            </div>
            <div className="flex items-center gap-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={`https://placehold.co/100x100.png?text=${getInitials(user.first_name, user.last_name)}`} alt={`${user.first_name} ${user.last_name}`} />
                      <AvatarFallback>{getInitials(user.first_name, user.last_name)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none font-headline">{user.first_name} {user.last_name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground capitalize">{user.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/${userRolePath}/profile`} className="cursor-pointer">
                      <UserCircle className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                     <Link href={`/${userRolePath}/settings`} className="cursor-pointer">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          
          <main className="flex-1 p-4 sm:p-6 lg:p-8 bg-background">
            {children}
          </main>

          <footer className="border-t p-4 text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Addis Ababa University College of Technology and Built Environment (CoTBE). All rights reserved.
          </footer>
          
          <GlobalHelpAssistant />
        </SidebarInset>
    </SidebarProvider>
  );
}
