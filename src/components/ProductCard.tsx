import { useState } from 'react';
import { Star, Plus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Product } from '@/types';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface ProductCardProps {
  product: Product;
  onProductClick: (product: Product) => void;
  onLike?: (productId: string) => void;
  isLiked?: boolean;
}

export function ProductCard({ product, onProductClick, onLike, isLiked }: ProductCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false);
  const { addItem } = useCart();
  const { user, trackInteraction } = useAuth();
  const { toast } = useToast();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addItem(product);
    trackInteraction(product.id, 'cart');
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLike?.(product.id);
    trackInteraction(product.id, 'like');
  };

  const handleProductClick = () => {
    onProductClick(product);
    trackInteraction(product.id, 'view');
  };

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-amazon-yellow text-amazon-yellow" />
      );
    }

    if (hasHalfStar) {
      stars.push(
        <div key="half" className="relative">
          <Star className="h-4 w-4 text-amazon-gray" />
          <Star className="h-4 w-4 fill-amazon-yellow text-amazon-yellow absolute top-0 left-0" style={{ clipPath: 'inset(0 50% 0 0)' }} />
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(
        <Star key={`empty-${i}`} className="h-4 w-4 text-amazon-gray" />
      );
    }

    return stars;
  };

  const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-product border-amazon-gray/20 hover:border-amazon-orange/30 bg-card hover:scale-[1.02]"
      onClick={handleProductClick}
    >
      <CardContent className="p-4">
        {/* Product Image */}
        <div className="relative mb-3 overflow-hidden rounded-lg bg-amazon-light-blue">
          <div className="aspect-square relative">
            {!imageLoaded && (
              <div className="absolute inset-0 bg-amazon-gray/20 animate-pulse rounded-lg" />
            )}
            <img
              src={product.image}
              alt={product.name}
              className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => setImageLoaded(true)}
              loading="lazy"
            />
            
            {/* Discount Badge */}
            {discount > 0 && (
              <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
                -{discount}%
              </Badge>
            )}

            {/* Like Button */}
            <Button
              variant="ghost"
              size="sm"
              className={`absolute top-2 right-2 h-8 w-8 p-0 rounded-full bg-white/80 hover:bg-white ${
                isLiked ? 'text-destructive' : 'text-amazon-dark-blue'
              }`}
              onClick={handleLike}
            >
              <Plus className={`h-4 w-4 transition-transform ${isLiked ? 'rotate-45' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          {/* Brand */}
          <p className="text-sm text-amazon-dark-blue font-medium">{product.brand}</p>
          
          {/* Product Name */}
          <h3 className="font-medium text-foreground line-clamp-2 group-hover:text-amazon-dark-blue transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {renderStars(product.rating)}
            </div>
            <span className="text-sm text-muted-foreground">({product.reviewCount})</span>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-foreground">
              ${product.price.toFixed(2)}
            </span>
            {product.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                ${product.originalPrice.toFixed(2)}
              </span>
            )}
          </div>

          {/* Stock Status */}
          {product.inStock ? (
            <p className="text-sm text-green-600 font-medium">In Stock</p>
          ) : (
            <p className="text-sm text-destructive font-medium">Out of Stock</p>
          )}

          {/* Add to Cart Button */}
          <Button
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="w-full bg-amazon-orange hover:bg-amazon-orange/90 text-white font-medium py-2 mt-3"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            Add to Cart
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}