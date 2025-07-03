import { Product, UserInteraction, RecommendationScore } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export class RecommendationEngine {
  private products: Product[];
  private userInteractions: UserInteraction[];

  constructor(products: Product[], userInteractions: UserInteraction[] = []) {
    this.products = products;
    this.userInteractions = userInteractions;
  }

  // Calculate cosine similarity between two vectors
  private cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    const dotProduct = vectorA.reduce((sum, a, i) => sum + a * vectorB[i], 0);
    const magnitudeA = Math.sqrt(vectorA.reduce((sum, a) => sum + a * a, 0));
    const magnitudeB = Math.sqrt(vectorB.reduce((sum, b) => sum + b * b, 0));
    
    if (magnitudeA === 0 || magnitudeB === 0) return 0;
    return dotProduct / (magnitudeA * magnitudeB);
  }

  // Create feature vector for a product
  private createProductVector(product: Product): number[] {
    const categories = ['Electronics', 'Food & Beverages', 'Home & Garden', 'Pets', 'Sports & Outdoors'];
    const brands = ['AudioTech', 'FitTech', 'TechPro', 'BrewMaster', 'ComfortHome', 'PetComfort', 'PhotoPro', 'RunFast'];
    
    const vector: number[] = [];
    
    // Category encoding
    categories.forEach(cat => vector.push(product.category === cat ? 1 : 0));
    
    // Brand encoding
    brands.forEach(brand => vector.push(product.brand === brand ? 1 : 0));
    
    // Price range (normalized)
    vector.push(Math.log(product.price) / 10);
    
    // Rating
    vector.push(product.rating / 5);
    
    return vector;
  }

  // Get user preference vector based on interactions
  private getUserPreferenceVector(): number[] {
    if (this.userInteractions.length === 0) {
      return new Array(15).fill(0); // Default neutral preferences
    }

    const weightedVector = new Array(15).fill(0);
    let totalWeight = 0;

    this.userInteractions.forEach(interaction => {
      const product = this.products.find(p => p.id === interaction.productId);
      if (!product) return;

      const weight = this.getInteractionWeight(interaction);
      const productVector = this.createProductVector(product);
      
      productVector.forEach((value, index) => {
        weightedVector[index] += value * weight;
      });
      
      totalWeight += weight;
    });

    if (totalWeight === 0) return weightedVector;
    
    // Normalize by total weight
    return weightedVector.map(value => value / totalWeight);
  }

  private getInteractionWeight(interaction: UserInteraction): number {
    const weights = {
      view: 1,
      like: 3,
      cart: 5,
      purchase: 10
    };

    const baseWeight = weights[interaction.type];
    
    // Decay factor based on time (more recent interactions have higher weight)
    const daysSince = (Date.now() - interaction.timestamp) / (1000 * 60 * 60 * 24);
    const timeDecay = Math.exp(-daysSince / 30); // 30-day decay
    
    return baseWeight * timeDecay;
  }

  // Get content-based recommendations
  getContentBasedRecommendations(limit: number = 10): RecommendationScore[] {
    const userVector = this.getUserPreferenceVector();
    const interactedProductIds = new Set(this.userInteractions.map(i => i.productId));

    const scores: RecommendationScore[] = this.products
      .filter(product => !interactedProductIds.has(product.id))
      .map(product => {
        const productVector = this.createProductVector(product);
        const similarity = this.cosineSimilarity(userVector, productVector);
        
        return {
          productId: product.id,
          score: similarity,
          reason: 'Based on your preferences'
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scores;
  }

  // Get collaborative filtering recommendations (simplified)
  getCollaborativeRecommendations(limit: number = 10): RecommendationScore[] {
    const categoryPreferences = this.getCategoryPreferences();
    const interactedProductIds = new Set(this.userInteractions.map(i => i.productId));

    const scores: RecommendationScore[] = this.products
      .filter(product => !interactedProductIds.has(product.id))
      .map(product => {
        const categoryScore = categoryPreferences[product.category] || 0;
        const popularityScore = Math.log(product.reviewCount + 1) / 10;
        const ratingScore = product.rating / 5;
        
        const combinedScore = categoryScore * 0.5 + popularityScore * 0.3 + ratingScore * 0.2;
        
        return {
          productId: product.id,
          score: combinedScore,
          reason: 'Popular in your categories'
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scores;
  }

  private getCategoryPreferences(): Record<string, number> {
    const categoryCount: Record<string, number> = {};
    
    this.userInteractions.forEach(interaction => {
      const product = this.products.find(p => p.id === interaction.productId);
      if (product) {
        const weight = this.getInteractionWeight(interaction);
        categoryCount[product.category] = (categoryCount[product.category] || 0) + weight;
      }
    });

    const total = Object.values(categoryCount).reduce((sum, count) => sum + count, 0);
    if (total === 0) return {};

    // Normalize to probabilities
    const preferences: Record<string, number> = {};
    Object.entries(categoryCount).forEach(([category, count]) => {
      preferences[category] = count / total;
    });

    return preferences;
  }

  // Get hybrid recommendations combining multiple approaches
  getHybridRecommendations(limit: number = 10): RecommendationScore[] {
    const contentBased = this.getContentBasedRecommendations(limit * 2);
    const collaborative = this.getCollaborativeRecommendations(limit * 2);

    // Combine scores with weights
    const combined: Record<string, RecommendationScore> = {};

    contentBased.forEach(item => {
      combined[item.productId] = {
        productId: item.productId,
        score: item.score * 0.6,
        reason: item.reason
      };
    });

    collaborative.forEach(item => {
      if (combined[item.productId]) {
        combined[item.productId].score += item.score * 0.4;
        combined[item.productId].reason = 'Based on preferences and popularity';
      } else {
        combined[item.productId] = {
          productId: item.productId,
          score: item.score * 0.4,
          reason: item.reason
        };
      }
    });

    return Object.values(combined)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  // Get similar products to a specific product
  getSimilarProducts(productId: string, limit: number = 4): RecommendationScore[] {
    const targetProduct = this.products.find(p => p.id === productId);
    if (!targetProduct) return [];

    const targetVector = this.createProductVector(targetProduct);
    
    const scores: RecommendationScore[] = this.products
      .filter(product => product.id !== productId)
      .map(product => {
        const productVector = this.createProductVector(product);
        const similarity = this.cosineSimilarity(targetVector, productVector);
        
        return {
          productId: product.id,
          score: similarity,
          reason: 'Similar products'
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);

    return scores;
  }
}

// Interaction types for tracking user behavior
export enum InteractionType {
  VIEW = 'view',
  LIKE = 'like',
  CART = 'cart',
  PURCHASE = 'purchase'
}

/**
 * Track a user interaction with a product
 * @param userId The user ID
 * @param productId The product ID
 * @param interactionType The type of interaction (view, like, cart, purchase)
 */
export async function trackInteraction(
  userId: string,
  productId: string,
  interactionType: InteractionType
) {
  if (!userId || !productId) return;

  try {
    // Check if this interaction already exists
    const { data: existingInteraction } = await supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .eq('interaction_type', interactionType)
      .single();

    if (existingInteraction) {
      // Update the existing interaction (update timestamp)
      await supabase
        .from('user_interactions')
        .update({ 
          interaction_count: (existingInteraction.interaction_count || 0) + 1,
          last_interacted_at: new Date().toISOString() 
        })
        .eq('id', existingInteraction.id);
    } else {
      // Create a new interaction
      await supabase.from('user_interactions').insert({
        user_id: userId,
        product_id: productId,
        interaction_type: interactionType,
        interaction_count: 1,
        last_interacted_at: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Error tracking interaction:', error);
  }
}

/**
 * Track a product view
 */
export function trackProductView(userId: string, product: Product) {
  return trackInteraction(userId, product.id, InteractionType.VIEW);
}

/**
 * Track a product like/unlike
 */
export function trackProductLike(userId: string, product: Product, isLiked: boolean) {
  if (isLiked) {
    return trackInteraction(userId, product.id, InteractionType.LIKE);
  } else {
    // Remove the like interaction if unliked
    try {
      return supabase
        .from('user_interactions')
        .delete()
        .eq('user_id', userId)
        .eq('product_id', product.id)
        .eq('interaction_type', InteractionType.LIKE);
    } catch (error) {
      console.error('Error removing like interaction:', error);
    }
  }
}

/**
 * Track adding a product to cart
 */
export function trackAddToCart(userId: string, product: Product) {
  return trackInteraction(userId, product.id, InteractionType.CART);
}

/**
 * Track a product purchase
 */
export function trackPurchase(userId: string, product: Product) {
  return trackInteraction(userId, product.id, InteractionType.PURCHASE);
}

/**
 * Get a user's interaction history
 */
export async function getUserInteractions(userId: string) {
  if (!userId) return { data: [] };
  
  try {
    return await supabase
      .from('user_interactions')
      .select('*')
      .eq('user_id', userId)
      .order('last_interacted_at', { ascending: false });
  } catch (error) {
    console.error('Error fetching user interactions:', error);
    return { data: [] };
  }
}