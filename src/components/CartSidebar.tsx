
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSupabaseCart } from '@/hooks/useSupabaseCart';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useNavigate } from 'react-router-dom';

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const { items, updateQuantity, removeItem, getTotalPrice, getTotalItems, clearCart } = useSupabaseCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className={`fixed inset-y-0 right-0 z-50 w-96 bg-white shadow-xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Shopping Cart</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Please sign in to view your cart</p>
          <Button onClick={() => navigate('/auth')} className="bg-amazon-orange hover:bg-amazon-orange/90">
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-40"
          onClick={onClose}
        />
      )}
      
      <div className={`fixed inset-y-0 right-0 z-50 w-96 bg-white shadow-xl transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Shopping Cart</h2>
              {getTotalItems() > 0 && (
                <Badge className="bg-amazon-orange">
                  {getTotalItems()}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Your cart is empty</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.product.id} className="flex gap-4 p-4 border rounded-lg">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-medium text-sm">{item.product.name}</h3>
                      <p className="text-amazon-orange font-bold">${item.product.price}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.product.id)}
                          className="ml-auto text-red-500 hover:text-red-700"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {items.length > 0 && (
            <div className="border-t p-4 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold">Total:</span>
                <span className="text-lg font-bold text-amazon-orange">
                  ${getTotalPrice().toFixed(2)}
                </span>
              </div>
              <div className="space-y-2">
                <Button className="w-full bg-amazon-orange hover:bg-amazon-orange/90">
                  Proceed to Checkout
                </Button>
                <Button variant="outline" className="w-full" onClick={clearCart}>
                  Clear Cart
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
