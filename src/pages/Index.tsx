import { useState, useEffect, useMemo } from 'react';
import { Product, UserInteraction } from '@/types';
import { Header } from '@/components/Header';
import { ProductCard } from '@/components/ProductCard';
import { RecommendationSection } from '@/components/RecommendationSection';
import { LoginModal } from '@/components/LoginModal';
import { CartSidebar } from '@/components/CartSidebar';
import { RecommendationEngine } from '@/utils/recommendations';
import { useAuth } from '@/contexts/AuthContext';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star } from 'lucide-react';
import productsData from '@/data/products.json';

const Index = () => {
  const [products] = useState<Product[]>(productsData);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [likedProducts, setLikedProducts] = useLocalStorage<string[]>('likedProducts', []);
  
  const { user, getUserInteractions, trackInteraction } = useAuth();

  // Get unique categories
  const categories = useMemo(() => {
    const cats = ['All', ...new Set(products.map(p => p.category))];
    return cats;
  }, [products]);

  // Filter products based on search and category
  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.brand.toLowerCase().includes(query) ||
        p.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, searchQuery]);

  // Recommendation engine
  const recommendationEngine = useMemo(() => {
    const interactions = getUserInteractions();
    return new RecommendationEngine(products, interactions);
  }, [products, getUserInteractions]);

  // Get recommendations
  const recommendations = useMemo(() => {
    if (!user) return { hybrid: [], similar: [], collaborative: [] };
    
    return {
      hybrid: recommendationEngine.getHybridRecommendations(8),
      collaborative: recommendationEngine.getCollaborativeRecommendations(8),
      contentBased: recommendationEngine.getContentBasedRecommendations(8)
    };
  }, [recommendationEngine, user]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const handleProductClick = (product: Product) => {
    console.log('Product clicked:', product.name);
    // In a real app, this would navigate to product detail page
    trackInteraction(product.id, 'view');
  };

  const handleLike = (productId: string) => {
    setLikedProducts(prev => 
      prev.includes(productId) 
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const likedProductsSet = new Set(likedProducts);

  // Hero Section
  const HeroSection = () => (
    <div className="bg-gradient-primary text-white py-16 mb-8">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4">
          Welcome to Amazon Style
        </h1>
        <p className="text-xl md:text-2xl mb-8 opacity-90">
          Discover products tailored just for you with AI-powered recommendations
        </p>
        {!user && (
          <Button 
            onClick={() => setIsLoginModalOpen(true)}
            size="lg"
            className="bg-white text-amazon-dark-blue hover:bg-amazon-light-blue font-bold py-3 px-8"
          >
            Get Personal Recommendations
          </Button>
        )}
      </div>
    </div>
  );

  // Category Filter
  const CategoryFilter = () => (
    <div className="mb-8">
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? "default" : "outline"}
            onClick={() => setSelectedCategory(category)}
            className={selectedCategory === category ? "bg-amazon-orange hover:bg-amazon-orange/90" : ""}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Header
        onSearch={handleSearch}
        onCartClick={() => setIsCartOpen(true)}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onProfileClick={() => console.log('Profile clicked')}
      />

      <main className="container mx-auto px-4 py-8">
        <HeroSection />

        {/* Today's Deals Banner */}
        <Card className="mb-8 bg-amazon-yellow/10 border-amazon-yellow/30">
          <CardContent className="py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-amazon-yellow fill-current" />
                <div>
                  <h2 className="text-2xl font-bold text-amazon-dark-blue">Today's Deals</h2>
                  <p className="text-muted-foreground">Limited time offers on top products</p>
                </div>
              </div>
              <Badge className="bg-amazon-orange text-white text-lg px-4 py-2">
                Up to 50% OFF
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* User Recommendations */}
        {user && (
          <div className="space-y-8 mb-8">
            <RecommendationSection
              title="Recommended for You"
              products={products}
              recommendations={recommendations.hybrid}
              onProductClick={handleProductClick}
              onLike={handleLike}
              likedProducts={likedProductsSet}
            />
            
            <RecommendationSection
              title="Based on Your Activity"
              products={products}
              recommendations={recommendations.contentBased}
              onProductClick={handleProductClick}
              onLike={handleLike}
              likedProducts={likedProductsSet}
            />
          </div>
        )}

        {/* Category Filter */}
        <CategoryFilter />

        {/* Product Grid */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-amazon-dark-blue">
              {selectedCategory === 'All' ? 'All Products' : selectedCategory}
              {searchQuery && (
                <span className="text-muted-foreground ml-2">
                  - Search: "{searchQuery}"
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">No products found</p>
                <p className="text-muted-foreground">Try adjusting your search or category filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onProductClick={handleProductClick}
                    onLike={handleLike}
                    isLiked={likedProductsSet.has(product.id)}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Trending Categories */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-amazon-dark-blue mb-6">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.slice(1).map((category) => {
              const categoryProducts = products.filter(p => p.category === category);
              const avgRating = categoryProducts.reduce((sum, p) => sum + p.rating, 0) / categoryProducts.length;
              
              return (
                <Card 
                  key={category} 
                  className="cursor-pointer hover:shadow-product transition-all duration-300 hover:scale-105"
                  onClick={() => setSelectedCategory(category)}
                >
                  <CardContent className="p-6 text-center">
                    <h3 className="font-bold text-amazon-dark-blue mb-2">{category}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {categoryProducts.length} products
                    </p>
                    <div className="flex items-center justify-center gap-1">
                      <Star className="h-4 w-4 fill-amazon-yellow text-amazon-yellow" />
                      <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>

      {/* Modals and Sidebars */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
      
      <CartSidebar
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
};

export default Index;
