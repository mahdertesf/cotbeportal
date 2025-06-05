
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-range-picker'; // Assuming this component exists or will be created
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { fetchAuditLogs } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Filter, ShieldAlert } from 'lucide-react';
import type { DateRange } from 'react-day-picker';
import { Skeleton } from '@/components/ui/skeleton';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  username: string;
  action_type: string;
  target_entity_type: string | null;
  target_entity_id: string | null;
  ip_address: string | null;
  details: string | null;
}

// Placeholder for DatePickerWithRange if it's not already in your ui components
// You might need to create this component based on ShadCN's examples if it's not there.
// For now, I'll mock its presence. If it's missing, it will cause a new error.
// You can replace it with separate date pickers or remove date filtering for now if needed.
const DatePickerWithRangePlaceholder = ({ date, onDateChange }: { date?: DateRange, onDateChange: (range?: DateRange) => void }) => (
    <Button variant="outline" onClick={() => console.log("Date picker clicked")}>
        {date?.from ? (date.to ? `${date.from.toLocaleDateString()} - ${date.to.toLocaleDateString()}` : date.from.toLocaleDateString()) : "Pick a date range"}
    </Button>
);


export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    userSearch: '',
    actionType: '',
    dateRange: undefined as DateRange | undefined,
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true);
      try {
        // In a real app, pass filters to fetchAuditLogs
        const data = await fetchAuditLogs({ limit: 50 }); // Fetch more logs for this page
        setLogs(data);
      } catch (error) {
        toast({ title: "Error", description: "Failed to load audit logs.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    };
    loadLogs();
  }, [toast]);
  
  const handleFilterChange = (key: string, value: string | DateRange | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    // This would re-fetch logs with applied filters in a real app
    console.log("Applying filters:", filters);
    toast({ title: "Filters Applied (Mock)", description: "Log filtering is not fully implemented in this mock." });
  };

  const filteredLogs = logs.filter(log => {
    const matchesUser = filters.userSearch ? log.username?.toLowerCase().includes(filters.userSearch.toLowerCase()) : true;
    const matchesAction = filters.actionType ? log.action_type === filters.actionType : true;
    // Date filtering would be more complex and typically handled server-side
    return matchesUser && matchesAction;
  });
  
  const LogRowSkeleton = () => (
    <TableRow>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center">
            <ShieldAlert className="mr-3 h-7 w-7 text-primary" /> System Audit Log
          </CardTitle>
          <CardDescription>Review detailed records of system activity and changes.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 border rounded-lg bg-background shadow">
            <h3 className="text-lg font-semibold mb-3 font-headline">Filter Logs</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
              <div>
                <label htmlFor="user-search" className="block text-sm font-medium text-muted-foreground mb-1">Search by Username</label>
                <Input 
                  id="user-search" 
                  placeholder="Enter username..." 
                  value={filters.userSearch}
                  onChange={(e) => handleFilterChange('userSearch', e.target.value)}
                />
              </div>
              <div>
                <label htmlFor="action-type-filter" className="block text-sm font-medium text-muted-foreground mb-1">Action Type</label>
                <Select value={filters.actionType} onValueChange={(value) => handleFilterChange('actionType', value)}>
                  <SelectTrigger id="action-type-filter">
                    <SelectValue placeholder="All Action Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Action Types</SelectItem>
                    <SelectItem value="USER_LOGIN">User Login</SelectItem>
                    <SelectItem value="COURSE_MATERIAL_UPLOAD">Material Upload</SelectItem>
                    <SelectItem value="USER_UPDATE">User Update</SelectItem>
                    {/* Add more relevant action types */}
                  </SelectContent>
                </Select>
              </div>
              <div>
                 <label htmlFor="date-range-filter" className="block text-sm font-medium text-muted-foreground mb-1">Date Range</label>
                 {/* Replace DatePickerWithRangePlaceholder with actual component if you have it */}
                 <DatePickerWithRangePlaceholder date={filters.dateRange} onDateChange={(range) => handleFilterChange('dateRange', range)} />
              </div>
               <Button onClick={applyFilters} className="md:col-start-3 lg:col-start-auto self-end">
                <Filter className="mr-2 h-4 w-4" /> Apply Filters
              </Button>
            </div>
          </div>

          {isLoading ? (
             <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>Target</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Details</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({length: 5}).map((_, i) => <LogRowSkeleton key={i}/>)}
                </TableBody>
            </Table>
          ) : filteredLogs.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[180px]">Timestamp</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Action Type</TableHead>
                  <TableHead>Target Entity</TableHead>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.map(log => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{log.username || 'System'}</TableCell>
                    <TableCell>{log.action_type}</TableCell>
                    <TableCell>
                      {log.target_entity_type && log.target_entity_id 
                        ? `${log.target_entity_type} (ID: ${log.target_entity_id})` 
                        : 'N/A'}
                    </TableCell>
                    <TableCell>{log.ip_address || 'N/A'}</TableCell>
                    <TableCell className="text-xs max-w-xs truncate">{log.details || 'No additional details'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No audit logs found matching your criteria.</p>
          )}
          {/* Add pagination if many logs */}
        </CardContent>
      </Card>
    </div>
  );
}

// If DatePickerWithRange is not defined, you'll need to create it.
// Example (very basic structure, actual component is more complex):
// components/ui/date-range-picker.tsx
// import React from "react"
// import { CalendarIcon } from "lucide-react"
// import { DateRange } from "react-day-picker"
// import { cn } from "@/lib/utils"
// import { Button } from "@/components/ui/button"
// import { Calendar } from "@/components/ui/calendar"
// import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
//
// export function DatePickerWithRange({
//   className,
//   date,
//   onDateChange, // Changed from onSelect to onDateChange to match usage
// }: React.HTMLAttributes<HTMLDivElement> & { date?: DateRange, onDateChange: (range?: DateRange) => void }) {
//   return (
//     <div className={cn("grid gap-2", className)}>
//       <Popover>
//         <PopoverTrigger asChild>
//           <Button
//             id="date"
//             variant={"outline"}
//             className={cn(
//               "w-[300px] justify-start text-left font-normal",
//               !date && "text-muted-foreground"
//             )}
//           >
//             <CalendarIcon className="mr-2 h-4 w-4" />
//             {date?.from ? (
//               date.to ? (
//                 <>{date.from.toLocaleDateString()} - {date.to.toLocaleDateString()}</>
//               ) : (
//                 date.from.toLocaleDateString()
//               )
//             ) : (
//               <span>Pick a date range</span>
//             )}
//           </Button>
//         </PopoverTrigger>
//         <PopoverContent className="w-auto p-0" align="start">
//           <Calendar
//             initialFocus
//             mode="range"
//             defaultMonth={date?.from}
//             selected={date}
//             onSelect={onDateChange} // Ensure onSelect updates the state via onDateChange
//             numberOfMonths={2}
//           />
//         </PopoverContent>
//       </Popover>
//     </div>
//   )
// }
