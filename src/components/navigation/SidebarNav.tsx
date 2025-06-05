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
  BarChart3
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
  roles: UserRole[];
  subItems?: NavItem[];
  group?: string; // For grouping academic structure, infrastructure etc.
}

const navItems: NavItem[] = [
  // Common
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Student', 'Teacher', 'Staff Head'] },
  { href: '/profile', label: 'Profile', icon: UserCircle, roles: ['Student', 'Teacher', 'Staff Head'] },
  
  // Student
  { href: '/student/courses/register', label: 'Course Registration', icon: NotebookText, roles: ['Student'] },
  { href: '/student/courses', label: 'My Courses', icon: BookOpen, roles: ['Student'] }, // Will list courses, clicking goes to [scheduledCourseId]
  { href: '/student/academic-history', label: 'Academic History', icon: FileText, roles: ['Student'] },

  // Teacher
  { href: '/teacher/courses', label: 'My Assigned Courses', icon: Library, roles: ['Teacher'] }, // Will list courses, clicking goes to manage/[scheduledCourseId]

  // Staff Head
  { group: "User Management", href: '/staff/users', label: 'Manage Users', icon: Users, roles: ['Staff Head'] },
  { group: "Academic Structure", href: '/staff/departments', label: 'Departments', icon: School, roles: ['Staff Head'] },
  { group: "Academic Structure", href: '/staff/courses/catalog', label: 'Course Catalog', icon: BookOpen, roles: ['Staff Head'] },
  { group: "Academic Structure", href: '/staff/semesters', label: 'Semesters', icon: CalendarDays, roles: ['Staff Head'] },
  { group: "Infrastructure", href: '/staff/infrastructure/buildings', label: 'Buildings', icon: Building, roles: ['Staff Head'] },
  { group: "Infrastructure", href: '/staff/infrastructure/rooms', label: 'Rooms', icon: Landmark, roles: ['Staff Head'] },
  { group: "Course Operations", href: '/staff/courses/schedule', label: 'Scheduled Courses', icon: ListChecks, roles: ['Staff Head'] },
  { group: "Course Operations", href: '/staff/students/manual-registration', label: 'Manual Registration', icon: FilePenLine, roles: ['Staff Head'] },
  { group: "System", href: '/staff/system/audit-log', label: 'Audit Log', icon: ShieldAlert, roles: ['Staff Head'] },
  { group: "System", href: '/staff/communication/announcements/ai-assistant', label: 'AI Announcer', icon: Megaphone, roles: ['Staff Head'] },
];

const groupedNavItems = (role: UserRole) => {
  const filtered = navItems.filter(item => item.roles.includes(role));
  const groups: Record<string, NavItem[]> = {};
  
  filtered.forEach(item => {
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

  // Adjust base path for role-specific navigation
  const basePath = `/${currentRole.toLowerCase().replace(' ', '')}`;

  return (
    <SidebarMenu>
      {Object.entries(roleNavGroups).map(([groupName, items]) => (
        <React.Fragment key={groupName}>
          {groupName !== "General" && (
             <div className="px-4 pt-4 pb-1 text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider">{groupName}</div>
          )}
          {items.map((item) => {
            // Construct full path, potentially prefixing with role if not already included
            const fullPath = item.href.startsWith('/') ? item.href : `${basePath}${item.href}`;
            const isActive = pathname === fullPath || (item.href !== '/dashboard' && pathname.startsWith(fullPath + (fullPath.endsWith('/') ? '' : '/')));
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
                      const subFullPath = subItem.href.startsWith('/') ? subItem.href : `${basePath}${subItem.href}`;
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
