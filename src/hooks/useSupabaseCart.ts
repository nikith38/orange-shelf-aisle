
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, CartItem } from '@/types';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useToast } from '@/hooks/use-toast';

export function useSupabaseCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      fetchCartItems();
    } else {
      setItems([]);
    }
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('cart_items')
        .select(`
          *,
          products (*)
        `)
        .eq('user_id', user.id);

      if (error) throw error;

      const cartItems: CartItem[] = (data || []).map(item => ({
        product: {
          id: item.products.id,
          name: item.products.name,
          price: Number(item.products.price),
          originalPrice: item.products.original_price ? Number(item.products.original_price) : undefined,
          rating: Number(item.products.rating) || 0,
          reviewCount: item.products.review_count || 0,
          image: item.products.image || '',
          images: item.products.images || [],
          category: item.products.category,
          description: item.products.description || '',
          features: item.products.features || [],
          inStock: item.products.in_stock ?? true,
          brand: item.products.brand || '',
          tags: item.products.tags || []
        },
        quantity: item.quantity
      }));

      setItems(cartItems);
    } catch (error) {
      console.error('Error fetching cart items:', error);
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (product: Product, quantity: number = 1) => {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to add items to cart.",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .upsert({
          user_id: user.id,
          product_id: product.id,
          quantity: quantity
        });

      if (error) throw error;

      await fetchCartItems();
      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      console.error('Error adding item to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    }
  };

  const removeItem = async (productId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      await fetchCartItems();
      toast({
        title: "Removed from cart",
        description: "Item has been removed from your cart.",
      });
    } catch (error) {
      console.error('Error removing item from cart:', error);
    }
  };

  const updateQuantity = async (productId: string, quantity: number) => {
    if (!user) return;

    if (quantity <= 0) {
      await removeItem(productId);
      return;
    }

    try {
      const { error } = await supabase
        .from('cart_items')
        .update({ quantity })
        .eq('user_id', user.id)
        .eq('product_id', productId);

      if (error) throw error;

      await fetchCartItems();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const clearCart = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setItems([]);
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart.",
      });
    } catch (error) {
      console.error('Error clearing cart:', error);
    }
  };

  const getTotalPrice = (): number => {
    return items.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = (): number => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  return {
    items,
    loading,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems
  };
}
