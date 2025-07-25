import React from 'react';
import { 
  Plus,
  Users,
  Crown,
  Shield,
  User,
  Mail,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import { useSessionStore } from '@/stores/sessionStore';

// Mock team data
const teamMembers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@company.com',
    role: 'owner',
    avatar: null,
    joinedAt: '2024-01-01T00:00:00Z',
    lastActive: '2024-01-25T10:30:00Z',
    workspaces: 5
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@company.com',
    role: 'admin',
    avatar: null,
    joinedAt: '2024-01-02T00:00:00Z',
    lastActive: '2024-01-25T09:15:00Z',
    workspaces: 3
  },
  {
    id: '3',
    name: 'Bob Wilson',
    email: 'bob@company.com',
    role: 'editor',
    avatar: null,
    joinedAt: '2024-01-10T00:00:00Z',
    lastActive: '2024-01-24T16:45:00Z',
    workspaces: 2
  },
  {
    id: '4',
    name: 'Sarah Davis',
    email: 'sarah@company.com',
    role: 'viewer',
    avatar: null,
    joinedAt: '2024-01-15T00:00:00Z',
    lastActive: '2024-01-25T08:20:00Z',
    workspaces: 1
  }
];

const pendingInvites = [
  {
    id: '1',
    email: 'alex@company.com',
    role: 'editor',
    invitedAt: '2024-01-20T00:00:00Z',
    invitedBy: 'John Doe'
  },
  {
    id: '2',
    email: 'maria@company.com',
    role: 'viewer',
    invitedAt: '2024-01-22T00:00:00Z',
    invitedBy: 'Jane Smith'
  }
];

export default function Team() {
  const { user } = useSessionStore();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'editor':
        return <Edit className="w-4 h-4 text-green-500" />;
      default:
        return <User className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      owner: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      admin: 'bg-blue-100 text-blue-800 border-blue-200',
      editor: 'bg-green-100 text-green-800 border-green-200',
      viewer: 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <Badge className={variants[role as keyof typeof variants]} variant="outline">
        {role}
      </Badge>
    );
  };

  const handleInviteMember = () => {
    // TODO: Implement invite member functionality
    console.log('Invite member clicked');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Team</h1>
          <p className="text-muted-foreground mt-1">
            Manage your team members and their access levels
          </p>
        </div>
        <Button onClick={handleInviteMember} className="bg-gradient-primary hover:opacity-90">
          <Plus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Team Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-sm text-muted-foreground">Total Members</span>
            </div>
            <div className="text-2xl font-bold mt-1">{teamMembers.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Crown className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-muted-foreground">Owners</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {teamMembers.filter(m => m.role === 'owner').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Admins</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {teamMembers.filter(m => m.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-orange-500" />
              <span className="text-sm text-muted-foreground">Pending</span>
            </div>
            <div className="text-2xl font-bold mt-1">{pendingInvites.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Team Members */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Team Members
          </CardTitle>
          <CardDescription>
            Manage access levels and permissions for your team
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Workspaces</TableHead>
                <TableHead>Last Active</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {teamMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.email}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getRoleIcon(member.role)}
                      {getRoleBadge(member.role)}
                    </div>
                  </TableCell>
                  <TableCell>{member.workspaces}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(member.lastActive).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {member.id !== user?.id && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Edit Role</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pending Invites */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Pending Invites
            </CardTitle>
            <CardDescription>
              Members who have been invited but haven't joined yet
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>Invited At</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingInvites.map((invite) => (
                  <TableRow key={invite.id}>
                    <TableCell className="font-medium">{invite.email}</TableCell>
                    <TableCell>{getRoleBadge(invite.role)}</TableCell>
                    <TableCell className="text-muted-foreground">{invite.invitedBy}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(invite.invitedAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>Resend Invite</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Cancel Invite
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}