-- Create user profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE public.products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10,2) NOT NULL,
  original_price DECIMAL(10,2),
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INTEGER DEFAULT 0,
  image TEXT,
  images TEXT[],
  category TEXT NOT NULL,
  brand TEXT,
  features TEXT[],
  in_stock BOOLEAN DEFAULT true,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user interactions table
CREATE TABLE public.user_interactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products ON DELETE CASCADE NOT NULL,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('view', 'like', 'cart', 'purchase')),
  rating DECIMAL(3,2),
  interaction_count INTEGER DEFAULT 1,
  last_interacted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id, interaction_type)
);

-- Create user preferences table
CREATE TABLE public.user_preferences (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  categories TEXT[],
  price_range_min DECIMAL(10,2) DEFAULT 0,
  price_range_max DECIMAL(10,2) DEFAULT 2000,
  brands TEXT[],
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create cart items table
CREATE TABLE public.cart_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  product_id UUID REFERENCES public.products ON DELETE CASCADE NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, product_id)
);

-- Create orders table
CREATE TABLE public.orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  total DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create order items table
CREATE TABLE public.order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for products (public read access)
CREATE POLICY "Anyone can view products" ON public.products
  FOR SELECT USING (true);

-- RLS Policies for user interactions
CREATE POLICY "Users can view their own interactions" ON public.user_interactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interactions" ON public.user_interactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interactions" ON public.user_interactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interactions" ON public.user_interactions
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user preferences
CREATE POLICY "Users can view their own preferences" ON public.user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own preferences" ON public.user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own preferences" ON public.user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for cart items
CREATE POLICY "Users can view their own cart items" ON public.cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cart items" ON public.cart_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cart items" ON public.cart_items
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cart items" ON public.cart_items
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for orders
CREATE POLICY "Users can read their own orders" ON public.orders
  FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for order items
CREATE POLICY "Users can read their own order items" ON public.order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (new.id, new.raw_user_meta_data->>'name', new.email);
  
  INSERT INTO public.user_preferences (user_id)
  VALUES (new.id);
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert sample products from JSON data
INSERT INTO public.products (name, description, price, original_price, rating, review_count, image, images, category, brand, features, in_stock, tags) VALUES
('Wireless Bluetooth Headphones', 'High-quality wireless headphones with noise cancellation and long battery life.', 79.99, 99.99, 4.5, 1250, 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 'https://images.unsplash.com/photo-1484704849700-f032a568e944?w=400'], 'Electronics', 'AudioTech', ARRAY['Noise Cancellation', 'Wireless', '30-hour battery'], true, ARRAY['headphones', 'audio', 'wireless']),

('Premium Coffee Maker', 'Professional-grade coffee maker with programmable settings and thermal carafe.', 149.99, 199.99, 4.3, 890, 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400', ARRAY['https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400', 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=400'], 'Home & Kitchen', 'BrewMaster', ARRAY['Programmable', 'Thermal Carafe', '12-cup capacity'], true, ARRAY['coffee', 'kitchen', 'appliance']),

('Organic Dog Food', 'Premium organic dog food made with real chicken and vegetables.', 45.99, NULL, 4.7, 2150, 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400', ARRAY['https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400'], 'Pets', 'NaturalPaws', ARRAY['Organic', 'Real Chicken', 'No Fillers'], true, ARRAY['dog food', 'organic', 'pet care']),

('Running Shoes', 'Lightweight running shoes with advanced cushioning technology.', 129.99, 159.99, 4.4, 967, 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', ARRAY['https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400'], 'Sports & Outdoors', 'RunTech', ARRAY['Lightweight', 'Advanced Cushioning', 'Breathable'], true, ARRAY['shoes', 'running', 'sports']),

('Smartphone', 'Latest smartphone with advanced camera system and long-lasting battery.', 699.99, 799.99, 4.6, 3420, 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', ARRAY['https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400', 'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?w=400'], 'Electronics', 'TechPro', ARRAY['Advanced Camera', 'Long Battery', '5G Ready'], true, ARRAY['smartphone', 'mobile', 'technology']),

('Yoga Mat', 'Eco-friendly yoga mat with superior grip and cushioning.', 39.99, 49.99, 4.2, 445, 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', ARRAY['https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400', 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'], 'Sports & Outdoors', 'ZenFit', ARRAY['Eco-friendly', 'Non-slip', 'Extra Thick'], true, ARRAY['yoga', 'fitness', 'exercise']),

('Gourmet Chocolate', 'Artisan dark chocolate collection with exotic flavors.', 24.99, NULL, 4.8, 1890, 'https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400', ARRAY['https://images.unsplash.com/photo-1549007994-cb92caebd54b?w=400', 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400'], 'Food & Beverages', 'ChocolateCraft', ARRAY['Artisan Made', 'Dark Chocolate', 'Exotic Flavors'], true, ARRAY['chocolate', 'gourmet', 'gift']),

('Cat Toy Set', 'Interactive cat toy set with feathers, balls, and puzzle games.', 19.99, 29.99, 4.1, 678, 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400', ARRAY['https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=400', 'https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400'], 'Pets', 'PlayfulPaws', ARRAY['Interactive', 'Multiple Toys', 'Mental Stimulation'], true, ARRAY['cat toys', 'interactive', 'pet entertainment']);
