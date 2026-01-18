'use client';

import { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
    mainImage: string;
    images: string[];
    productName: string;
    isOffer?: boolean;
    stock?: number;
}

export default function ProductGallery({
    mainImage,
    images = [],
    productName,
    isOffer,
    stock
}: ProductGalleryProps) {
    // Combinar imagen principal con imágenes adicionales, evitando duplicados
    const allImages = [mainImage, ...images.filter(img => img !== mainImage)].filter(Boolean);
    const [currentIndex, setCurrentIndex] = useState(0);

    const goToImage = (index: number) => {
        setCurrentIndex(index);
    };

    const nextImage = () => {
        setCurrentIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = () => {
        setCurrentIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    return (
        <div className="flex flex-col gap-4 w-full">
            {/* Main Image */}
            <div className="w-full aspect-[3/4] lg:aspect-[4/5] overflow-hidden rounded-xl bg-gray-100 relative group">
                {/* Badges */}
                {isOffer && (
                    <div className="absolute top-4 left-4 z-10">
                        <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-white">
                            Oferta
                        </span>
                    </div>
                )}
                {!isOffer && stock !== undefined && stock > 0 && stock <= 5 && (
                    <div className="absolute top-4 left-4 z-10">
                        <span className="bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-text-main">
                            ¡Últimas unidades!
                        </span>
                    </div>
                )}

                {/* Current Image */}
                <img
                    src={allImages[currentIndex] || mainImage}
                    alt={`${productName} - Imagen ${currentIndex + 1}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/600x800?text=Sin+Imagen';
                    }}
                />

                {/* Navigation Arrows (only if multiple images) */}
                {allImages.length > 1 && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm text-text-main flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg"
                            aria-label="Imagen anterior"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm text-text-main flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white shadow-lg"
                            aria-label="Siguiente imagen"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>

                        {/* Image Counter */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium">
                            {currentIndex + 1} / {allImages.length}
                        </div>
                    </>
                )}
            </div>

            {/* Thumbnails (if multiple images) */}
            {allImages.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                    {allImages.map((img, index) => (
                        <button
                            key={index}
                            onClick={() => goToImage(index)}
                            className={`flex-shrink-0 w-16 h-20 lg:w-20 lg:h-24 rounded-lg overflow-hidden transition-all ${currentIndex === index
                                    ? 'ring-2 ring-primary ring-offset-2'
                                    : 'opacity-60 hover:opacity-100'
                                }`}
                        >
                            <img
                                src={img}
                                alt={`${productName} - Miniatura ${index + 1}`}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    (e.target as HTMLImageElement).style.display = 'none';
                                }}
                            />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
