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
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useWorkspaceStore } from '@/stores/workspaceStore';
import { useSessionStore } from '@/stores/sessionStore';
import { Flow } from '@/types';

const flowSchema = z.object({
  name: z.string().min(2, {
    message: "Flow name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  category: z.string().min(1, {
    message: "Please select a category.",
  }),
  version: z.string().default("1.0.0"),
});

const categoryOptions = [
  "Business Process",
  "Data Pipeline", 
  "QA Process",
  "API Integration",
  "Automation",
  "Workflow",
  "Other"
];

interface CreateFlowModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workspaceId: string;
  onFlowCreated?: (flow: Flow) => void;
}

export function CreateFlowModal({ open, onOpenChange, workspaceId, onFlowCreated }: CreateFlowModalProps) {
  const { addFlow } = useWorkspaceStore();
  const { user } = useSessionStore();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof flowSchema>>({
    resolver: zodResolver(flowSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      version: "1.0.0",
    },
  });

  const onSubmit = async (values: z.infer<typeof flowSchema>) => {
    if (!user) return;

    setIsLoading(true);
    
    try {
      const newFlow: Flow = {
        id: `flow_${Date.now()}`,
        workspaceId,
        name: values.name,
        description: values.description || '',
        version: values.version,
        status: 'draft',
        nodes: [],
        edges: [],
        metadata: {
          tags: [],
          category: values.category,
          author: user.name,
          lastModifiedBy: user.name,
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      addFlow(workspaceId, newFlow);
      
      // Call optional callback
      onFlowCreated?.(newFlow);
      
      // Reset form and close modal
      form.reset();
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating flow:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Flow</DialogTitle>
          <DialogDescription>
            Create a new workflow to automate your business processes.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Flow Name</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter flow name" 
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
                      placeholder="Describe what this flow does..."
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
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categoryOptions.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Version</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="1.0.0" 
                      {...field} 
                    />
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
                {isLoading ? "Creating..." : "Create Flow"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}