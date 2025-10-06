import { useState, useEffect, useCallback } from 'react';
import type { Cart, CartItem, CartProduct } from '../types/cart.types';

const CART_STORAGE_KEY = 'shopping_cart';

export const useCart = () => {
  const [cart, setCart] = useState<Cart>({
    items: [],
    totalItems: 0,
    totalPrice: 0,
  });

  // Cargar carrito desde localStorage al iniciar
  useEffect(() => {
    loadCart();
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (cart.items.length > 0 || cart.totalItems > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    }
  }, [cart]);

  const loadCart = () => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const loadedCart = JSON.parse(stored);
        setCart(loadedCart);
      }
    } catch (error) {
      console.error('Error al cargar carrito:', error);
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
        localStorage.removeItem(CART_STORAGE_KEY);
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
          localStorage.removeItem(CART_STORAGE_KEY);
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
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

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
