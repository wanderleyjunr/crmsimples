CREATE TYPE public.task_status AS ENUM ('todo', 'doing', 'done');
CREATE TYPE public.task_priority AS ENUM ('low', 'medium', 'high');

CREATE TABLE public.tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status public.task_status DEFAULT 'todo' NOT NULL,
  priority public.task_priority DEFAULT 'medium' NOT NULL,
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX idx_tasks_status ON public.tasks(user_id, status);
CREATE INDEX idx_tasks_due_date ON public.tasks(user_id, due_date);
CREATE INDEX idx_tasks_client_id ON public.tasks(client_id);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tasks_delete" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
