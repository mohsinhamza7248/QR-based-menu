'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { CartProvider } from '@/context/CartContext';
import OrderNotifier from '@/components/OrderNotifier';

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <CartProvider>
                <div className="min-h-screen bg-[var(--bg-primary)]">
                    {children}
                    <OrderNotifier />
                </div>
            </CartProvider>
        </ThemeProvider>
    );
}

