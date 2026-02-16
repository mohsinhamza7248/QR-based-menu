'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import OrderNotifier from '@/components/OrderNotifier';

export default function OrderLayout({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <div className="min-h-screen bg-[var(--bg-primary)]">
                {children}
                <OrderNotifier />
            </div>
        </ThemeProvider>
    );
}
