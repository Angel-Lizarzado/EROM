import { Suspense } from 'react';
import HeroSlider from '@/components/HeroSlider';
import ProductsSection from '@/components/ProductsSection';
import { getProducts } from '@/actions/products';
import { getHeroSlides } from '@/actions/hero-slides';

export default async function HomePage() {
  const [products, slides] = await Promise.all([
    getProducts(),
    getHeroSlides().catch(() => []), // Fallback si la tabla no existe aún
  ]);

  return (
    <>
      {/* Hero Slider */}
      <HeroSlider slides={slides} />

      {/* Products Section with Filters */}
      <Suspense fallback={
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
          <div className="animate-pulse">Cargando productos...</div>
        </div>
      }>
        <ProductsSection products={products} />
      </Suspense>
    </>
  );
}
