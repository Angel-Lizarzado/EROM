'use client';

import { useState } from 'react';
import { Minus, Plus, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useFavorites } from '@/context/FavoritesContext';
import WhatsAppButton from '@/components/WhatsAppButton';

interface ProductActionsProps {
    product: {
        id: number;
        name: string;
        priceUsd: number;
        image: string;
        stock: number;
        slug: string; // Add slug here
    };
}

export default function ProductActions({ product }: ProductActionsProps) {
    const [quantity, setQuantity] = useState(1);
    const { isFavorite, toggleFavorite } = useFavorites();
    const router = useRouter(); // Import useRouter
    const isInFavorites = isFavorite(product.id);

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
        }
    };

    const increaseQuantity = () => {
        if (quantity < product.stock) {
            setQuantity(quantity + 1);
        }
    };

    const handleWhatsAppBuy = () => {
        const message = encodeURIComponent(
            `Hola, me interesa comprar: ${product.name} (x${quantity}) - Precio total: $${(product.priceUsd * quantity).toFixed(2)}`
        );
        window.open(`https://wa.me/573003344963?text=${message}`, '_blank');
    };

    const handleToggleFavorite = () => {
        toggleFavorite({
            id: product.id,
            name: product.name,
            priceUsd: product.priceUsd,
            image: product.image,
            slug: product.slug, // Pass slug
        });
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex gap-4">
                {/* Quantity Selector */}
                <div className="flex items-center rounded-full bg-white border border-border h-14 px-2">
                    <button
                        onClick={decreaseQuantity}
                        disabled={quantity <= 1}
                        className="size-10 flex items-center justify-center text-text-muted hover:text-primary transition-colors disabled:opacity-30"
                    >
                        <Minus className="h-4 w-4" />
                    </button>
                    <span className="w-8 text-center text-text-main font-semibold">{quantity}</span>
                    <button
                        onClick={increaseQuantity}
                        disabled={quantity >= product.stock}
                        className="size-10 flex items-center justify-center text-text-muted hover:text-primary transition-colors disabled:opacity-30"
                    >
                        <Plus className="h-4 w-4" />
                    </button>
                </div>

                {/* WhatsApp Button */}
                <div className="flex-1">
                    <WhatsAppButton
                        productId={product.id}
                        productName={product.name}
                        priceUsd={product.priceUsd}
                        quantity={quantity}
                        disabled={product.stock === 0}
                    />
                </div>

                {/* Favorite Button */}
                <button
                    onClick={handleToggleFavorite}
                    className={`size-14 flex items-center justify-center rounded-full border transition-all ${isInFavorites
                        ? 'bg-primary border-primary text-white'
                        : 'bg-white border-border text-text-muted hover:border-primary hover:text-primary'
                        }`}
                >
                    <Heart className={`h-5 w-5 ${isInFavorites ? 'fill-current' : ''}`} />
                </button>
            </div>
            <p className="text-xs text-text-muted text-center mt-1">
                Envío gratis en Caracas para pedidos mayores a $50.
            </p>
        </div>
    );
}
