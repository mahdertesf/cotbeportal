
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { fetchItems, createItem, updateItem, deleteItem } from '@/lib/api';
import { Loader2, PlusCircle, Edit, Trash2, Search, Filter, Landmark } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface RoomItem {
  id: string | number; // room_id from backend
  building_id: string | number;
  building_name?: string; // For display
  room_number: string;
  capacity: number;
  type?: string | null;
}

interface BuildingItem {
  id: string | number;
  name: string;
}

const roomFormSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  building_id: z.string().min(1, "Building is required"),
  room_number: z.string().min(1, "Room number is required").max(20, "Max 20 characters"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1").max(1000, "Max 1000 capacity"),
  type: z.string().max(50, "Max 50 characters").optional().nullable(),
});

type RoomFormData = z.infer<typeof roomFormSchema>;

const ALL_BUILDINGS_FILTER = "all_buildings_filter_value";

export default function RoomManagementPage() {
  const [rooms, setRooms] = useState<RoomItem[]>([]);
  const [buildings, setBuildings] = useState<BuildingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomItem | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<RoomItem | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [buildingFilter, setBuildingFilter] = useState<string>(ALL_BUILDINGS_FILTER);
  const { toast } = useToast();

  const form = useForm<RoomFormData>({
    resolver: zodResolver(roomFormSchema),
    defaultValues: {
      building_id: '',
      room_number: '',
      capacity: 10,
      type: '',
    },
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [roomsData, buildingsData] = await Promise.all([
        fetchItems('rooms') as Promise<RoomItem[]>,
        fetchItems('buildings') as Promise<BuildingItem[]>
      ]);
      setBuildings(buildingsData);
      // Map building names to rooms
      const roomsWithBuildingNames = roomsData.map(room => ({
        ...room,
        building_name: buildingsData.find(bldg => String(bldg.id) === String(room.building_id))?.name || 'Unknown Building'
      }));
      setRooms(roomsWithBuildingNames);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load room or building data.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (room: RoomItem | null = null) => {
    setEditingRoom(room);
    if (room) {
      form.reset({
        id: room.id,
        building_id: String(room.building_id),
        room_number: room.room_number,
        capacity: room.capacity,
        type: room.type,
      });
    } else {
      form.reset({ building_id: '', room_number: '', capacity: 10, type: '' });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: RoomFormData) => {
    setIsSubmitting(true);
    try {
      let response;
      const payload = {
        building_id: data.building_id,
        room_number: data.room_number,
        capacity: data.capacity,
        type: data.type,
      };

      if (editingRoom && data.id) {
        response = await updateItem('rooms', data.id, payload);
        toast({ title: "Success", description: "Room updated successfully." });
      } else {
        response = await createItem('rooms', payload);
        toast({ title: "Success", description: "Room created successfully." });
      }
      
      if (response.success) {
        loadInitialData(); // Reload all data to reflect changes
        setIsDialogOpen(false);
      } else {
        toast({ title: "Error", description: response.error || "Failed to save room.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!roomToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteItem('rooms', roomToDelete.id);
      toast({ title: "Success", description: `Room "${roomToDelete.room_number}" in ${roomToDelete.building_name} deleted.` });
      setRoomToDelete(null);
      loadInitialData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete room. It might be in use.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter(room =>
      (room.room_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
       (room.type && room.type.toLowerCase().includes(searchTerm.toLowerCase()))) &&
      (buildingFilter === ALL_BUILDINGS_FILTER || String(room.building_id) === buildingFilter)
    );
  }, [rooms, searchTerm, buildingFilter]);

  const RoomRowSkeleton = () => (
    <TableRow>
      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
      <TableCell><Skeleton className="h-5 w-10" /></TableCell>
      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
      <TableCell className="space-x-2"><Skeleton className="h-8 w-16" /><Skeleton className="h-8 w-20" /></TableCell>
    </TableRow>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle className="font-headline text-2xl flex items-center">
                <Landmark className="mr-3 h-7 w-7 text-primary"/> Room Management
              </CardTitle>
              <CardDescription>Manage rooms within buildings, including their capacity and type.</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Room
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 border rounded-lg bg-background shadow">
            <h3 className="text-lg font-semibold mb-3 font-headline">Filters & Search</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                    <Label htmlFor="search-room" className="block text-sm font-medium text-muted-foreground mb-1">Search by Room Number or Type</Label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input 
                        id="search-room" 
                        placeholder="Enter room number or type..." 
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
                <div>
                    <Label htmlFor="building-filter" className="block text-sm font-medium text-muted-foreground mb-1">Filter by Building</Label>
                    <Select value={buildingFilter} onValueChange={(value) => setBuildingFilter(value)}>
                        <SelectTrigger id="building-filter">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Filter by Building" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={ALL_BUILDINGS_FILTER}>All Buildings</SelectItem>
                            {buildings.map(bldg => (
                            <SelectItem key={bldg.id} value={String(bldg.id)}>{bldg.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>
          </div>

          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Number</TableHead>
                  <TableHead>Building</TableHead>
                  <TableHead>Capacity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 3 }).map((_, i) => <RoomRowSkeleton key={i} />)}
              </TableBody>
            </Table>
          ) : filteredRooms.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Room Number</TableHead>
                  <TableHead>Building</TableHead>
                  <TableHead className="text-center">Capacity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRooms.map(room => (
                  <TableRow key={room.id}>
                    <TableCell className="font-medium">{room.room_number}</TableCell>
                    <TableCell>{room.building_name}</TableCell>
                    <TableCell className="text-center">{room.capacity}</TableCell>
                    <TableCell className="text-muted-foreground">{room.type || 'N/A'}</TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(room)}>
                        <Edit className="mr-1 h-4 w-4" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setRoomToDelete(room)}>
                        <Trash2 className="mr-1 h-4 w-4" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No rooms found{searchTerm || buildingFilter !== ALL_BUILDINGS_FILTER ? ' matching your criteria' : ''}.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          form.reset();
          setEditingRoom(null);
        }
        setIsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingRoom ? 'Edit Room' : 'Add New Room'}</DialogTitle>
            <DialogDescription>
              {editingRoom ? 'Modify the room details below.' : 'Fill in the details to create a new room.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="building_id">Building</Label>
              <Select onValueChange={(value) => form.setValue('building_id', value)} defaultValue={form.getValues('building_id')}>
                <SelectTrigger id="building_id">
                  <SelectValue placeholder="Select a building" />
                </SelectTrigger>
                <SelectContent>
                  {buildings.map(bldg => (
                    <SelectItem key={bldg.id} value={String(bldg.id)}>{bldg.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.building_id && <p className="text-sm text-destructive mt-1">{form.formState.errors.building_id.message}</p>}
            </div>
            <div>
              <Label htmlFor="room_number">Room Number</Label>
              <Input id="room_number" {...form.register('room_number')} />
              {form.formState.errors.room_number && <p className="text-sm text-destructive mt-1">{form.formState.errors.room_number.message}</p>}
            </div>
            <div>
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" type="number" {...form.register('capacity')} />
              {form.formState.errors.capacity && <p className="text-sm text-destructive mt-1">{form.formState.errors.capacity.message}</p>}
            </div>
            <div>
              <Label htmlFor="type">Type (e.g., Lecture Hall, Lab - Optional)</Label>
              <Input id="type" {...form.register('type')} />
              {form.formState.errors.type && <p className="text-sm text-destructive mt-1">{form.formState.errors.type.message}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingRoom ? 'Save Changes' : 'Create Room'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {roomToDelete && (
        <AlertDialog open={!!roomToDelete} onOpenChange={() => setRoomToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this room?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Deleting room "{roomToDelete.room_number}" in "{roomToDelete.building_name}" might affect scheduled courses.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setRoomToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteRoom} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete Room
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
