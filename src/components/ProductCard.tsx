
import { Heart, ShoppingCart, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  onLike: (productId: string) => void;
  onAddToCart: (product: Product) => void;
  isLiked: boolean;
}

export function ProductCard({ product, onProductClick, onLike, onAddToCart, isLiked }: ProductCardProps) {
  const handleCardClick = () => {
    onProductClick(product);
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike(product.id);
  };

  const handleAddToCartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
  };

  return (
    <Card 
      className="group cursor-pointer hover:shadow-product transition-all duration-300 hover:scale-105 h-full flex flex-col"
      onClick={handleCardClick}
    >
      <CardContent className="p-4 flex flex-col h-full">
        <div className="relative mb-3">
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-48 object-cover rounded-md group-hover:scale-105 transition-transform duration-300"
          />
          {product.originalPrice && (
            <Badge className="absolute top-2 left-2 bg-amazon-orange text-white">
              {Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}% OFF
            </Badge>
          )}
          <Button
            variant="ghost"
            size="sm"
            className={`absolute top-2 right-2 p-1 rounded-full ${
              isLiked 
                ? 'text-red-500 hover:text-red-600 bg-white/80' 
                : 'text-gray-400 hover:text-red-500 bg-white/80'
            }`}
            onClick={handleLikeClick}
          >
            <Heart className={`h-4 w-4 ${isLiked ? 'fill-current' : ''}`} />
          </Button>
        </div>

        <div className="flex-1 flex flex-col">
          <h3 className="font-semibold text-sm mb-2 line-clamp-2 text-amazon-dark-blue group-hover:text-amazon-orange transition-colors">
            {product.name}
          </h3>

          <div className="flex items-center gap-1 mb-2">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(product.rating)
                      ? 'text-amazon-yellow fill-current'
                      : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              {product.rating} ({product.reviewCount})
            </span>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg font-bold text-amazon-orange">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 mb-3">
            <Badge variant="secondary" className="text-xs">
              {product.brand}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {product.category}
            </Badge>
          </div>

          <div className="mt-auto">
            <Button
              onClick={handleAddToCartClick}
              className="w-full bg-amazon-orange hover:bg-amazon-orange/90 text-white text-sm"
              size="sm"
            >
              <ShoppingCart className="h-3 w-3 mr-2" />
              Add to Cart
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
