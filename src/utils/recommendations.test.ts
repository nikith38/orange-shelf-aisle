import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InteractionType, trackInteraction, trackProductView, trackProductLike, trackAddToCart } from './recommendations';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase client
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(),
    update: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
  }
}));

describe('Recommendation Utilities', () => {
  const mockProduct = {
    id: 'product-123',
    name: 'Test Product',
    price: 99.99,
    rating: 4.5,
    reviewCount: 100,
    image: 'test.jpg',
    images: ['test.jpg'],
    category: 'Electronics',
    description: 'A test product',
    features: ['Feature 1', 'Feature 2'],
    inStock: true,
    brand: 'Test Brand',
    tags: ['test', 'electronics']
  };

  const mockUserId = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('trackInteraction', () => {
    it('should update existing interaction if it exists', async () => {
      // Mock existing interaction
      const mockExistingInteraction = {
        id: 'interaction-123',
        user_id: mockUserId,
        product_id: mockProduct.id,
        interaction_type: InteractionType.VIEW,
        interaction_count: 1
      };

      // Setup mocks
      supabase.select = vi.fn().mockReturnThis();
      supabase.single = vi.fn().mockResolvedValue({ data: mockExistingInteraction });
      supabase.update = vi.fn().mockReturnThis();
      supabase.eq = vi.fn().mockResolvedValue({ data: null });

      // Call function
      await trackInteraction(mockUserId, mockProduct.id, InteractionType.VIEW);

      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('user_interactions');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(supabase.eq).toHaveBeenCalledWith('product_id', mockProduct.id);
      expect(supabase.eq).toHaveBeenCalledWith('interaction_type', InteractionType.VIEW);
      expect(supabase.update).toHaveBeenCalled();
    });

    it('should create new interaction if it does not exist', async () => {
      // Setup mocks
      supabase.select = vi.fn().mockReturnThis();
      supabase.single = vi.fn().mockResolvedValue({ data: null });
      supabase.insert = vi.fn().mockReturnThis();

      // Call function
      await trackInteraction(mockUserId, mockProduct.id, InteractionType.VIEW);

      // Assertions
      expect(supabase.from).toHaveBeenCalledWith('user_interactions');
      expect(supabase.insert).toHaveBeenCalledWith({
        user_id: mockUserId,
        product_id: mockProduct.id,
        interaction_type: InteractionType.VIEW,
        interaction_count: 1,
        last_interacted_at: expect.any(String)
      });
    });

    it('should not call supabase if userId or productId is missing', async () => {
      await trackInteraction('', mockProduct.id, InteractionType.VIEW);
      expect(supabase.from).not.toHaveBeenCalled();

      await trackInteraction(mockUserId, '', InteractionType.VIEW);
      expect(supabase.from).not.toHaveBeenCalled();
    });
  });

  describe('trackProductView', () => {
    it('should call trackInteraction with VIEW type', async () => {
      const spy = vi.spyOn(global, 'trackInteraction').mockImplementation(async () => {});
      
      await trackProductView(mockUserId, mockProduct);
      
      expect(spy).toHaveBeenCalledWith(mockUserId, mockProduct.id, InteractionType.VIEW);
    });
  });

  describe('trackProductLike', () => {
    it('should call trackInteraction with LIKE type when isLiked is true', async () => {
      const spy = vi.spyOn(global, 'trackInteraction').mockImplementation(async () => {});
      
      await trackProductLike(mockUserId, mockProduct, true);
      
      expect(spy).toHaveBeenCalledWith(mockUserId, mockProduct.id, InteractionType.LIKE);
    });

    it('should delete interaction when isLiked is false', async () => {
      await trackProductLike(mockUserId, mockProduct, false);
      
      expect(supabase.from).toHaveBeenCalledWith('user_interactions');
      expect(supabase.delete).toHaveBeenCalled();
      expect(supabase.eq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(supabase.eq).toHaveBeenCalledWith('product_id', mockProduct.id);
      expect(supabase.eq).toHaveBeenCalledWith('interaction_type', InteractionType.LIKE);
    });
  });

  describe('trackAddToCart', () => {
    it('should call trackInteraction with CART type', async () => {
      const spy = vi.spyOn(global, 'trackInteraction').mockImplementation(async () => {});
      
      await trackAddToCart(mockUserId, mockProduct);
      
      expect(spy).toHaveBeenCalledWith(mockUserId, mockProduct.id, InteractionType.CART);
    });
  });
}); 