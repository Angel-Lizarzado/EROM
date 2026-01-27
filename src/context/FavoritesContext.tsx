'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface FavoriteItem {
    id: number;
    name: string;
    priceUsd: number;
    image: string;
    slug: string;
    addedAt: number;
}

interface FavoritesContextType {
    favorites: FavoriteItem[];
    addFavorite: (item: Omit<FavoriteItem, 'addedAt'>) => void;
    removeFavorite: (id: number) => void;
    isFavorite: (id: number) => boolean;
    toggleFavorite: (item: Omit<FavoriteItem, 'addedAt'>) => void;
    clearFavorites: () => void;
    count: number;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

const STORAGE_KEY = 'daian_favorites';

export function FavoritesProvider({ children }: { children: ReactNode }) {
    const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Cargar favoritos desde localStorage al montar
    useEffect(() => {
        try {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                setFavorites(JSON.parse(stored));
            }
        } catch (error) {
            console.error('Error loading favorites:', error);
        }
        setIsLoaded(true);
    }, []);

    // Guardar favoritos en localStorage cuando cambien
    useEffect(() => {
        if (isLoaded) {
            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
            } catch (error) {
                console.error('Error saving favorites:', error);
            }
        }
    }, [favorites, isLoaded]);

    const addFavorite = (item: Omit<FavoriteItem, 'addedAt'>) => {
        setFavorites((prev) => {
            if (prev.some((f) => f.id === item.id)) return prev;
            return [...prev, { ...item, addedAt: Date.now() }];
        });
    };

    const removeFavorite = (id: number) => {
        setFavorites((prev) => prev.filter((f) => f.id !== id));
    };

    const isFavorite = (id: number) => {
        return favorites.some((f) => f.id === id);
    };

    const toggleFavorite = (item: Omit<FavoriteItem, 'addedAt'>) => {
        if (isFavorite(item.id)) {
            removeFavorite(item.id);
        } else {
            addFavorite(item);
        }
    };

    const clearFavorites = () => {
        setFavorites([]);
    };

    return (
        <FavoritesContext.Provider
            value={{
                favorites,
                addFavorite,
                removeFavorite,
                isFavorite,
                toggleFavorite,
                clearFavorites,
                count: favorites.length,
            }}
        >
            {children}
        </FavoritesContext.Provider>
    );
}

export function useFavorites() {
    const context = useContext(FavoritesContext);
    if (!context) {
        throw new Error('useFavorites must be used within a FavoritesProvider');
    }
    return context;
}
