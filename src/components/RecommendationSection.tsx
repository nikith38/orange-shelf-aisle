import { Product, RecommendationScore } from '@/types';
import { ProductCard } from './ProductCard';
import { Tooltip } from '@/components/ui/tooltip';
import { TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info } from 'lucide-react';

interface RecommendationSectionProps {
  title: string;
  products: Product[];
  recommendations: RecommendationScore[];
  onProductClick: (product: Product) => void;
  onLike: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  likedProducts: Set<string>;
}

export function RecommendationSection({
  title,
  products,
  recommendations,
  onProductClick,
  onLike,
  onAddToCart,
  likedProducts,
}: RecommendationSectionProps) {
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  const recommendedProducts = recommendations
    .map(rec => {
      const product = products.find(p => p.id === rec.productId);
      return product ? { ...product, recommendationReason: rec.reason } : null;
    })
    .filter(Boolean) as (Product & { recommendationReason?: string })[];

  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-2xl font-bold">{title}</h2>
        {title.includes("AI") && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info size={16} className="text-gray-500 cursor-help" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  AI-powered recommendations based on your browsing history, preferences, and similar users' behavior.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {recommendedProducts.map(product => (
          <ProductCard
            key={product.id}
            product={product}
            onProductClick={onProductClick}
            onLike={onLike}
            onAddToCart={onAddToCart}
            isLiked={likedProducts.has(product.id)}
            recommendationReason={product.recommendationReason}
          />
        ))}
      </div>
    </div>
  );
}
