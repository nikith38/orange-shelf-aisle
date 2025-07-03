
import { useState } from 'react';
import { Search, ShoppingCart, User, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseCart } from '@/hooks/useSupabaseCart';

interface HeaderProps {
  onSearch: (query: string) => void;
  onCartClick: () => void;
  onLoginClick: () => void;
  onProfileClick: () => void;
}

export function Header({ onSearch, onCartClick, onLoginClick, onProfileClick }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { getTotalItems } = useSupabaseCart();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const handleSignOut = async () => {
    await signOut();
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-amazon-dark-blue text-white shadow-lg">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-amazon-orange">Amazon Style</h1>
          </div>

          {/* Search Bar - Desktop */}
          <div className="hidden md:flex flex-1 max-w-2xl mx-8">
            <form onSubmit={handleSearch} className="flex w-full">
              <Input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 rounded-r-none border-r-0 focus:ring-amazon-orange focus:border-amazon-orange"
              />
              <Button
                type="submit"
                className="bg-amazon-orange hover:bg-amazon-orange/90 rounded-l-none px-4"
              >
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>

          {/* Right side - Desktop */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <div className="text-sm">
                  <p className="text-amazon-light-blue">Hello, {user.user_metadata?.name || user.email}</p>
                </div>
                <Button
                  variant="ghost"
                  onClick={handleSignOut}
                  className="text-white hover:text-amazon-orange hover:bg-amazon-dark-blue/50"
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                variant="ghost"
                onClick={onLoginClick}
                className="text-white hover:text-amazon-orange hover:bg-amazon-dark-blue/50"
              >
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
            
            <Button
              variant="ghost"
              onClick={onCartClick}
              className="relative text-white hover:text-amazon-orange hover:bg-amazon-dark-blue/50"
            >
              <ShoppingCart className="h-5 w-5" />
              {getTotalItems() > 0 && (
                <Badge className="absolute -top-2 -right-2 bg-amazon-orange text-white text-xs min-w-[1.25rem] h-5 flex items-center justify-center">
                  {getTotalItems()}
                </Badge>
              )}
            </Button>
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            className="md:hidden text-white"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Search Bar */}
        <div className="md:hidden pb-4">
          <form onSubmit={handleSearch} className="flex">
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 rounded-r-none border-r-0"
            />
            <Button
              type="submit"
              className="bg-amazon-orange hover:bg-amazon-orange/90 rounded-l-none px-4"
            >
              <Search className="h-4 w-4" />
            </Button>
          </form>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-amazon-light-blue/20 py-4">
            <div className="space-y-4">
              {user ? (
                <>
                  <div className="text-sm text-amazon-light-blue">
                    Hello, {user.user_metadata?.name || user.email}
                  </div>
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    className="w-full justify-start text-white hover:text-amazon-orange hover:bg-amazon-dark-blue/50"
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => {
                    onLoginClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full justify-start text-white hover:text-amazon-orange hover:bg-amazon-dark-blue/50"
                >
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              )}
              
              <Button
                variant="ghost"
                onClick={() => {
                  onCartClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full justify-start relative text-white hover:text-amazon-orange hover:bg-amazon-dark-blue/50"
              >
                <ShoppingCart className="h-5 w-5 mr-2" />
                Cart
                {getTotalItems() > 0 && (
                  <Badge className="ml-auto bg-amazon-orange text-white">
                    {getTotalItems()}
                  </Badge>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
