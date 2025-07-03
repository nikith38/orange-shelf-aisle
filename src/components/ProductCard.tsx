import { Heart, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

export interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  onLike: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  isLiked: boolean;
  recommendationReason?: string;
}

export function ProductCard({
  product,
  onProductClick,
  onLike,
  onAddToCart,
  isLiked,
  recommendationReason
}: ProductCardProps) {
  const { name, price, originalPrice, image, rating, category, inStock } = product;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating - fullStars >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<span key={`full-${i}`} className="text-yellow-400">★</span>);
    }

    if (hasHalfStar) {
      stars.push(<span key="half" className="text-yellow-400">★</span>);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<span key={`empty-${i}`} className="text-gray-300">★</span>);
    }

    return stars;
  };

  return (
    <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div 
        className="relative pt-4 px-4 cursor-pointer"
        onClick={() => onProductClick(product)}
      >
        <div className="relative h-48 flex items-center justify-center overflow-hidden rounded-md bg-gray-100">
          <img
            src={image || '/placeholder.svg'}
            alt={name}
            className="object-cover transition-transform duration-300 hover:scale-105"
            style={{ maxHeight: '100%', maxWidth: '100%' }}
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
          />
          {!inStock && (
            <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">Out of Stock</span>
            </div>
          )}
        </div>
        
        <div className="absolute top-6 right-6">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-full ${isLiked ? 'text-red-500 hover:text-red-600' : 'text-gray-500 hover:text-red-500'}`}
            onClick={(e) => {
              e.stopPropagation();
              onLike(product);
            }}
          >
            <Heart className={isLiked ? 'fill-current' : ''} size={20} />
          </Button>
        </div>
        
        {originalPrice && originalPrice > price && (
          <Badge className="absolute top-6 left-6 bg-red-500">Sale</Badge>
        )}
      </div>
      
      <CardContent className="flex-grow pt-4 cursor-pointer" onClick={() => onProductClick(product)}>
        <div className="space-y-1.5">
          <Badge variant="outline" className="font-normal">
            {category}
          </Badge>
          <h3 className="font-semibold text-base line-clamp-2">{name}</h3>
          <div className="flex items-center">
            <div className="flex">{renderStars(rating)}</div>
            <span className="text-xs text-gray-500 ml-1">({rating.toFixed(1)})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-semibold">{formatPrice(price)}</span>
            {originalPrice && originalPrice > price && (
              <span className="text-gray-500 line-through text-sm">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
          
          {recommendationReason && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <p className="text-xs text-blue-600 italic cursor-help">
                    {recommendationReason.length > 30 
                      ? `${recommendationReason.substring(0, 30)}...` 
                      : recommendationReason}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">{recommendationReason}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      </CardContent>
      
      <CardFooter className="pt-0">
        <Button 
          className="w-full" 
          disabled={!inStock}
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
