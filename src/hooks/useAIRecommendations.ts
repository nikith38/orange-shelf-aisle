import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Product, RecommendationScore } from '@/types';
import { useAuth } from '@/contexts/SupabaseAuthContext';

// Cache duration in milliseconds (30 minutes)
const CACHE_DURATION = 30 * 60 * 1000;

export function useAIRecommendations(products: Product[]) {
  const [recommendations, setRecommendations] = useState<RecommendationScore[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user && products.length > 0) {
      fetchAIRecommendations();
    }
  }, [user, products]);

  const fetchAIRecommendations = async () => {
    if (!user || products.length === 0) return;

    try {
      setLoading(true);
      
      // Check cache first
      const cachedRecommendations = localStorage.getItem(`ai_recommendations_${user.id}`);
      if (cachedRecommendations) {
        const { recommendations, timestamp } = JSON.parse(cachedRecommendations);
        if (Date.now() - timestamp < CACHE_DURATION) {
          setRecommendations(recommendations);
          setLoading(false);
          return;
        }
      }
      
      // If no cache or expired, get fresh recommendations
      const { data, error } = await supabase.functions.invoke('generate-recommendations', {
        body: { userId: user.id }
      });

      if (error) throw error;

      // Format recommendations to match our RecommendationScore type
      const aiRecommendations = data.recommendations.map((rec: any) => ({
        productId: rec.productId,
        score: rec.score || 1.0,
        reason: rec.reason || 'AI recommended'
      }));
      
      // Cache the results
      localStorage.setItem(`ai_recommendations_${user.id}`, JSON.stringify({
        recommendations: aiRecommendations,
        timestamp: Date.now()
      }));
      
      setRecommendations(aiRecommendations);
    } catch (error) {
      console.error('Error fetching AI recommendations:', error);
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  return { recommendations, loading, refetch: fetchAIRecommendations };
} 