
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, RecommendationScore } from '@/types';
import { useAuth } from '@/contexts/SupabaseAuthContext';

export function useSupabaseRecommendations(products: Product[]) {
  const [recommendations, setRecommendations] = useState<{
    hybrid: RecommendationScore[];
    contentBased: RecommendationScore[];
    collaborative: RecommendationScore[];
  }>({
    hybrid: [],
    contentBased: [],
    collaborative: []
  });
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && products.length > 0) {
      generateRecommendations();
    }
  }, [user, products]);

  const generateRecommendations = async () => {
    if (!user || products.length === 0) return;

    try {
      setLoading(true);

      // Fetch user interactions
      const { data: interactions, error } = await supabase
        .from('user_interactions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;

      // Simple content-based recommendations
      const contentBased = generateContentBasedRecommendations(products, interactions || []);
      
      // Simple collaborative recommendations (based on popular items in liked categories)
      const collaborative = generateCollaborativeRecommendations(products, interactions || []);
      
      // Hybrid recommendations (combine both approaches)
      const hybrid = combineRecommendations(contentBased, collaborative);

      setRecommendations({
        hybrid: hybrid.slice(0, 8),
        contentBased: contentBased.slice(0, 8),
        collaborative: collaborative.slice(0, 8)
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateContentBasedRecommendations = (products: Product[], interactions: any[]): RecommendationScore[] => {
    const interactedProductIds = new Set(interactions.map(i => i.product_id));
    const likedProducts = interactions.filter(i => i.interaction_type === 'like');
    
    if (likedProducts.length === 0) {
      // Return popular products if no likes yet
      return products
        .filter(p => !interactedProductIds.has(p.id))
        .sort((a, b) => b.rating * b.reviewCount - a.rating * a.reviewCount)
        .slice(0, 10)
        .map(p => ({
          productId: p.id,
          score: p.rating * Math.log(p.reviewCount + 1),
          reason: 'Popular products'
        }));
    }

    // Get categories and brands of liked products
    const likedCategories = new Set(
      likedProducts.map(i => products.find(p => p.id === i.product_id)?.category).filter(Boolean)
    );
    const likedBrands = new Set(
      likedProducts.map(i => products.find(p => p.id === i.product_id)?.brand).filter(Boolean)
    );

    return products
      .filter(p => !interactedProductIds.has(p.id))
      .map(product => {
        let score = 0;
        let reason = 'Based on your preferences';

        // Category match
        if (likedCategories.has(product.category)) {
          score += 3;
        }

        // Brand match
        if (likedBrands.has(product.brand)) {
          score += 2;
        }

        // Rating boost
        score += product.rating;

        // Popularity boost
        score += Math.log(product.reviewCount + 1) / 10;

        return {
          productId: product.id,
          score,
          reason
        };
      })
      .sort((a, b) => b.score - a.score);
  };

  const generateCollaborativeRecommendations = (products: Product[], interactions: any[]): RecommendationScore[] => {
    const interactedProductIds = new Set(interactions.map(i => i.product_id));
    
    // Simple collaborative filtering based on category preferences
    const categoryInteractions: Record<string, number> = {};
    
    interactions.forEach(interaction => {
      const product = products.find(p => p.id === interaction.product_id);
      if (product) {
        const weight = interaction.interaction_type === 'like' ? 3 : 
                      interaction.interaction_type === 'cart' ? 2 : 1;
        categoryInteractions[product.category] = (categoryInteractions[product.category] || 0) + weight;
      }
    });

    return products
      .filter(p => !interactedProductIds.has(p.id))
      .map(product => {
        const categoryScore = categoryInteractions[product.category] || 0;
        const popularityScore = Math.log(product.reviewCount + 1) / 10;
        const ratingScore = product.rating / 5;
        
        const score = categoryScore * 0.5 + popularityScore * 0.3 + ratingScore * 0.2;
        
        return {
          productId: product.id,
          score,
          reason: 'Popular in your categories'
        };
      })
      .sort((a, b) => b.score - a.score);
  };

  const combineRecommendations = (contentBased: RecommendationScore[], collaborative: RecommendationScore[]): RecommendationScore[] => {
    const combined: Record<string, RecommendationScore> = {};

    // Add content-based recommendations with weight
    contentBased.forEach(item => {
      combined[item.productId] = {
        productId: item.productId,
        score: item.score * 0.6,
        reason: 'Based on preferences and popularity'
      };
    });

    // Add collaborative recommendations with weight
    collaborative.forEach(item => {
      if (combined[item.productId]) {
        combined[item.productId].score += item.score * 0.4;
      } else {
        combined[item.productId] = {
          productId: item.productId,
          score: item.score * 0.4,
          reason: item.reason
        };
      }
    });

    return Object.values(combined).sort((a, b) => b.score - a.score);
  };

  return { recommendations, loading, refetch: generateRecommendations };
}
