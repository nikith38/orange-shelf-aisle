-- Migration file to add user_interactions table for AI recommendations

-- Create user_interactions table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'cart', 'purchase')),
  interaction_count INTEGER DEFAULT 1,
  rating DECIMAL(3,2),
  last_interacted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, interaction_type)
);

-- Enable RLS on the table
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;

-- Create policies for user_interactions
CREATE POLICY "Users can manage their own interactions" ON public.user_interactions
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interactions" ON public.user_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions" ON public.user_interactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions" ON public.user_interactions
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS user_interactions_user_id_idx ON public.user_interactions(user_id);
CREATE INDEX IF NOT EXISTS user_interactions_product_id_idx ON public.user_interactions(product_id);
CREATE INDEX IF NOT EXISTS user_interactions_type_idx ON public.user_interactions(interaction_type); 