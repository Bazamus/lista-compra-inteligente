import { useState, useEffect, useCallback } from 'react';
import type { Cart, CartItem, CartProduct } from '../types/cart.types';
import { useAuth } from '../features/auth/hooks/useAuth';

// Función para generar key de localStorage con namespacing por usuario
const getCartKey = (userId?: string): string => {
  if (userId) {
    // Usuario autenticado: usar su ID
    return `cart_${userId}`;
  }

  // Usuario anónimo: generar ID persistente único
  const ANON_ID_KEY = 'anon_cart_id';
  let anonId = localStorage.getItem(ANON_ID_KEY);

  if (!anonId) {
    // Generar ID único para usuario anónimo
    anonId = `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem(ANON_ID_KEY, anonId);
  }

  return `cart_${anonId}`;
};

export const useCart = () => {
  const { user, loading: authLoading } = useAuth();
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });
  const [cartLoaded, setCartLoaded] = useState(false);

  // Cargar carrito solo después de que auth esté listo
  useEffect(() => {
    // Solo cargar si auth ya no está loading y aún no hemos cargado el carrito
    if (!authLoading && !cartLoaded) {
      loadCart();
      setCartLoaded(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, user?.id]);

  // Resetear cartLoaded cuando cambie el usuario para recargar
  useEffect(() => {
    setCartLoaded(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (cartLoaded && (cart.items.length > 0 || cart.totalItems > 0)) {
      const cartKey = getCartKey(user?.id);
      localStorage.setItem(cartKey, JSON.stringify(cart));
    }
  }, [cart, user?.id, cartLoaded]);

  const loadCart = () => {
    try {
      const cartKey = getCartKey(user?.id);
      const stored = localStorage.getItem(cartKey);
      
      if (stored) {
        const loadedCart = JSON.parse(stored);
        setCart(loadedCart);
        if (loadedCart.items.length > 0) {
          console.log('📦 Carrito cargado:', loadedCart.items.length, 'items');
        }
      } else {
        // Si no hay carrito guardado, inicializar vacío (sin log)
        setCart({
          items: [],
          totalItems: 0,
          totalPrice: 0,
        });
      }
    } catch (error) {
      console.error('Error al cargar carrito:', error);
      setCart({
        items: [],
        totalItems: 0,
        totalPrice: 0,
      });
    }
  };

  const calculateTotals = (items: CartItem[]): { totalItems: number; totalPrice: number } => {
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    // Usar precio_formato_venta para calcular el total
    const totalPrice = items.reduce(
      (sum, item) => sum + item.product.precio_formato_venta * item.quantity,
      0
    );
    return { totalItems, totalPrice };
  };

  const addProduct = useCallback((product: CartProduct, quantity: number = 1) => {
    setCart((prevCart) => {
      const existingItemIndex = prevCart.items.findIndex(
        (item) => item.product.id_producto === product.id_producto
      );

      let newItems: CartItem[];

      if (existingItemIndex !== -1) {
        // Producto ya existe, actualizar cantidad
        newItems = [...prevCart.items];
        newItems[existingItemIndex] = {
          ...newItems[existingItemIndex],
          quantity: newItems[existingItemIndex].quantity + quantity,
        };
      } else {
        // Producto nuevo, añadir al carrito
        newItems = [...prevCart.items, { product, quantity }];
      }

      const { totalItems, totalPrice } = calculateTotals(newItems);

      return {
        items: newItems,
        totalItems,
        totalPrice,
      };
    });
  }, []);

  const removeProduct = useCallback((productId: number) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.filter((item) => item.product.id_producto !== productId);
      const { totalItems, totalPrice } = calculateTotals(newItems);

      // Si el carrito queda vacío, limpiar localStorage
      if (newItems.length === 0) {
        const cartKey = getCartKey(user?.id);
        localStorage.removeItem(cartKey);
      }

      return {
        items: newItems,
        totalItems,
        totalPrice,
      };
    });
  }, []);

  const updateQuantity = useCallback((productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeProduct(productId);
      return;
    }

    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) =>
        item.product.id_producto === productId ? { ...item, quantity: newQuantity } : item
      );

      const { totalItems, totalPrice } = calculateTotals(newItems);

      return {
        items: newItems,
        totalItems,
        totalPrice,
      };
    });
  }, [removeProduct]);

  const incrementQuantity = useCallback((productId: number) => {
    setCart((prevCart) => {
      const newItems = prevCart.items.map((item) =>
        item.product.id_producto === productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );

      const { totalItems, totalPrice } = calculateTotals(newItems);

      return {
        items: newItems,
        totalItems,
        totalPrice,
      };
    });
  }, []);

  const decrementQuantity = useCallback((productId: number) => {
    setCart((prevCart) => {
      const item = prevCart.items.find((i) => i.product.id_producto === productId);

      if (!item) return prevCart;

      if (item.quantity <= 1) {
        // Si la cantidad es 1, eliminar el producto
        const newItems = prevCart.items.filter((i) => i.product.id_producto !== productId);
        const { totalItems, totalPrice } = calculateTotals(newItems);

        if (newItems.length === 0) {
          const cartKey = getCartKey(user?.id);
          localStorage.removeItem(cartKey);
        }

        return {
          items: newItems,
          totalItems,
          totalPrice,
        };
      }

      // Decrementar cantidad
      const newItems = prevCart.items.map((i) =>
        i.product.id_producto === productId ? { ...i, quantity: i.quantity - 1 } : i
      );

      const { totalItems, totalPrice } = calculateTotals(newItems);

      return {
        items: newItems,
        totalItems,
        totalPrice,
      };
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart({
      items: [],
      totalItems: 0,
      totalPrice: 0,
    });
    const cartKey = getCartKey(user?.id);
    localStorage.removeItem(cartKey);
  }, [user?.id]);

  const getProductQuantity = useCallback(
    (productId: number): number => {
      const item = cart.items.find((i) => i.product.id_producto === productId);
      return item ? item.quantity : 0;
    },
    [cart.items]
  );

  const isProductInCart = useCallback(
    (productId: number): boolean => {
      return cart.items.some((item) => item.product.id_producto === productId);
    },
    [cart.items]
  );

  return {
    cart,
    addProduct,
    removeProduct,
    updateQuantity,
    incrementQuantity,
    decrementQuantity,
    clearCart,
    getProductQuantity,
    isProductInCart,
  };
};
