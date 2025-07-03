
import { Product, RecommendationScore } from '@/types';
import { ProductCard } from './ProductCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRef } from 'react';

interface RecommendationSectionProps {
  title: string;
  products: Product[];
  recommendations: RecommendationScore[];
  onProductClick: (product: Product) => void;
  onLike: (productId: string) => void;
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
  likedProducts
}: RecommendationSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const recommendedProducts = recommendations
    .map(rec => products.find(p => p.id === rec.productId))
    .filter((product): product is Product => product !== undefined);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
    }
  };

  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold text-amazon-dark-blue">
            {title}
          </CardTitle>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={scrollLeft}
              className="p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={scrollRight}
              className="p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto scrollbar-hide pb-4"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {recommendedProducts.map((product) => (
            <div key={product.id} className="flex-shrink-0 w-64">
              <ProductCard
                product={product}
                onProductClick={onProductClick}
                onLike={onLike}
                onAddToCart={onAddToCart}
                isLiked={likedProducts.has(product.id)}
              />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
