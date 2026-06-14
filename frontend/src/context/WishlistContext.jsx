import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthContext } from './AuthContext';
import API from '../services/api';
import toast from 'react-hot-toast';

export const WishlistContext = createContext();

export const WishlistProvider = ({ children }) => {
  const { userInfo } = useContext(AuthContext);
  const [wishlist, setWishlist] = useState([]); // array of product IDs (strings)
  const [loading, setLoading] = useState(false);

  // Fetch wishlist on mount or when user logs in/out
  useEffect(() => {
    if (userInfo) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const { data } = await API.get('/wishlist');
      // Store only product IDs for quick lookup
      const ids = (data.products || []).map((p) =>
        typeof p === 'object' ? p._id : p
      );
      setWishlist(ids);
    } catch (err) {
      // Silently fail - wishlist just stays empty
    } finally {
      setLoading(false);
    }
  };

  const isWishlisted = (productId) => {
    return wishlist.includes(productId);
  };

  const toggleWishlist = async (productId) => {
    // Optimistic update
    const wasWishlisted = isWishlisted(productId);
    if (wasWishlisted) {
      setWishlist((prev) => prev.filter((id) => id !== productId));
    } else {
      setWishlist((prev) => [...prev, productId]);
    }

    try {
      const { data } = await API.post(`/wishlist/${productId}`);
      // Sync with server response
      if (data.wishlisted) {
        setWishlist((prev) =>
          prev.includes(productId) ? prev : [...prev, productId]
        );
        toast.success('Added to wishlist ❤️');
      } else {
        setWishlist((prev) => prev.filter((id) => id !== productId));
        toast.success('Removed from wishlist');
      }
    } catch (err) {
      // Revert optimistic update on error
      if (wasWishlisted) {
        setWishlist((prev) => [...prev, productId]);
      } else {
        setWishlist((prev) => prev.filter((id) => id !== productId));
      }
      toast.error('Failed to update wishlist');
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        isWishlisted,
        loading,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
