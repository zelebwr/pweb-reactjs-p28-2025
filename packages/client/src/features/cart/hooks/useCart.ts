import { useState, useEffect } from 'react';
import type { ApiBook } from '@react-express-library/shared';

export interface CartItem {
  bookId: string;
  title: string;
  writer: string;
  price: number;
  quantity: number;
  stock: number;
  coverImage?: string | null;
}

const CART_STORAGE_KEY = 'library_cart';

export const useCart = () => {
  const [items, setItems] = useState<CartItem[]>([]);

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem(CART_STORAGE_KEY);
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        setItems(parsed);
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        localStorage.removeItem(CART_STORAGE_KEY);
      }
    }
  }, []);

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } else {
      localStorage.removeItem(CART_STORAGE_KEY);
    }
  }, [items]);

  // Add item to cart
  const addToCart = (book: ApiBook, quantity: number = 1) => {
    if (quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    if (quantity > book.stockQuantity) {
      throw new Error(`Only ${book.stockQuantity} items available in stock`);
    }

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.bookId === book.id);
      
      if (existingItem) {
        // Update quantity if item already in cart
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > book.stockQuantity) {
          throw new Error(`Cannot add more. Only ${book.stockQuantity} items available in stock`);
        }
        return prevItems.map(item =>
          item.bookId === book.id
            ? { ...item, quantity: newQuantity }
            : item
        );
      } else {
        // Add new item
        return [
          ...prevItems,
          {
            bookId: book.id,
            title: book.title,
            writer: book.writer,
            price: book.price,
            quantity,
            stock: book.stockQuantity,
            coverImage: book.coverImage,
          },
        ];
      }
    });
  };

  // Remove item from cart
  const removeFromCart = (bookId: string) => {
    setItems(prevItems => prevItems.filter(item => item.bookId !== bookId));
  };

  // Update quantity of item in cart
  const updateQuantity = (bookId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(bookId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item => {
        if (item.bookId === bookId) {
          if (quantity > item.stock) {
            throw new Error(`Only ${item.stock} items available in stock`);
          }
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  // Clear entire cart
  const clearCart = () => {
    setItems([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  };

  // Get total price
  const getTotalPrice = () => {
    return items.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  // Get total items count
  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  // Check if book is in cart
  const isInCart = (bookId: string) => {
    return items.some(item => item.bookId === bookId);
  };

  // Get item quantity in cart
  const getItemQuantity = (bookId: string) => {
    const item = items.find(item => item.bookId === bookId);
    return item ? item.quantity : 0;
  };

  return {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getTotalPrice,
    getTotalItems,
    isInCart,
    getItemQuantity,
  };
};
