
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ExchangeRateBadge from '@/components/ExchangeRateBadge';
import { getCategories } from '@/actions/categories';
import { MessageCircle } from 'lucide-react';

export default async function ShopLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const categories = await getCategories().catch(() => []);

    return (
        <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden">
            <Header categories={categories} />
            <main className="flex-1 pt-20">
                {children}
            </main>
            <Footer />

            {/* Exchange Rate Badge */}
            <ExchangeRateBadge />

            {/* Floating WhatsApp Button */}
            <a
                href="https://wa.me/573003344963"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-[#25D366]/30 transition-all hover:scale-110 hover:bg-[#20bd5a]"
            >
                <MessageCircle className="h-7 w-7" />
            </a>
        </div>
    );
}
