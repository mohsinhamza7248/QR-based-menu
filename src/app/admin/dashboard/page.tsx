'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, BookOpen, ShoppingBag, DollarSign, Activity } from 'lucide-react';

interface Stats {
    totalMenuItems: number;
    totalTables: number;
    todayOrders: number;
    activeOrders: number;
    todayRevenue: number;
}

export default function AdminDashboard() {
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/dashboard/stats', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setStats(data.stats);
        } catch {
            // silent
        } finally {
            setLoading(false);
        }
    };

    const statCards = [
        { label: 'Menu Items', value: stats?.totalMenuItems || 0, icon: BookOpen, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-500/10', textColor: 'text-blue-400' },
        { label: 'Active Tables', value: stats?.totalTables || 0, icon: LayoutDashboard, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-500/10', textColor: 'text-purple-400' },
        { label: "Today's Orders", value: stats?.todayOrders || 0, icon: ShoppingBag, color: 'from-brand-500 to-brand-600', bg: 'bg-brand-500/10', textColor: 'text-brand-400' },
        { label: 'Active Orders', value: stats?.activeOrders || 0, icon: Activity, color: 'from-green-500 to-green-600', bg: 'bg-green-500/10', textColor: 'text-green-400' },
        { label: "Today's Revenue", value: `₹${stats?.todayRevenue || 0}`, icon: DollarSign, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-500/10', textColor: 'text-emerald-400' },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Dashboard</h1>
                <p className="text-[var(--text-muted)] mt-1">Welcome back! Here&apos;s your restaurant overview.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                {statCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="card p-5"
                        >
                            {loading ? (
                                <div className="space-y-3">
                                    <div className="skeleton w-10 h-10 rounded-xl" />
                                    <div className="skeleton h-8 w-16" />
                                    <div className="skeleton h-4 w-24" />
                                </div>
                            ) : (
                                <>
                                    <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                                        <Icon size={20} className={card.textColor} />
                                    </div>
                                    <p className="text-2xl font-bold">{card.value}</p>
                                    <p className="text-sm text-[var(--text-muted)] mt-1">{card.label}</p>
                                </>
                            )}
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
