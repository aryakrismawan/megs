import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Product = {
  id: number;
  name: string;
  img: string;
  price: string;
  category: string;
  description?: string;
};

type CartItem = Product & { quantity: number; selectedSize?: string };

type ShopContextType = {
  products: Product[];
  articles: any[];
  createYoursItems: any[];
  cart: CartItem[];
  addToCart: (product: Product, size?: string) => void;
  removeFromCart: (productId: number, size?: string) => void;
  updateQuantity: (productId: number, size: string | undefined, newQuantity: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [createYoursItems, setCreateYoursItems] = useState<any[]>([]);

  React.useEffect(() => {
    fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
        }
      })
      .catch(err => console.error('Failed to load products', err));

    fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/articles`)
      .then(async res => {
        const text = await res.text();
        try { return JSON.parse(text); } catch { return []; }
      })
      .then(data => {
        if (Array.isArray(data)) setArticles(data);
      })
      .catch(err => console.error(err));

    fetch(`${(import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787'}/api/create-yours`)
      .then(async res => {
        const text = await res.text();
        try { return JSON.parse(text); } catch { return []; }
      })
      .then(data => {
        if (Array.isArray(data)) setCreateYoursItems(data);
      })
      .catch(err => console.error(err));
  }, []);

  const addToCart = (product: Product, size?: string) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id && item.selectedSize === size);
      if (existing) {
        return prev.map((item) => (item.id === product.id && item.selectedSize === size) ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { ...product, quantity: 1, selectedSize: size }];
    });
    setIsCartOpen(true);
  };

  const removeFromCart = (productId: number, size?: string) => {
    setCart((prev) => prev.filter((item) => !(item.id === productId && item.selectedSize === size)));
  };

  const updateQuantity = (productId: number, size: string | undefined, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, size);
      return;
    }
    setCart((prev) => prev.map(item => 
      (item.id === productId && item.selectedSize === size) 
        ? { ...item, quantity: newQuantity } 
        : item
    ));
  };

  const clearCart = () => setCart([]);

  return (
    <ShopContext.Provider value={{
      products,
      articles,
      createYoursItems,
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      isCartOpen,
      setIsCartOpen,
      isSearchOpen,
      setIsSearchOpen
    }}>
      {children}
    </ShopContext.Provider>
  );
}

export function useShop() {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
}
