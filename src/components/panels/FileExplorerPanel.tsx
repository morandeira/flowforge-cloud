import React, { useState } from 'react';
import { 
  X, 
  Folder, 
  File, 
  Plus, 
  Upload, 
  Download, 
  Trash2, 
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  FolderPlus
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

import { useFlowStore } from '@/stores/flowStore';
import { useAppStore } from '@/stores/appStore';
import { FileSystemItem } from '@/types';

// Mock file system data
const mockFileSystem: FileSystemItem[] = [
  {
    id: 'folder_1',
    nodeId: 'node_1',
    name: 'config',
    path: '/config',
    type: 'folder',
    createdAt: '2024-01-01T00:00:00Z',
    modifiedAt: '2024-01-01T00:00:00Z',
    children: [
      {
        id: 'file_1',
        nodeId: 'node_1',
        name: 'settings.json',
        path: '/config/settings.json',
        type: 'file',
        mimeType: 'application/json',
        size: 1024,
        url: 'https://example.com/file1',
        createdAt: '2024-01-01T00:00:00Z',
        modifiedAt: '2024-01-01T00:00:00Z',
      },
      {
        id: 'file_2',
        nodeId: 'node_1',
        name: 'environment.env',
        path: '/config/environment.env',
        type: 'file',
        mimeType: 'text/plain',
        size: 512,
        url: 'https://example.com/file2',
        createdAt: '2024-01-01T00:00:00Z',
        modifiedAt: '2024-01-01T00:00:00Z',
      },
    ],
  },
  {
    id: 'folder_2',
    nodeId: 'node_1',
    name: 'data',
    path: '/data',
    type: 'folder',
    createdAt: '2024-01-01T00:00:00Z',
    modifiedAt: '2024-01-01T00:00:00Z',
    children: [
      {
        id: 'file_3',
        nodeId: 'node_1',
        name: 'input.csv',
        path: '/data/input.csv',
        type: 'file',
        mimeType: 'text/csv',
        size: 2048,
        url: 'https://example.com/file3',
        createdAt: '2024-01-01T00:00:00Z',
        modifiedAt: '2024-01-01T00:00:00Z',
      },
    ],
  },
  {
    id: 'file_4',
    nodeId: 'node_1',
    name: 'readme.md',
    path: '/readme.md',
    type: 'file',
    mimeType: 'text/markdown',
    size: 256,
    url: 'https://example.com/file4',
    createdAt: '2024-01-01T00:00:00Z',
    modifiedAt: '2024-01-01T00:00:00Z',
  },
];

interface FileExplorerPanelProps {
  onClose: () => void;
}

interface FileTreeItemProps {
  item: FileSystemItem;
  level?: number;
  onToggle?: (id: string) => void;
  expandedFolders?: Set<string>;
}

function FileTreeItem({ item, level = 0, onToggle, expandedFolders }: FileTreeItemProps) {
  const { toast } = useToast();
  const isExpanded = expandedFolders?.has(item.id) || false;

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
  };

  const handleDownload = () => {
    if (item.url) {
      window.open(item.url, '_blank');
    }
    toast({
      title: "Download started",
      description: `Downloading ${item.name}`,
    });
  };

  const handleDelete = () => {
    toast({
      title: "File deleted",
      description: `${item.name} has been deleted`,
      variant: "destructive",
    });
  };

  return (
    <div>
      <div 
        className="flex items-center gap-2 py-1 px-2 hover:bg-muted/50 rounded group"
        style={{ paddingLeft: `${level * 16 + 8}px` }}
      >
        {item.type === 'folder' && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={() => onToggle?.(item.id)}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </Button>
        )}
        
        {item.type === 'folder' ? (
          <Folder className="w-4 h-4 text-blue-500 flex-shrink-0" />
        ) : (
          <File className="w-4 h-4 text-muted-foreground flex-shrink-0" />
        )}
        
        <span className="flex-1 text-sm truncate">{item.name}</span>
        
        {item.type === 'file' && item.size && (
          <span className="text-xs text-muted-foreground">
            {formatFileSize(item.size)}
          </span>
        )}
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {item.type === 'file' && (
              <DropdownMenuItem onClick={handleDownload}>
                <Download className="w-4 h-4 mr-2" />
                Download
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={handleDelete} className="text-destructive">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {item.type === 'folder' && isExpanded && item.children && (
        <div>
          {item.children.map(child => (
            <FileTreeItem
              key={child.id}
              item={child}
              level={level + 1}
              onToggle={onToggle}
              expandedFolders={expandedFolders}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export function FileExplorerPanel({ onClose }: FileExplorerPanelProps) {
  const { toast } = useToast();
  const { nodes } = useFlowStore();
  const { selectedNodeId } = useAppStore();
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['folder_1']));
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);

  const currentNode = nodes.find(node => node.id === selectedNodeId);

  const handleToggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const handleCreateFolder = () => {
    if (newFolderName.trim()) {
      toast({
        title: "Folder created",
        description: `Created folder: ${newFolderName}`,
      });
      setNewFolderName('');
      setShowNewFolderInput(false);
    }
  };

  const handleFileUpload = () => {
    toast({
      title: "File upload",
      description: "File upload functionality would be implemented here",
    });
  };

  if (!currentNode) {
    return (
      <div className="w-80 h-full bg-card border-l border-border flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Folder className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Select a node to explore its files</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 h-full bg-card border-l border-border flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Folder className="w-5 h-5" />
          <h2 className="font-semibold">File Explorer</h2>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-medium">Node: {currentNode.data.label}</h3>
          <Badge variant="secondary" className="text-xs">{currentNode.type}</Badge>
        </div>
        <div className="text-xs text-muted-foreground mb-3">
          Root: {currentNode.data.fileSystemRoot}
        </div>
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            onClick={() => setShowNewFolderInput(true)}
            className="flex-1"
          >
            <FolderPlus className="w-4 h-4 mr-2" />
            New Folder
          </Button>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleFileUpload}
            className="flex-1"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </div>
        
        {showNewFolderInput && (
          <div className="mt-3 flex gap-2">
            <Input
              placeholder="Folder name"
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              className="flex-1"
            />
            <Button size="sm" onClick={handleCreateFolder}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {mockFileSystem.map(item => (
            <FileTreeItem
              key={item.id}
              item={item}
              onToggle={handleToggleFolder}
              expandedFolders={expandedFolders}
            />
          ))}
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <div className="text-xs text-muted-foreground space-y-1">
          <div>Storage: 2.8 MB / 100 MB used</div>
          <div>Files: {mockFileSystem.flatMap(item => 
            item.type === 'file' ? [item] : item.children || []
          ).length}</div>
        </div>
      </div>
    </div>
  );
}