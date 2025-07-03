
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product } from '@/types';

export function useSupabaseProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Transform Supabase data to match our Product interface
      const transformedProducts: Product[] = (data || []).map(product => ({
        id: product.id,
        name: product.name,
        price: Number(product.price),
        originalPrice: product.original_price ? Number(product.original_price) : undefined,
        rating: Number(product.rating) || 0,
        reviewCount: product.review_count || 0,
        image: product.image || '',
        images: product.images || [],
        category: product.category,
        description: product.description || '',
        features: product.features || [],
        inStock: product.in_stock ?? true,
        brand: product.brand || '',
        tags: product.tags || []
      }));

      setProducts(transformedProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  return { products, loading, error, refetch: fetchProducts };
}
