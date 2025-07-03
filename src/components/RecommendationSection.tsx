import { Product, RecommendationScore } from '@/types';
import { ProductCard } from './ProductCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecommendationSectionProps {
  title: string;
  products: Product[];
  recommendations: RecommendationScore[];
  onProductClick: (product: Product) => void;
  onLike?: (productId: string) => void;
  likedProducts?: Set<string>;
}

export function RecommendationSection({
  title,
  products,
  recommendations,
  onProductClick,
  onLike,
  likedProducts = new Set()
}: RecommendationSectionProps) {
  const recommendedProducts = recommendations
    .map(rec => products.find(p => p.id === rec.productId))
    .filter((product): product is Product => product !== undefined);

  if (recommendedProducts.length === 0) {
    return null;
  }

  return (
    <Card className="border-amazon-gray/20">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-amazon-dark-blue">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onProductClick={onProductClick}
              onLike={onLike}
              isLiked={likedProducts.has(product.id)}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}