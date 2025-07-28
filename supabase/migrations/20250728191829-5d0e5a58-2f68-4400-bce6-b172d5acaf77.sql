-- Create profiles table for user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  email TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create workspaces table
CREATE TABLE public.workspaces (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#8B5CF6',
  flow_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on workspaces
ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- Create workspace_members table for managing workspace access
CREATE TABLE public.workspace_members (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (workspace_id, user_id)
);

-- Enable RLS on workspace_members
ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

-- Create flows table
CREATE TABLE public.flows (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  version TEXT DEFAULT '1.0.0',
  category TEXT,
  tags TEXT[],
  flow_data JSONB DEFAULT '{"nodes": [], "edges": []}'::jsonb,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on flows
ALTER TABLE public.flows ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for workspaces
CREATE POLICY "Users can view workspaces they are members of" 
ON public.workspaces 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE workspace_id = workspaces.id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can create workspaces" 
ON public.workspaces 
FOR INSERT 
WITH CHECK (auth.uid() = tenant_id);

CREATE POLICY "Workspace owners and admins can update workspaces" 
ON public.workspaces 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE workspace_id = workspaces.id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);

CREATE POLICY "Workspace owners can delete workspaces" 
ON public.workspaces 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE workspace_id = workspaces.id 
    AND user_id = auth.uid() 
    AND role = 'owner'
  )
);

-- Create RLS policies for workspace_members
CREATE POLICY "Users can view workspace members for workspaces they belong to" 
ON public.workspace_members 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members wm 
    WHERE wm.workspace_id = workspace_members.workspace_id 
    AND wm.user_id = auth.uid()
  )
);

CREATE POLICY "Workspace owners can manage members" 
ON public.workspace_members 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE workspace_id = workspace_members.workspace_id 
    AND user_id = auth.uid() 
    AND role = 'owner'
  )
);

-- Create RLS policies for flows
CREATE POLICY "Users can view flows in workspaces they are members of" 
ON public.flows 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE workspace_id = flows.workspace_id 
    AND user_id = auth.uid()
  )
);

CREATE POLICY "Workspace members with editor+ role can create flows" 
ON public.flows 
FOR INSERT 
WITH CHECK (
  auth.uid() = created_by
  AND EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE workspace_id = flows.workspace_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'admin', 'editor')
  )
);

CREATE POLICY "Workspace members with editor+ role can update flows" 
ON public.flows 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE workspace_id = flows.workspace_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'admin', 'editor')
  )
);

CREATE POLICY "Workspace owners and admins can delete flows" 
ON public.flows 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.workspace_members 
    WHERE workspace_id = flows.workspace_id 
    AND user_id = auth.uid() 
    AND role IN ('owner', 'admin')
  )
);

-- Create function to automatically create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, display_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'full_name', 'User'),
    NEW.email
  );
  RETURN NEW;
END;
$$;

-- Create trigger to handle new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_flows_updated_at
  BEFORE UPDATE ON public.flows
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to automatically add creator as workspace owner
CREATE OR REPLACE FUNCTION public.handle_new_workspace()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (NEW.id, NEW.tenant_id, 'owner');
  RETURN NEW;
END;
$$;

-- Create trigger to handle new workspace creation
CREATE TRIGGER on_workspace_created
  AFTER INSERT ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_workspace();

-- Create function to update workspace flow count
CREATE OR REPLACE FUNCTION public.update_workspace_flow_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.workspaces 
    SET flow_count = flow_count + 1 
    WHERE id = NEW.workspace_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.workspaces 
    SET flow_count = flow_count - 1 
    WHERE id = OLD.workspace_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;

-- Create triggers to maintain flow count
CREATE TRIGGER update_flow_count_on_insert
  AFTER INSERT ON public.flows
  FOR EACH ROW EXECUTE FUNCTION public.update_workspace_flow_count();

CREATE TRIGGER update_flow_count_on_delete
  AFTER DELETE ON public.flows
  FOR EACH ROW EXECUTE FUNCTION public.update_workspace_flow_count();