'use client';

import React, { useState, useEffect, use } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice } from '@/lib/utils';
import { CheckCircle2, Clock, ChefHat, Bell, PartyPopper, ArrowLeft, Package, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface OrderData {
    _id: string;
    orderNumber: string;
    tableNumber: number;
    items: { name: string; price: number; quantity: number; image: string }[];
    status: string;
    estimatedTime: number;
    subtotal: number;
    discount: number;
    total: number;
    couponCode?: string;
    createdAt: string;
}

const statusSteps = [
    { key: 'pending', label: 'Order Placed', icon: Package, description: 'Waiting for restaurant to accept' },
    { key: 'accepted', label: 'Accepted', icon: CheckCircle2, description: 'Restaurant has confirmed your order' },
    { key: 'preparing', label: 'Preparing', icon: ChefHat, description: 'Your food is being prepared' },
    { key: 'ready', label: 'Ready', icon: Bell, description: 'Your order is ready for pickup' },
    { key: 'completed', label: 'Completed', icon: PartyPopper, description: 'Enjoy your meal!' },
];

export default function OrderPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = use(params);
    const [order, setOrder] = useState<OrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [showCelebration, setShowCelebration] = useState(false);
    const [prevStatus, setPrevStatus] = useState<string>('');
    const router = useRouter();

    useEffect(() => {
        fetchOrder();
        const interval = setInterval(fetchOrder, 5000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (order) {
            // Only show celebration when status *changes* to ready or completed
            if (
                (order.status === 'ready' || order.status === 'completed') &&
                prevStatus !== order.status &&
                prevStatus !== ''
            ) {
                setShowCelebration(true);
            }
            setPrevStatus(order.status);
        }
    }, [order?.status]);

    const fetchOrder = async () => {
        try {
            const res = await fetch(`/api/orders/${orderId}`);
            const data = await res.json();
            if (res.ok) setOrder(data.order);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    const getStatusIndex = () => {
        if (!order) return -1;
        return statusSteps.findIndex(s => s.key === order.status);
    };

    const handleCelebrationClose = () => {
        setShowCelebration(false);
        if (order?.status === 'completed') {
            router.push(`/table/${order.tableNumber}`);
        }
    };

    const handleBackToMenu = () => {
        setShowCelebration(false);
        if (order) {
            router.push(`/table/${order.tableNumber}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-3 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[var(--text-muted)]">Loading your order...</p>
                </div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
                <div className="text-center">
                    <p className="text-6xl mb-4">😕</p>
                    <p className="text-lg font-medium">Order not found</p>
                </div>
            </div>
        );
    }

    const currentStep = getStatusIndex();
    const isReady = order.status === 'ready';
    const isCompleted = order.status === 'completed';

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] pb-8">
            {/* Header */}
            <div className="glass sticky top-0 z-40">
                <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-3">
                    <Link href={`/table/${order.tableNumber}`} className="p-2 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors">
                        <ArrowLeft size={20} />
                    </Link>
                    <div className="flex-1">
                        <h1 className="font-bold text-lg">Order {order.orderNumber}</h1>
                        <p className="text-xs text-[var(--text-muted)]">Table {order.tableNumber}</p>
                    </div>
                    {isReady && (
                        <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-bold"
                        >
                            🔔 READY
                        </motion.div>
                    )}
                </div>
            </div>

            <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
                {/* Status Progress */}
                <div className="card p-6">
                    <h2 className="font-semibold mb-6 text-[var(--text-primary)]">Order Status</h2>
                    <div className="space-y-0">
                        {statusSteps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = index <= currentStep;
                            const isCurrent = index === currentStep;
                            return (
                                <div key={step.key} className="flex gap-4">
                                    <div className="flex flex-col items-center">
                                        <motion.div
                                            initial={false}
                                            animate={{
                                                scale: isCurrent ? 1.1 : 1,
                                                backgroundColor: isActive ? '#f59e0b' : 'var(--bg-elevated)',
                                            }}
                                            className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ${isCurrent ? 'ring-4 ring-brand-500/20' : ''}`}
                                        >
                                            <Icon size={18} className={isActive ? 'text-black' : 'text-[var(--text-muted)]'} />
                                        </motion.div>
                                        {index < statusSteps.length - 1 && (
                                            <div className={`w-0.5 h-12 ${index < currentStep ? 'bg-brand-500' : 'bg-[var(--border-color)]'}`} />
                                        )}
                                    </div>
                                    <div className="pb-12">
                                        <p className={`font-semibold text-sm ${isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]'}`}>
                                            {step.label}
                                        </p>
                                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{step.description}</p>
                                        {isCurrent && order.estimatedTime > 0 && step.key === 'preparing' && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -5 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center gap-1.5 mt-2 text-brand-400 text-xs font-medium"
                                            >
                                                <Clock size={12} />
                                                <span>Estimated: {order.estimatedTime} min</span>
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Order Items */}
                <div className="card p-5">
                    <h3 className="font-semibold mb-4">Order Items</h3>
                    <div className="space-y-3">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex items-center justify-between py-2">
                                <div className="flex items-center gap-3">
                                    <span className="w-6 h-6 rounded-lg bg-brand-500/10 text-brand-400 text-xs font-bold flex items-center justify-center">
                                        {item.quantity}x
                                    </span>
                                    <span className="text-sm">{item.name}</span>
                                </div>
                                <span className="text-sm font-medium">{formatPrice(item.price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="border-t border-[var(--border-color)] mt-4 pt-4 space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-[var(--text-muted)]">Subtotal</span>
                            <span>{formatPrice(order.subtotal)}</span>
                        </div>
                        {order.discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-green-400">Discount {order.couponCode && `(${order.couponCode})`}</span>
                                <span className="text-green-400">-{formatPrice(order.discount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-lg pt-2">
                            <span>Total</span>
                            <span className="text-brand-400">{formatPrice(order.total)}</span>
                        </div>
                    </div>
                </div>

                {/* Back to Menu / Completed button */}
                {(isReady || isCompleted) && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleBackToMenu}
                        className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2"
                    >
                        {isCompleted ? 'Order Again' : 'Back to Menu'} <ArrowRight size={18} />
                    </motion.button>
                )}
            </div>

            {/* Celebration Popup */}
            <AnimatePresence>
                {showCelebration && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center"
                            onClick={handleCelebrationClose}
                        >
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0, y: 50 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.5, opacity: 0, y: 50 }}
                                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                                className="bg-[var(--bg-card)] rounded-3xl p-8 mx-6 text-center border border-[var(--border-color)] max-w-sm"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <motion.div
                                    animate={{ rotate: [0, -10, 10, -10, 10, 0] }}
                                    transition={{ duration: 0.6, delay: 0.3 }}
                                    className="text-7xl mb-4"
                                >
                                    {isCompleted ? '🎉' : '🔔'}
                                </motion.div>
                                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                                    {isCompleted ? 'Order Complete!' : 'Order Ready!'}
                                </h2>
                                <p className="text-[var(--text-secondary)] mb-6">
                                    {isCompleted
                                        ? 'Thank you for dining with us! Come back again soon. 🍽️'
                                        : 'Your delicious food is waiting for you. Enjoy your meal! 🍽️'}
                                </p>
                                <button
                                    onClick={handleBackToMenu}
                                    className="btn-primary w-full py-3 flex items-center justify-center gap-2"
                                >
                                    {isCompleted ? 'Order Again 🙌' : 'Back to Menu 🍽️'}
                                    <ArrowRight size={16} />
                                </button>
                            </motion.div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
