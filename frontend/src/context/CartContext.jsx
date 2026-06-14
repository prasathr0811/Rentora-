import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);

  // Load cart on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('rentora_cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // Save cart on changes
  useEffect(() => {
    localStorage.setItem('rentora_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (product, type, options = {}) => {
    setCartItems((prevItems) => {
      // Find if item already exists in cart with the same transaction type (buy vs rent)
      const existingItemIndex = prevItems.findIndex(
        (item) => item.product._id === product._id && item.type === type
      );

      if (existingItemIndex > -1) {
        const newItems = [...prevItems];
        if (type === 'buy') {
          // Increase quantity
          newItems[existingItemIndex].quantity += options.quantity || 1;
        } else {
          // Update dates and re-calculate
          const startDate = new Date(options.startDate);
          const endDate = new Date(options.endDate);
          const diffDays = Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24)) || 1;
          
          newItems[existingItemIndex].startDate = options.startDate;
          newItems[existingItemIndex].endDate = options.endDate;
          newItems[existingItemIndex].days = diffDays;
          newItems[existingItemIndex].rentCost = product.rentPricePerDay * diffDays;
        }
        return newItems;
      } else {
        // Add new item
        if (type === 'buy') {
          return [
            ...prevItems,
            {
              product,
              type,
              quantity: options.quantity || 1,
            },
          ];
        } else {
          const startDate = new Date(options.startDate);
          const endDate = new Date(options.endDate);
          const diffDays = Math.ceil(Math.abs(endDate - startDate) / (1000 * 60 * 60 * 24)) || 1;

          return [
            ...prevItems,
            {
              product,
              type,
              startDate: options.startDate,
              endDate: options.endDate,
              days: diffDays,
              rentCost: product.rentPricePerDay * diffDays,
              securityDeposit: product.securityDeposit,
            },
          ];
        }
      }
    });
  };

  const removeFromCart = (productId, type) => {
    setCartItems((prevItems) =>
      prevItems.filter((item) => !(item.product._id === productId && item.type === type))
    );
  };

  const updateQuantity = (productId, quantity) => {
    setCartItems((prevItems) =>
      prevItems.map((item) =>
        item.product._id === productId && item.type === 'buy'
          ? { ...item, quantity: Math.max(1, parseInt(quantity)) }
          : item
      )
    );
  };

  const updateRentalDates = (productId, startDate, endDate) => {
    setCartItems((prevItems) =>
      prevItems.map((item) => {
        if (item.product._id === productId && item.type === 'rent') {
          const start = new Date(startDate);
          const end = new Date(endDate);
          const diffDays = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24)) || 1;
          return {
            ...item,
            startDate,
            endDate,
            days: diffDays,
            rentCost: item.product.rentPricePerDay * diffDays,
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  // Calculations
  const buyItemsCount = cartItems.filter(item => item.type === 'buy').length;
  const rentItemsCount = cartItems.filter(item => item.type === 'rent').length;
  const cartCount = cartItems.length;

  const totalBuyAmount = cartItems
    .filter((item) => item.type === 'buy')
    .reduce((acc, item) => acc + item.product.buyPrice * item.quantity, 0);

  const totalRentalCharges = cartItems
    .filter((item) => item.type === 'rent')
    .reduce((acc, item) => acc + item.rentCost, 0);

  const totalRentalDeposit = cartItems
    .filter((item) => item.type === 'rent')
    .reduce((acc, item) => acc + item.securityDeposit, 0);

  const grandTotal = totalBuyAmount + totalRentalCharges + totalRentalDeposit;

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        updateRentalDates,
        clearCart,
        cartCount,
        buyItemsCount,
        rentItemsCount,
        totalBuyAmount,
        totalRentalCharges,
        totalRentalDeposit,
        grandTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
