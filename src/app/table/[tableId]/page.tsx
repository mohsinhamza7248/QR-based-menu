'use client';

import React, { useState, useEffect, use, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import { useTheme } from '@/context/ThemeContext';
import { formatPrice, getTimeAgo } from '@/lib/utils';
import { ShoppingCart, Plus, Minus, Search, Sun, Moon, Leaf, Drumstick, Coffee, Sparkles, IceCreamCone, ChevronRight, X, Tag, ArrowRight, Clock, Receipt, Eye, Copy, Ticket } from 'lucide-react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface MenuItem {
    _id: string;
    name: string;
    description: string;
    price: number;
    image: string;
    category: string;
    isAvailable: boolean;
    preparationTime: number;
    tags: string[];
}

interface OrderItem {
    name: string;
    price: number;
    quantity: number;
    image: string;
}

interface PreviousOrder {
    _id: string;
    orderNumber: string;
    status: string;
    items: OrderItem[];
    total: number;
    createdAt: string;
}

interface OrderSummary {
    totalOrders: number;
    totalItems: number;
    totalBill: number;
}

interface Offer {
    _id: string;
    code: string;
    title: string;
    description: string;
    discountType: 'percentage' | 'flat';
    discountValue: number;
    minOrderValue: number;
}

const categories = [
    { id: 'all', label: 'All', icon: Sparkles },
    { id: 'veg', label: 'Veg', icon: Leaf },
    { id: 'non-veg', label: 'Non-Veg', icon: Drumstick },
    { id: 'drinks', label: 'Drinks', icon: Coffee },
    { id: 'combos', label: 'Combos', icon: Tag },
    { id: 'desserts', label: 'Desserts', icon: IceCreamCone },
];

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-400',
    accepted: 'bg-blue-500/20 text-blue-400',
    preparing: 'bg-orange-500/20 text-orange-400',
    ready: 'bg-green-500/20 text-green-400',
    completed: 'bg-gray-500/20 text-gray-400',
};

export default function TablePage({ params }: { params: Promise<{ tableId: string }> }) {
    const { tableId } = use(params);
    const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [showCart, setShowCart] = useState(false);
    const [activeTab, setActiveTab] = useState<'menu' | 'orders'>('menu');
    const [previousOrders, setPreviousOrders] = useState<PreviousOrder[]>([]);
    const [orderSummary, setOrderSummary] = useState<OrderSummary | null>(null);
    const [loadingOrders, setLoadingOrders] = useState(false);
    const { items, addItem, updateQuantity, getItemCount, getItemQuantity, getTotal, clearCart } = useCart();
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();

    useEffect(() => {
        fetchMenu();
        fetchOffers();
    }, []);

    const fetchOffers = async () => {
        try {
            const res = await fetch('/api/offers');
            const data = await res.json();
            setOffers(data.offers || []);
        } catch { }
    };

    // Load order history when orders tab is active
    const fetchOrderHistory = useCallback(async () => {
        const storageKey = `dineflow_orders_table_${tableId}`;
        const savedIds = JSON.parse(localStorage.getItem(storageKey) || '[]');

        if (savedIds.length === 0) {
            setPreviousOrders([]);
            setOrderSummary(null);
            return;
        }

        setLoadingOrders(true);
        try {
            const res = await fetch(`/api/orders/history?ids=${savedIds.join(',')}`);
            const data = await res.json();
            if (res.ok) {
                setPreviousOrders(data.orders || []);
                setOrderSummary(data.summary || null);
            }
        } catch {
            // silent
        } finally {
            setLoadingOrders(false);
        }
    }, [tableId]);

    useEffect(() => {
        if (activeTab === 'orders') {
            fetchOrderHistory();
        }
    }, [activeTab, fetchOrderHistory]);

    const fetchMenu = async () => {
        try {
            const res = await fetch('/api/menu?available=true');
            const data = await res.json();
            setMenuItems(data.items || []);
        } catch {
            toast.error('Failed to load menu');
        } finally {
            setLoading(false);
        }
    };

    const filteredItems = menuItems.filter(item => {
        const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    // Save order ID to localStorage
    const saveOrderToLocal = (orderId: string) => {
        const storageKey = `dineflow_orders_table_${tableId}`;
        const existing = JSON.parse(localStorage.getItem(storageKey) || '[]');
        if (!existing.includes(orderId)) {
            existing.push(orderId);
            localStorage.setItem(storageKey, JSON.stringify(existing));
        }
    };

    const handlePlaceOrder = async () => {
        if (items.length === 0) return;

        try {
            const orderData = {
                tableId,
                tableNumber: parseInt(tableId),
                items: items.map(item => ({
                    menuItemId: item._id,
                    name: item.name,
                    price: item.price,
                    quantity: item.quantity,
                    image: item.image,
                })),
                subtotal: getTotal(),
                total: getTotal(),
                customerNotes: '',
            };

            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData),
            });

            const data = await res.json();
            if (res.ok) {
                saveOrderToLocal(data.order._id);
                toast.success('Order placed successfully! 🎉');
                clearCart();
                setShowCart(false);
                router.push(`/order/${data.order._id}`);
            } else {
                toast.error(data.error || 'Failed to place order');
            }
        } catch {
            toast.error('Something went wrong');
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success(`Code ${text} copied! Apply at counter 🏷️`);
    };

    const getSavedOrderCount = () => {
        const storageKey = `dineflow_orders_table_${tableId}`;
        return JSON.parse(localStorage.getItem(storageKey) || '[]').length;
    };

    const [savedOrderCount, setSavedOrderCount] = useState(0);
    useEffect(() => {
        setSavedOrderCount(getSavedOrderCount());
    }, []);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] pb-24">
            {/* Header */}
            <div className="sticky top-0 z-40 glass">
                <div className="max-w-lg mx-auto px-4 py-4">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <h1 className="text-xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                                DineFlow
                            </h1>
                            <p className="text-xs text-[var(--text-muted)]">Table {tableId} · Scan & Order</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={toggleTheme} className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] transition-all hover:border-brand-500/30">
                                {theme === 'dark' ? <Sun size={18} className="text-brand-400" /> : <Moon size={18} className="text-brand-600" />}
                            </button>
                        </div>
                    </div>

                    {/* Tab Switcher */}
                    <div className="flex gap-1 p-1 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] mb-3">
                        <button
                            onClick={() => setActiveTab('menu')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all ${activeTab === 'menu'
                                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            🍽️ Menu
                        </button>
                        <button
                            onClick={() => setActiveTab('orders')}
                            className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-1.5 ${activeTab === 'orders'
                                ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30'
                                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                }`}
                        >
                            <Receipt size={14} />
                            My Orders
                            {savedOrderCount > 0 && (
                                <span className="w-5 h-5 rounded-full bg-brand-500/20 text-brand-400 text-xs font-bold flex items-center justify-center">
                                    {savedOrderCount}
                                </span>
                            )}
                        </button>
                    </div>

                    {/* Search - only on menu tab */}
                    {activeTab === 'menu' && (
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input
                                type="text"
                                placeholder="Search dishes..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="input pl-9 py-2.5 text-sm"
                            />
                        </div>
                    )}
                </div>

                {/* Category Pills - only on menu tab */}
                {activeTab === 'menu' && (
                    <div className="max-w-lg mx-auto px-4 pb-3">
                        <div className="flex gap-2 overflow-x-auto no-scrollbar">
                            {categories.map(cat => {
                                const Icon = cat.icon;
                                return (
                                    <button
                                        key={cat.id}
                                        onClick={() => setActiveCategory(cat.id)}
                                        className={`category-pill flex items-center gap-1.5 shrink-0 ${activeCategory === cat.id ? 'active' : ''}`}
                                    >
                                        <Icon size={14} />
                                        {cat.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* MENU TAB */}
            {activeTab === 'menu' && (
                <div className="max-w-lg mx-auto px-4 py-4">
                    {/* Offers Carousel */}
                    {offers.length > 0 && !searchQuery && activeCategory === 'all' && (
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <Ticket size={18} className="text-brand-400" />
                                <h3 className="font-bold text-lg">Today's Offers</h3>
                            </div>
                            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                                {offers.map((offer) => (
                                    <motion.button
                                        key={offer._id}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => copyToClipboard(offer.code)}
                                        className="shrink-0 w-64 p-4 rounded-2xl bg-gradient-to-br from-brand-900/50 to-brand-800/20 border border-brand-500/20 flex flex-col items-start gap-2 relative overflow-hidden group"
                                    >
                                        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                            <Ticket size={80} />
                                        </div>
                                        <span className="px-2 py-1 rounded-lg bg-brand-500 text-white text-xs font-bold tracking-wider">
                                            {offer.code}
                                        </span>
                                        <div>
                                            <h4 className="font-bold text-lg leading-tight">{offer.title}</h4>
                                            <p className="text-xs text-[var(--text-muted)] mt-1">{offer.description}</p>
                                        </div>
                                        <div className="mt-2 text-xs font-medium text-brand-400 flex items-center gap-1">
                                            <Copy size={12} /> Tap to copy code
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-1 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="card p-4">
                                    <div className="flex gap-4">
                                        <div className="skeleton w-24 h-24 rounded-xl shrink-0" />
                                        <div className="flex-1 space-y-2">
                                            <div className="skeleton h-5 w-32" />
                                            <div className="skeleton h-4 w-full" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : filteredItems.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">🍽️</div>
                            <p className="text-[var(--text-secondary)] text-lg font-medium">No dishes found</p>
                            <p className="text-[var(--text-muted)] text-sm mt-1">Try a different category or search term</p>
                        </div>
                    ) : (
                        <motion.div layout className="grid grid-cols-1 gap-3">
                            <AnimatePresence mode="popLayout">
                                {filteredItems.map((item, index) => {
                                    const qty = getItemQuantity(item._id);
                                    return (
                                        <motion.div
                                            key={item._id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            transition={{ delay: index * 0.05 }}
                                            className="card p-4"
                                        >
                                            <div className="flex gap-4">
                                                {/* Image */}
                                                <div className="relative w-24 h-24 rounded-xl overflow-hidden shrink-0 bg-[var(--bg-elevated)]">
                                                    {item.image ? (
                                                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-3xl">
                                                            {item.category === 'veg' ? '🥗' : item.category === 'drinks' ? '🥤' : item.category === 'desserts' ? '🍰' : '🍽️'}
                                                        </div>
                                                    )}
                                                    <div className={`absolute top-1.5 left-1.5 w-4 h-4 rounded border-2 flex items-center justify-center ${item.category === 'veg' ? 'border-green-500' : item.category === 'non-veg' ? 'border-red-500' : 'border-brand-500'}`}>
                                                        <div className={`w-2 h-2 rounded-full ${item.category === 'veg' ? 'bg-green-500' : item.category === 'non-veg' ? 'bg-red-500' : 'bg-brand-500'}`} />
                                                    </div>
                                                </div>

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-start justify-between gap-2">
                                                        <div>
                                                            <h3 className="font-semibold text-[var(--text-primary)] text-sm leading-tight">{item.name}</h3>
                                                            {item.tags && item.tags.length > 0 && (
                                                                <div className="flex gap-1 mt-1">
                                                                    {item.tags.map(tag => (
                                                                        <span key={tag} className="text-[0.625rem] px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400 font-medium">
                                                                            {tag}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <p className="text-[var(--text-muted)] text-xs mt-1 line-clamp-2">{item.description}</p>
                                                    <div className="flex items-center justify-between mt-2.5">
                                                        <span className="text-base font-bold text-[var(--text-primary)]">{formatPrice(item.price)}</span>

                                                        {qty === 0 ? (
                                                            <motion.button
                                                                whileTap={{ scale: 0.95 }}
                                                                onClick={() => addItem({ _id: item._id, name: item.name, price: item.price, image: item.image })}
                                                                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-brand-500/10 text-brand-400 text-sm font-semibold border border-brand-500/20 hover:bg-brand-500/20 transition-all"
                                                            >
                                                                <Plus size={14} /> ADD
                                                            </motion.button>
                                                        ) : (
                                                            <motion.div
                                                                initial={{ scale: 0.8 }}
                                                                animate={{ scale: 1 }}
                                                                className="flex items-center gap-2 bg-brand-500/10 rounded-xl px-1 py-0.5 border border-brand-500/20"
                                                            >
                                                                <button
                                                                    onClick={() => updateQuantity(item._id, qty - 1)}
                                                                    className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 hover:bg-brand-500/30 transition-all"
                                                                >
                                                                    <Minus size={14} />
                                                                </button>
                                                                <span className="w-5 text-center text-sm font-bold text-brand-400">{qty}</span>
                                                                <button
                                                                    onClick={() => updateQuantity(item._id, qty + 1)}
                                                                    className="w-7 h-7 rounded-lg bg-brand-500/20 flex items-center justify-center text-brand-400 hover:bg-brand-500/30 transition-all"
                                                                >
                                                                    <Plus size={14} />
                                                                </button>
                                                            </motion.div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </motion.div>
                    )}
                </div>
            )}

            {/* ORDERS TAB */}
            {activeTab === 'orders' && (
                <div className="max-w-lg mx-auto px-4 py-4">
                    {loadingOrders ? (
                        <div className="space-y-3">
                            {[1, 2].map(i => (
                                <div key={i} className="card p-4">
                                    <div className="skeleton h-20" />
                                </div>
                            ))}
                        </div>
                    ) : previousOrders.length === 0 ? (
                        <div className="text-center py-20">
                            <div className="text-6xl mb-4">📋</div>
                            <p className="text-[var(--text-secondary)] text-lg font-medium">No orders yet</p>
                            <p className="text-[var(--text-muted)] text-sm mt-1">Place your first order from the menu!</p>
                            <button
                                onClick={() => setActiveTab('menu')}
                                className="btn-primary mt-4 inline-flex items-center gap-2"
                            >
                                Browse Menu <ArrowRight size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Bill Summary Card */}
                            {orderSummary && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="card p-5 border-brand-500/20"
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <Receipt size={18} className="text-brand-400" />
                                        <h3 className="font-bold">Your Bill Summary</h3>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[var(--text-muted)]">Total Orders</span>
                                            <span className="font-medium">{orderSummary.totalOrders}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-[var(--text-muted)]">Total Items</span>
                                            <span className="font-medium">{orderSummary.totalItems}</span>
                                        </div>
                                        <div className="h-px bg-[var(--border-color)]" />
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">Total Bill</span>
                                            <span className="text-2xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                                                {formatPrice(orderSummary.totalBill)}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            {/* Order List */}
                            <div className="space-y-3">
                                {previousOrders.map((order, i) => (
                                    <motion.div
                                        key={order._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: i * 0.05 }}
                                        className="card p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3 mb-3">
                                            <div>
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-bold text-sm">{order.orderNumber}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusColors[order.status] || statusColors.pending}`}>
                                                        {order.status}
                                                    </span>
                                                </div>
                                                <p className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-1">
                                                    <Clock size={12} /> {getTimeAgo(order.createdAt)}
                                                </p>
                                            </div>
                                            <button
                                                onClick={() => router.push(`/order/${order._id}`)}
                                                className="p-2 rounded-xl bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-brand-500/30 transition-all"
                                            >
                                                <Eye size={16} className="text-brand-400" />
                                            </button>
                                        </div>

                                        {/* Items */}
                                        <div className="space-y-1.5 mb-3">
                                            {order.items.map((item, idx) => (
                                                <div key={idx} className="flex justify-between text-sm">
                                                    <span className="text-[var(--text-secondary)]">{item.quantity}x {item.name}</span>
                                                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="h-px bg-[var(--border-color)] mb-2" />
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-[var(--text-muted)]">Order Total</span>
                                            <span className="font-bold text-brand-400">{formatPrice(order.total)}</span>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Floating Cart Button */}
            <AnimatePresence>
                {getItemCount() > 0 && !showCart && activeTab === 'menu' && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-4 left-4 right-4 max-w-lg mx-auto z-50"
                    >
                        <button
                            onClick={() => setShowCart(true)}
                            className="w-full btn-primary flex items-center justify-between py-4 px-6 text-base"
                        >
                            <div className="flex items-center gap-3">
                                <div className="relative">
                                    <ShoppingCart size={20} />
                                    <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-black text-brand-400 text-xs font-bold flex items-center justify-center">
                                        {getItemCount()}
                                    </span>
                                </div>
                                <span>{getItemCount()} item{getItemCount() > 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold">{formatPrice(getTotal())}</span>
                                <ChevronRight size={18} />
                            </div>
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Cart Drawer */}
            <AnimatePresence>
                {showCart && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                            onClick={() => setShowCart(false)}
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] bg-[var(--bg-secondary)] rounded-t-3xl border-t border-[var(--border-color)] overflow-hidden"
                        >
                            <div className="max-w-lg mx-auto">
                                {/* Handle */}
                                <div className="flex justify-center pt-3 pb-2">
                                    <div className="w-10 h-1 rounded-full bg-[var(--border-color)]" />
                                </div>

                                {/* Header */}
                                <div className="flex items-center justify-between px-5 pb-4">
                                    <h2 className="text-lg font-bold">Your Order</h2>
                                    <button onClick={() => setShowCart(false)} className="p-2 rounded-xl hover:bg-[var(--bg-elevated)] transition-colors">
                                        <X size={20} className="text-[var(--text-muted)]" />
                                    </button>
                                </div>

                                {/* Items */}
                                <div className="px-5 max-h-[50vh] overflow-y-auto space-y-3 pb-4">
                                    {items.map(item => (
                                        <div key={item._id} className="flex items-center gap-3 p-3 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
                                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-[var(--bg-elevated)] shrink-0">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-medium text-sm truncate">{item.name}</h4>
                                                <p className="text-sm font-bold text-brand-400 mt-0.5">{formatPrice(item.price * item.quantity)}</p>
                                            </div>
                                            <div className="flex items-center gap-1.5 bg-[var(--bg-elevated)] rounded-xl px-1 py-0.5">
                                                <button onClick={() => updateQuantity(item._id, item.quantity - 1)} className="w-7 h-7 rounded-lg hover:bg-[var(--border-color)] flex items-center justify-center transition-colors">
                                                    <Minus size={14} />
                                                </button>
                                                <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item._id, item.quantity + 1)} className="w-7 h-7 rounded-lg hover:bg-[var(--border-color)] flex items-center justify-center transition-colors">
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Summary */}
                                <div className="px-5 pt-3 pb-5 border-t border-[var(--border-color)]">
                                    <div className="flex justify-between items-center mb-4">
                                        <span className="text-[var(--text-secondary)]">Total</span>
                                        <span className="text-xl font-bold">{formatPrice(getTotal())}</span>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handlePlaceOrder}
                                        className="w-full btn-primary py-4 text-base flex items-center justify-center gap-2"
                                    >
                                        Place Order <ArrowRight size={18} />
                                    </motion.button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
        </div>
    );
}
