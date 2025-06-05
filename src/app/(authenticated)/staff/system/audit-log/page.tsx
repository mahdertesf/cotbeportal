
'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { DatePickerWithRange } from '@/components/ui/date-range-picker';
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

const ALL_ACTIONS_FILTER_VALUE = "all_action_types_filter"; // Unique value for "All Action Types"

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    userSearch: '',
    actionType: '', // Empty initially to show placeholder
    dateRange: undefined as DateRange | undefined,
  });
  const { toast } = useToast();

  useEffect(() => {
    const loadLogs = async () => {
      setIsLoading(true);
      try {
        // In a real app, pass filters to fetchAuditLogs
        const data = await fetchAuditLogs({ limit: 50 }); 
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
    const matchesAction = !filters.actionType || filters.actionType === ALL_ACTIONS_FILTER_VALUE ? true : log.action_type === filters.actionType;
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
                    <SelectItem value={ALL_ACTIONS_FILTER_VALUE}>All Action Types</SelectItem>
                    <SelectItem value="USER_LOGIN">User Login</SelectItem>
                    <SelectItem value="COURSE_MATERIAL_UPLOAD">Material Upload</SelectItem>
                    <SelectItem value="USER_UPDATE">User Update</SelectItem>
                    {/* Add more relevant action types */}
                  </SelectContent>
                </Select>
              </div>
              <div>
                 <label htmlFor="date-range-filter" className="block text-sm font-medium text-muted-foreground mb-1">Date Range</label>
                 <DatePickerWithRange date={filters.dateRange} onDateChange={(range) => handleFilterChange('dateRange', range)} />
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
        </CardContent>
      </Card>
    </div>
  );
}
