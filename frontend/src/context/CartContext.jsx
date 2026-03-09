import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext(null);

const CART_KEY = "tk_cart";

const loadCart = () => {
    try {
        return JSON.parse(localStorage.getItem(CART_KEY)) || [];
    } catch {
        return [];
    }
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(loadCart);
    const [supermarketId, setSupermarketId] = useState(
        localStorage.getItem("tk_cart_store") || null
    );

    useEffect(() => {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        if (cart.length === 0) {
            localStorage.removeItem("tk_cart_store");
            setSupermarketId(null);
        }
    }, [cart]);

    const addToCart = (product, storeId) => {
        // Prevent mixing items from different stores
        if (supermarketId && supermarketId !== storeId) {
            const confirm = window.confirm(
                "Your cart has items from another store. Clear cart and add this item?"
            );
            if (!confirm) return;
            setCart([]);
        }

        setSupermarketId(storeId);
        localStorage.setItem("tk_cart_store", storeId);

        setCart((prev) => {
            const existing = prev.find((i) => i.productId === product.id);
            if (existing) {
                return prev.map((i) =>
                    i.productId === product.id ? { ...i, quantity: i.quantity + 1 } : i
                );
            }
            return [
                ...prev,
                {
                    productId: product.id,
                    name: product.name,
                    price: product.price * (1 - (product.discount || 0) / 100),
                    image: product.image,
                    quantity: 1,
                },
            ];
        });
    };

    const removeFromCart = (productId) => {
        setCart((prev) => prev.filter((i) => i.productId !== productId));
    };

    const updateQuantity = (productId, quantity) => {
        if (quantity <= 0) return removeFromCart(productId);
        setCart((prev) =>
            prev.map((i) => (i.productId === productId ? { ...i, quantity } : i))
        );
    };

    const clearCart = () => {
        setCart([]);
        setSupermarketId(null);
        localStorage.removeItem(CART_KEY);
        localStorage.removeItem("tk_cart_store");
    };

    const cartTotal = cart.reduce((sum, i) => sum + i.price * i.quantity, 0);
    const cartCount = cart.reduce((sum, i) => sum + i.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cart,
                supermarketId,
                cartTotal,
                cartCount,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error("useCart must be used within CartProvider");
    return ctx;
};
