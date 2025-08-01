import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

import { useWorkspaceStore } from '@/stores/workspaceStore';
import { Workspace } from '@/types';

const editWorkspaceSchema = z.object({
  name: z.string().min(2, {
    message: "Workspace name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  color: z.string().min(4, {
    message: "Please select a color.",
  }),
});

const colorOptions = [
  '#8B5CF6', // Purple
  '#059669', // Green
  '#DC2626', // Red
  '#2563EB', // Blue
  '#D97706', // Orange
  '#7C3AED', // Violet
  '#0891B2', // Cyan
  '#BE185D', // Pink
];

interface EditWorkspaceModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspace: Workspace;
}

export function EditWorkspaceModal({ open, onOpenChange, workspace }: EditWorkspaceModalProps) {
  const { updateWorkspace } = useWorkspaceStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof editWorkspaceSchema>>({
    resolver: zodResolver(editWorkspaceSchema),
    defaultValues: {
      name: workspace.name,
      description: workspace.description || "",
      color: workspace.color,
    },
  });

  const onSubmit = async (values: z.infer<typeof editWorkspaceSchema>) => {
    setIsLoading(true);
    
    try {
      updateWorkspace(workspace.id, {
        name: values.name,
        description: values.description || '',
        color: values.color,
        updatedAt: new Date().toISOString(),
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating workspace:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Workspace</DialogTitle>
          <DialogDescription>
            Update your workspace details and settings.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Workspace Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter workspace name" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this workspace is for..."
                      className="resize-none"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color Theme</FormLabel>
                  <FormControl>
                    <div className="flex flex-wrap gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`w-8 h-8 rounded-full border-2 transition-all ${
                            field.value === color 
                              ? 'border-foreground scale-110' 
                              : 'border-border hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading}
                className="bg-gradient-primary hover:opacity-90"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}