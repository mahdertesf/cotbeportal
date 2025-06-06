
'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { fetchItems, createItem, updateItem, deleteItem } from '@/lib/api';
import { Loader2, PlusCircle, Edit, Trash2, Search, Building } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface BuildingItem {
  id: string | number; // building_id from backend
  name: string;
  address?: string | null;
}

const buildingFormSchema = z.object({
  id: z.union([z.string(), z.number()]).optional(),
  name: z.string().min(3, "Building name must be at least 3 characters").max(150, "Max 150 characters"),
  address: z.string().max(255, "Max 255 characters").optional().nullable(),
});

type BuildingFormData = z.infer<typeof buildingFormSchema>;

export default function BuildingManagementPage() {
  const [buildings, setBuildings] = useState<BuildingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState<BuildingItem | null>(null);
  const [buildingToDelete, setBuildingToDelete] = useState<BuildingItem | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const form = useForm<BuildingFormData>({
    resolver: zodResolver(buildingFormSchema),
    defaultValues: {
      name: '',
      address: '',
    },
  });

  useEffect(() => {
    loadBuildings();
  }, []);

  const loadBuildings = async () => {
    setIsLoading(true);
    try {
      const data = await fetchItems('buildings') as BuildingItem[];
      setBuildings(data);
    } catch (error) {
      toast({ title: "Error", description: "Failed to load buildings.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDialog = (building: BuildingItem | null = null) => {
    setEditingBuilding(building);
    if (building) {
      form.reset({
        id: building.id,
        name: building.name,
        address: building.address,
      });
    } else {
      form.reset({ name: '', address: '' });
    }
    setIsDialogOpen(true);
  };

  const onSubmit = async (data: BuildingFormData) => {
    setIsSubmitting(true);
    try {
      let response;
      const payload = { name: data.name, address: data.address };

      if (editingBuilding && data.id) {
        response = await updateItem('buildings', data.id, payload);
        toast({ title: "Success", description: "Building updated successfully." });
      } else {
        response = await createItem('buildings', payload);
        toast({ title: "Success", description: "Building created successfully." });
      }
      
      if (response.success) {
        loadBuildings();
        setIsDialogOpen(false);
      } else {
        toast({ title: "Error", description: response.error || "Failed to save building.", variant: "destructive" });
      }
    } catch (error: any) {
      toast({ title: "Error", description: error.message || "An error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBuilding = async () => {
    if (!buildingToDelete) return;
    setIsSubmitting(true);
    try {
      await deleteItem('buildings', buildingToDelete.id);
      toast({ title: "Success", description: `Building "${buildingToDelete.name}" deleted.` });
      setBuildingToDelete(null);
      loadBuildings();
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete building. It might be associated with rooms.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBuildings = useMemo(() => {
    return buildings.filter(bldg =>
      bldg.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (bldg.address && bldg.address.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [buildings, searchTerm]);

  const BuildingRowSkeleton = () => (
    <TableRow>
      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
      <TableCell><Skeleton className="h-5 w-48" /></TableCell>
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
                <Building className="mr-3 h-7 w-7 text-primary"/> Building Management
              </CardTitle>
              <CardDescription>Manage campus buildings and their locations.</CardDescription>
            </div>
            <Button onClick={() => handleOpenDialog(null)}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add New Building
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6 p-4 border rounded-lg bg-background shadow">
            <Label htmlFor="search-building" className="block text-sm font-medium text-muted-foreground mb-1">Search Buildings</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search-building"
                placeholder="Search by name or address..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {isLoading ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array.from({ length: 3 }).map((_, i) => <BuildingRowSkeleton key={i} />)}
              </TableBody>
            </Table>
          ) : filteredBuildings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBuildings.map(bldg => (
                  <TableRow key={bldg.id}>
                    <TableCell className="font-medium">{bldg.name}</TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-md">{bldg.address || 'N/A'}</TableCell>
                    <TableCell className="space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleOpenDialog(bldg)}>
                        <Edit className="mr-1 h-4 w-4" /> Edit
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => setBuildingToDelete(bldg)}>
                        <Trash2 className="mr-1 h-4 w-4" /> Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-8">No buildings found{searchTerm ? ' matching your search' : ''}.</p>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          form.reset();
          setEditingBuilding(null);
        }
        setIsDialogOpen(open);
      }}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-headline">{editingBuilding ? 'Edit Building' : 'Add New Building'}</DialogTitle>
            <DialogDescription>
              {editingBuilding ? 'Modify the building details below.' : 'Fill in the details to create a new building.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
            <div>
              <Label htmlFor="name">Building Name</Label>
              <Input id="name" {...form.register('name')} />
              {form.formState.errors.name && <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>}
            </div>
            <div>
              <Label htmlFor="address">Address (Optional)</Label>
              <Textarea id="address" {...form.register('address')} />
              {form.formState.errors.address && <p className="text-sm text-destructive mt-1">{form.formState.errors.address.message}</p>}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {editingBuilding ? 'Save Changes' : 'Create Building'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {buildingToDelete && (
        <AlertDialog open={!!buildingToDelete} onOpenChange={() => setBuildingToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure you want to delete this building?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. Deleting building "{buildingToDelete.name}" might affect associated rooms and scheduled courses.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setBuildingToDelete(null)}>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteBuilding} disabled={isSubmitting} className="bg-destructive hover:bg-destructive/90">
                {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Delete Building
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}

    