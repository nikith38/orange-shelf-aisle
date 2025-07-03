import { useState } from 'react';
import { Search, ShoppingCart, User, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

interface HeaderProps {
  onSearch: (query: string) => void;
  onCartClick: () => void;
  onLoginClick: () => void;
  onProfileClick: () => void;
}

export function Header({ onSearch, onCartClick, onLoginClick, onProfileClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { user } = useAuth();
  const { items } = useCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const cartItemCount = items.reduce((total, item) => total + item.quantity, 0);

  return (
    <header className="bg-gradient-header shadow-header sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-white">
              Amazon<span className="text-amazon-orange">Style</span>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="flex-1 max-w-2xl mx-4">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-3 text-lg border-0 rounded-md"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1 bottom-1 px-4 bg-amazon-orange hover:bg-amazon-orange/90"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {/* User Account */}
            {user ? (
              <Button
                variant="ghost"
                onClick={onProfileClick}
                className="text-white hover:bg-white/10 flex flex-col items-start p-2"
              >
                <span className="text-xs">Hello, {user.name}</span>
                <span className="text-sm font-semibold">Account & Lists</span>
              </Button>
            ) : (
              <Button
                variant="ghost"
                onClick={onLoginClick}
                className="text-white hover:bg-white/10 flex flex-col items-start p-2"
              >
                <span className="text-xs">Hello, sign in</span>
                <span className="text-sm font-semibold">Account & Lists</span>
              </Button>
            )}

            {/* Cart */}
            <Button
              variant="ghost"
              onClick={onCartClick}
              className="text-white hover:bg-white/10 relative p-2"
            >
              <div className="flex items-center gap-2">
                <div className="relative">
                  <ShoppingCart className="h-6 w-6" />
                  {cartItemCount > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 bg-amazon-orange text-white min-w-[20px] h-5 rounded-full text-xs flex items-center justify-center"
                    >
                      {cartItemCount}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col items-start">
                  <span className="text-xs">Cart</span>
                </div>
              </div>
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-6 mt-2 text-sm">
          <Button variant="ghost" className="text-white hover:bg-white/10 text-sm p-2">
            All
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/10 text-sm p-2">
            Electronics
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/10 text-sm p-2">
            Home & Garden
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/10 text-sm p-2">
            Sports & Outdoors
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/10 text-sm p-2">
            Food & Beverages
          </Button>
          <Button variant="ghost" className="text-white hover:bg-white/10 text-sm p-2">
            Pets
          </Button>
          <div className="flex items-center gap-1 text-amazon-orange">
            <Star className="h-4 w-4 fill-current" />
            <span>Today's Deals</span>
          </div>
        </nav>
      </div>
    </header>
  );
}