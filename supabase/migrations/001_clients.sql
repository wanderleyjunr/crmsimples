CREATE TABLE public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  avatar_url TEXT,
  cep TEXT,
  street TEXT,
  number TEXT,
  complement TEXT,
  neighborhood TEXT,
  city TEXT,
  state TEXT CHECK (state IS NULL OR char_length(state) = 2),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX idx_clients_user_id ON public.clients(user_id);
CREATE INDEX idx_clients_name ON public.clients(user_id, name);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "clients_select" ON public.clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "clients_insert" ON public.clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "clients_update" ON public.clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "clients_delete" ON public.clients FOR DELETE USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();
