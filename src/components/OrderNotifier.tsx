'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, ArrowRight, X } from 'lucide-react';
import { useRouter, usePathname } from 'next/navigation';

interface ReadyOrder {
    _id: string;
    orderNumber: string;
    tableNumber: number;
}

export default function OrderNotifier() {
    const [readyOrder, setReadyOrder] = useState<ReadyOrder | null>(null);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());
    const router = useRouter();
    const pathname = usePathname();

    const checkOrders = useCallback(async () => {
        // Extract tableId from the path (works on /table/X and /order/Y pages)
        const tableMatch = pathname.match(/\/table\/(\d+)/);
        const tableId = tableMatch ? tableMatch[1] : null;

        // Get all saved order keys from localStorage
        const keys = Object.keys(localStorage).filter(k => k.startsWith('dineflow_orders_table_'));

        let allOrderIds: string[] = [];
        let foundTableId = tableId;

        for (const key of keys) {
            const ids = JSON.parse(localStorage.getItem(key) || '[]');
            if (ids.length > 0) {
                allOrderIds = allOrderIds.concat(ids);
                // Get tableId from key if not already found
                if (!foundTableId) {
                    foundTableId = key.replace('dineflow_orders_table_', '');
                }
            }
        }

        if (allOrderIds.length === 0) return;

        try {
            const res = await fetch(`/api/orders/history?ids=${allOrderIds.join(',')}`);
            const data = await res.json();

            if (res.ok && data.orders) {
                // Find orders that are "ready" and not yet dismissed and not currently being viewed
                for (const order of data.orders) {
                    if (
                        order.status === 'ready' &&
                        !dismissed.has(order._id) &&
                        !pathname.includes(order._id) // Don't show if already on that order's page
                    ) {
                        setReadyOrder(order);
                        return;
                    }
                }
            }
        } catch {
            // silent
        }
    }, [pathname, dismissed]);

    useEffect(() => {
        checkOrders();
        const interval = setInterval(checkOrders, 8000);
        return () => clearInterval(interval);
    }, [checkOrders]);

    const handleDismiss = () => {
        if (readyOrder) {
            setDismissed(prev => new Set(prev).add(readyOrder._id));
        }
        setReadyOrder(null);
    };

    const handleGoToOrder = () => {
        if (readyOrder) {
            setDismissed(prev => new Set(prev).add(readyOrder._id));
            router.push(`/order/${readyOrder._id}`);
        }
        setReadyOrder(null);
    };

    return (
        <AnimatePresence>
            {readyOrder && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/70 backdrop-blur-md z-[100] flex items-center justify-center px-4"
                >
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0, y: 50 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.5, opacity: 0, y: 50 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="bg-[var(--bg-card)] rounded-3xl p-8 text-center border border-brand-500/30 max-w-sm w-full shadow-2xl shadow-brand-500/10"
                    >
                        {/* Animated bell icon */}
                        <motion.div
                            animate={{
                                rotate: [0, -15, 15, -15, 15, -10, 10, 0],
                                scale: [1, 1.1, 1.1, 1.1, 1.1, 1.05, 1.05, 1]
                            }}
                            transition={{ duration: 1, delay: 0.2, repeat: Infinity, repeatDelay: 3 }}
                            className="w-20 h-20 rounded-full bg-brand-500/20 flex items-center justify-center mx-auto mb-5"
                        >
                            <Bell size={40} className="text-brand-400" />
                        </motion.div>

                        <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                            Your Order is Ready! 🔔
                        </h2>
                        <p className="text-[var(--text-secondary)] mb-2 text-lg font-semibold">
                            Order #{readyOrder.orderNumber}
                        </p>
                        <p className="text-[var(--text-muted)] mb-6 text-sm">
                            Please collect your food from the counter. Enjoy your meal! 🍽️
                        </p>

                        <div className="space-y-2">
                            <button
                                onClick={handleGoToOrder}
                                className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base"
                            >
                                View Order <ArrowRight size={18} />
                            </button>
                            <button
                                onClick={handleDismiss}
                                className="w-full py-2.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-secondary)] transition-colors flex items-center justify-center gap-1"
                            >
                                <X size={14} /> Dismiss
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
