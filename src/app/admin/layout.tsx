'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { UtensilsCrossed, LayoutDashboard, BookOpen, ShoppingBag, Tag, QrCode, LogOut, Menu, X, ChevronRight } from 'lucide-react';

const navItems = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/menu', label: 'Menu Items', icon: BookOpen },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/admin/offers', label: 'Offers', icon: Tag },
    { href: '/admin/qr-codes', label: 'QR Codes', icon: QrCode },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [adminName, setAdminName] = useState('Admin');

    useEffect(() => {
        if (pathname === '/admin/login') return;
        const token = localStorage.getItem('token');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        const admin = localStorage.getItem('admin');
        if (admin) {
            try { setAdminName(JSON.parse(admin).name || 'Admin'); } catch { }
        }
    }, [pathname, router]);

    if (pathname === '/admin/login') return <>{children}</>;

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('admin');
        document.cookie = 'token=; Max-Age=0; path=/';
        router.push('/admin/login');
    };

    return (
        <div className="flex min-h-screen bg-[var(--bg-primary)]">
            {/* Mobile Overlay */}
            <AnimatePresence>
                {sidebarOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setSidebarOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[var(--bg-secondary)] border-r border-[var(--border-color)] transform transition-transform duration-300 lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className="p-5 border-b border-[var(--border-color)]">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
                                <UtensilsCrossed size={20} className="text-black" />
                            </div>
                            <div>
                                <h1 className="font-bold text-base">DineFlow</h1>
                                <p className="text-[0.625rem] text-[var(--text-muted)] uppercase tracking-wider">Admin Panel</p>
                            </div>
                        </div>
                    </div>

                    {/* Nav Items */}
                    <nav className="flex-1 p-3 space-y-1">
                        {navItems.map(item => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                                            ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                                            : 'text-[var(--text-secondary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]'
                                        }`}
                                >
                                    <Icon size={18} />
                                    <span>{item.label}</span>
                                    {isActive && <ChevronRight size={14} className="ml-auto" />}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* Logout */}
                    <div className="p-3 border-t border-[var(--border-color)]">
                        <div className="flex items-center gap-3 px-4 py-3 mb-2">
                            <div className="w-8 h-8 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 text-sm font-bold">
                                {adminName.charAt(0).toUpperCase()}
                            </div>
                            <span className="text-sm font-medium truncate">{adminName}</span>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all"
                        >
                            <LogOut size={18} />
                            <span>Log Out</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main */}
            <main className="flex-1 min-w-0">
                {/* Mobile Header */}
                <div className="sticky top-0 z-30 glass lg:hidden">
                    <div className="flex items-center justify-between px-4 py-3">
                        <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-[var(--bg-elevated)]">
                            <Menu size={20} />
                        </button>
                        <h1 className="font-bold text-base bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">DineFlow</h1>
                        <div className="w-9" />
                    </div>
                </div>

                <div className="p-4 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
