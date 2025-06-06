
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import useAppStore, { type UserRole } from '@/stores/appStore';
import { 
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  UserCircle, 
  BookOpen, 
  FileText, 
  Users, 
  Building, 
  CalendarDays, 
  ClipboardList, 
  Settings, 
  ShieldAlert, 
  Megaphone, 
  GraduationCap,
  Library,
  School,
  Landmark,
  NotebookText,
  FilePenLine,
  ListChecks,
  BarChart3,
  UserCog // For Admin or specific staff settings
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  subItems?: NavItem[];
  group?: string; 
}

const navItems: NavItem[] = [
  // Common
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Student', 'Teacher', 'Staff Head', 'Admin'] },
  { href: '/profile', label: 'Profile', icon: UserCircle, roles: ['Student', 'Teacher', 'Staff Head', 'Admin'] },
  { href: '/announcements', label: 'Announcements', icon: Megaphone, roles: ['Student', 'Teacher', 'Staff Head', 'Admin'] }, 
  
  // Student
  { href: '/student/courses/register', label: 'Course Registration', icon: NotebookText, roles: ['Student'] },
  { href: '/student/courses', label: 'My Courses', icon: BookOpen, roles: ['Student'] }, 
  { href: '/student/academic-history', label: 'Academic History', icon: FileText, roles: ['Student'] },

  // Teacher
  { href: '/teacher/courses', label: 'My Assigned Courses', icon: Library, roles: ['Teacher'] }, 

  // Staff Head & Admin (Admin inherits Staff Head roles)
  { group: "User Management", href: '/staff/users', label: 'Manage Users', icon: Users, roles: ['Staff Head', 'Admin'] },
  { group: "Academic Structure", href: '/staff/departments', label: 'Departments', icon: School, roles: ['Staff Head', 'Admin'] },
  { group: "Academic Structure", href: '/staff/courses/catalog', label: 'Course Catalog', icon: BookOpen, roles: ['Staff Head', 'Admin'] },
  { group: "Academic Structure", href: '/staff/semesters', label: 'Semesters', icon: CalendarDays, roles: ['Staff Head', 'Admin'] },
  { group: "Infrastructure", href: '/staff/infrastructure/buildings', label: 'Buildings', icon: Building, roles: ['Staff Head', 'Admin'] },
  { group: "Infrastructure", href: '/staff/infrastructure/rooms', label: 'Rooms', icon: Landmark, roles: ['Staff Head', 'Admin'] },
  { group: "Course Operations", href: '/staff/courses/schedule', label: 'Scheduled Courses', icon: ListChecks, roles: ['Staff Head', 'Admin'] },
  { group: "Course Operations", href: '/staff/students/manual-registration', label: 'Manual Registration', icon: FilePenLine, roles: ['Staff Head', 'Admin'] },
  { group: "Communication", href: '/staff/communication/announcements/ai-assistant', label: 'AI Announcer', icon: Megaphone, roles: ['Staff Head', 'Admin'] }, 
  { group: "System", href: '/staff/system/audit-log', label: 'Audit Log', icon: ShieldAlert, roles: ['Staff Head', 'Admin'] },
];

const groupedNavItems = (role: UserRole) => {
  const filtered = navItems.filter(item => item.roles.includes(role));
  const groups: Record<string, NavItem[]> = {};
  
  filtered.forEach(item => {
    if (item.label === 'Announcements') {
        if (role === 'Student') item.href = '/student/announcements';
        else if (role === 'Teacher') item.href = '/teacher/announcements';
        else if (role === 'Staff Head' || role === 'Admin') item.href = '/staff/announcements';
    }
    // Ensure Staff Head and Admin share the same base path for staff functions
    if ((role === 'Staff Head' || role === 'Admin') && item.href.startsWith('/staff/')) {
        // Path is already correct for staff shared routes
    }

    const groupName = item.group || "General";
    if (!groups[groupName]) {
      groups[groupName] = [];
    }
    groups[groupName].push(item);
  });
  return groups;
};


export function SidebarNav() {
  const user = useAppStore((state) => state.user);
  const pathname = usePathname();

  if (!user || !user.role) {
    return null;
  }

  const currentRole = user.role;
  const roleNavGroups = groupedNavItems(currentRole);

  return (
    <SidebarMenu>
      {Object.entries(roleNavGroups).map(([groupName, items]) => (
        <React.Fragment key={groupName}>
          {groupName !== "General" && (
             <div className="px-4 pt-4 pb-1 text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider">{groupName}</div>
          )}
          {items.map((item) => {
            const fullPath = item.href; 
            const isActive = pathname === fullPath || (item.href !== '/dashboard' && !item.href.endsWith('/announcements') && pathname.startsWith(fullPath + (fullPath.endsWith('/') ? '' : '/')));
            const Icon = item.icon;
            
            return (
              <SidebarMenuItem key={item.label}>
                <Link href={fullPath} passHref legacyBehavior>
                  <SidebarMenuButton isActive={isActive} tooltip={item.label}>
                    <Icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </Link>
                {item.subItems && isActive && (
                  <SidebarMenuSub>
                    {item.subItems.map(subItem => {
                      const subFullPath = subItem.href;
                      const isSubActive = pathname === subFullPath;
                      const SubIcon = subItem.icon;
                      return (
                        <SidebarMenuSubItem key={subItem.label}>
                           <Link href={subFullPath} passHref legacyBehavior>
                            <SidebarMenuSubButton isActive={isSubActive}>
                              <SubIcon />
                              <span>{subItem.label}</span>
                            </SidebarMenuSubButton>
                          </Link>
                        </SidebarMenuSubItem>
                      );
                    })}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            );
          })}
        </React.Fragment>
      ))}
    </SidebarMenu>
  );
}
