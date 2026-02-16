'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatPrice, getTimeAgo } from '@/lib/utils';
import { Clock, ChevronDown, RefreshCw, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

interface OrderItem { name: string; price: number; quantity: number; }
interface Order {
    _id: string;
    orderNumber: string;
    tableNumber: number;
    items: OrderItem[];
    status: string;
    estimatedTime: number;
    total: number;
    createdAt: string;
}

const statusFlow = ['pending', 'accepted', 'preparing', 'ready', 'completed'];
const statusLabels: Record<string, string> = {
    pending: '🟡 Pending', accepted: '🔵 Accepted', preparing: '🟠 Preparing', ready: '🟢 Ready', completed: '⚫ Completed'
};

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

    useEffect(() => {
        fetchOrders();
        const interval = setInterval(fetchOrders, 5000);
        return () => clearInterval(interval);
    }, []);

    const getToken = () => localStorage.getItem('token') || '';

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders', { headers: { Authorization: `Bearer ${getToken()}` } });
            const data = await res.json();
            if (res.ok) setOrders(data.orders || []);
        } catch { /* silent */ }
        finally { setLoading(false); }
    };

    const updateStatus = async (orderId: string, newStatus: string, estimatedTime?: number) => {
        try {
            const body: Record<string, unknown> = { status: newStatus };
            if (estimatedTime !== undefined) body.estimatedTime = estimatedTime;

            const res = await fetch(`/api/orders/${orderId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                toast.success(`Status → ${newStatus}`);
                fetchOrders();
            }
        } catch { toast.error('Failed to update'); }
    };

    const getNextStatus = (current: string) => {
        const idx = statusFlow.indexOf(current);
        return idx < statusFlow.length - 1 ? statusFlow[idx + 1] : null;
    };

    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Orders</h1>
                    <p className="text-[var(--text-muted)] mt-1">Manage incoming orders in real-time</p>
                </div>
                <button onClick={fetchOrders} className="btn-secondary flex items-center gap-2">
                    <RefreshCw size={16} /> Refresh
                </button>
            </div>

            {/* Status Filters */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
                {['all', ...statusFlow].map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={`category-pill shrink-0 capitalize ${filter === s ? 'active' : ''}`}>
                        {s === 'all' ? `All (${orders.length})` : `${statusLabels[s] || s} (${orders.filter(o => o.status === s).length})`}
                    </button>
                ))}
            </div>

            {/* Orders List */}
            {loading ? (
                <div className="space-y-4">
                    {[1, 2, 3].map(i => <div key={i} className="card p-5"><div className="skeleton h-28" /></div>)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-5xl mb-3">📋</p>
                    <p className="text-[var(--text-secondary)] font-medium">No orders found</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <AnimatePresence mode="popLayout">
                        {filtered.map((order, i) => {
                            const next = getNextStatus(order.status);
                            const isExpanded = expandedOrder === order._id;
                            return (
                                <motion.div key={order._id} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -100 }}
                                    transition={{ delay: i * 0.03 }} className="card overflow-hidden">
                                    {/* Order Header */}
                                    <div className="p-5 cursor-pointer" onClick={() => setExpandedOrder(isExpanded ? null : order._id)}>
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3 flex-wrap">
                                                    <span className="font-bold">{order.orderNumber}</span>
                                                    <span className={`status-badge status-${order.status}`}>{order.status}</span>
                                                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                                                        <Clock size={12} />{getTimeAgo(order.createdAt)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-4 mt-2 text-sm text-[var(--text-secondary)]">
                                                    <span>🪑 Table {order.tableNumber}</span>
                                                    <span>{order.items.length} item{order.items.length > 1 ? 's' : ''}</span>
                                                    <span className="font-semibold text-brand-400">{formatPrice(order.total)}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {next && (
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); updateStatus(order._id, next, next === 'preparing' ? 15 : undefined); }}
                                                        className="btn-primary py-2 px-4 text-sm"
                                                    >
                                                        → {next.charAt(0).toUpperCase() + next.slice(1)}
                                                    </button>
                                                )}
                                                <ChevronDown size={18} className={`text-[var(--text-muted)] transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Expanded Details */}
                                    <AnimatePresence>
                                        {isExpanded && (
                                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                                                <div className="px-5 pb-5 border-t border-[var(--border-color)] pt-4">
                                                    <div className="space-y-2 mb-4">
                                                        {order.items.map((item, idx) => (
                                                            <div key={idx} className="flex justify-between text-sm">
                                                                <span>{item.quantity}x {item.name}</span>
                                                                <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                    {order.status === 'preparing' && (
                                                        <div className="flex items-center gap-2 mt-3">
                                                            <span className="text-sm text-[var(--text-muted)]">ETA:</span>
                                                            {[10, 15, 20, 30, 45].map(t => (
                                                                <button key={t} onClick={() => updateStatus(order._id, 'preparing', t)}
                                                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${order.estimatedTime === t ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-[var(--bg-elevated)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'}`}>
                                                                    {t}m
                                                                </button>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}
        </div>
    );
}
