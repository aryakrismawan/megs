import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Product = {
  id: number;
  name: string;
  img: string;
  price: string;
  category: string;
  description?: string;
  sizes?: string;
};

export type CartItem = Product & { quantity: number; selectedSize?: string };

export type BagToastData = {
  key: number;
  product: Product;
  selectedSize?: string;
};

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
  bagToast: BagToastData | null;
  dismissBagToast: () => void;
  bagBumpKey: number;
  isSearchOpen: boolean;
  setIsSearchOpen: (isOpen: boolean) => void;
  isCollectionPopupOpen: boolean;
  setIsCollectionPopupOpen: (isOpen: boolean) => void;
  collectionPopupCategory: string | null;
  openCollectionPopup: (category?: string | null) => void;
  theme: string;
  setTheme: (theme: string | ((prev: string) => string)) => void;
};

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('megs_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [isCartOpen, setIsCartOpenState] = useState(false);
  const [bagToast, setBagToast] = useState<BagToastData | null>(null);
  const [bagBumpKey, setBagBumpKey] = useState(0);
  const toastTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isCollectionPopupOpen, setIsCollectionPopupOpen] = useState(false);
  const [collectionPopupCategory, setCollectionPopupCategory] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const cached = sessionStorage.getItem('megs_cache_products');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [articles, setArticles] = useState<any[]>(() => {
    try {
      const cached = sessionStorage.getItem('megs_cache_articles');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [createYoursItems, setCreateYoursItems] = useState<any[]>(() => {
    try {
      const cached = sessionStorage.getItem('megs_cache_create_yours');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });
  const [theme, setTheme] = useState('light');

  const dismissBagToast = React.useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setBagToast(null);
  }, []);

  const setIsCartOpen = React.useCallback((isOpen: boolean) => {
    if (isOpen) {
      dismissBagToast();
    }
    setIsCartOpenState(isOpen);
  }, [dismissBagToast]);

  const openCollectionPopup = (category: string | null = null) => {
    setCollectionPopupCategory(category);
    setIsCollectionPopupOpen(true);
  };

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  React.useEffect(() => {
    localStorage.setItem('megs_cart', JSON.stringify(cart));
  }, [cart]);

  React.useEffect(() => {
    const apiBase = (import.meta as any).env.VITE_API_URL || 'http://127.0.0.1:8787';

    fetch(`${apiBase}/api/products`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProducts(data);
          try { sessionStorage.setItem('megs_cache_products', JSON.stringify(data)); } catch {}
        }
      })
      .catch(err => console.error('Failed to load products', err));

    fetch(`${apiBase}/api/articles`)
      .then(async res => {
        const text = await res.text();
        try { return JSON.parse(text); } catch { return []; }
      })
      .then(data => {
        if (Array.isArray(data)) {
          setArticles(data);
          try { sessionStorage.setItem('megs_cache_articles', JSON.stringify(data)); } catch {}
        }
      })
      .catch(err => console.error(err));

    fetch(`${apiBase}/api/create-yours`)
      .then(async res => {
        const text = await res.text();
        try { return JSON.parse(text); } catch { return []; }
      })
      .then(data => {
        if (Array.isArray(data)) {
          setCreateYoursItems(data);
          try { sessionStorage.setItem('megs_cache_create_yours', JSON.stringify(data)); } catch {}
        }
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

    // Trigger non-intrusive toast notification & navbar bag icon bump animation instead of opening the full bag sidebar
    setBagBumpKey((prev) => prev + 1);
    setBagToast({
      key: Date.now(),
      product,
      selectedSize: size
    });

    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = setTimeout(() => {
      setBagToast(null);
      toastTimerRef.current = null;
    }, 3800);
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
      bagToast,
      dismissBagToast,
      bagBumpKey,
      isSearchOpen,
      setIsSearchOpen,
      isCollectionPopupOpen,
      setIsCollectionPopupOpen,
      collectionPopupCategory,
      openCollectionPopup,
      theme,
      setTheme
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
