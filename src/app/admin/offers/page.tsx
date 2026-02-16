'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, ToggleLeft, ToggleRight, Ticket, Sparkles, Copy } from 'lucide-react';
import toast from 'react-hot-toast';

interface Offer {
    _id: string;
    code: string;
    title: string;
    description: string;
    discountType: 'percentage' | 'flat';
    discountValue: number;
    minOrderValue: number;
    maxDiscount: number;
    isActive: boolean;
    validFrom: string;
    validUntil: string;
}

interface OfferForm {
    code: string;
    title: string;
    description: string;
    discountType: 'percentage' | 'flat';
    discountValue: number;
    minOrderValue: number;
    maxDiscount: number;
    isActive: boolean;
    validFrom: string;
    validUntil: string;
}

const emptyOffer: OfferForm = {
    code: '', title: '', description: '', discountType: 'percentage',
    discountValue: 0, minOrderValue: 0, maxDiscount: 0, isActive: true,
    validFrom: new Date().toISOString().split('T')[0],
    validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
};

const PRESETS = [
    { label: '10% Off', data: { code: 'WELCOME10', title: '10% Off on your order', discountType: 'percentage', discountValue: 10, minOrderValue: 200, maxDiscount: 100 } },
    { label: '20% Off', data: { code: 'SAVE20', title: 'Flat 20% Discount', discountType: 'percentage', discountValue: 20, minOrderValue: 500, maxDiscount: 200 } },
    { label: '₹50 Off', data: { code: 'FLAT50', title: 'Flat ₹50 Off', discountType: 'flat', discountValue: 50, minOrderValue: 300, maxDiscount: 0 } },
    { label: '₹100 Off', data: { code: 'BIGSAVE', title: 'Big Savings: ₹100 Off', discountType: 'flat', discountValue: 100, minOrderValue: 800, maxDiscount: 0 } },
];

export default function OffersPage() {
    const [offers, setOffers] = useState<Offer[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<Offer | null>(null);
    const [form, setForm] = useState(emptyOffer);

    useEffect(() => { fetchOffers(); }, []);

    const getToken = () => localStorage.getItem('token') || '';

    const fetchOffers = async () => {
        try {
            const res = await fetch('/api/offers');
            const data = await res.json();
            setOffers(data.offers || []);
        } catch { } finally { setLoading(false); }
    };

    const handleSave = async () => {
        if (!form.code || !form.title) { toast.error('Code and title required'); return; }
        try {
            const url = editing ? `/api/offers/${editing._id}` : '/api/offers';
            const method = editing ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify(form),
            });
            if (res.ok) { toast.success(editing ? 'Updated!' : 'Created!'); fetchOffers(); closeModal(); }
            else { const d = await res.json(); toast.error(d.error || 'Failed'); }
        } catch { toast.error('Error'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this offer?')) return;
        try {
            await fetch(`/api/offers/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
            toast.success('Deleted'); fetchOffers();
        } catch { toast.error('Failed'); }
    };

    const handleToggle = async (offer: Offer) => {
        try {
            await fetch(`/api/offers/${offer._id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify({ isActive: !offer.isActive }),
            });
            fetchOffers();
        } catch { }
    };

    const openEdit = (o: Offer) => {
        setEditing(o);
        setForm({ code: o.code, title: o.title, description: o.description, discountType: o.discountType, discountValue: o.discountValue, minOrderValue: o.minOrderValue, maxDiscount: o.maxDiscount, isActive: o.isActive, validFrom: o.validFrom.split('T')[0], validUntil: o.validUntil.split('T')[0] });
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditing(null); setForm(emptyOffer); };

    const applyPreset = (preset: any) => {
        setForm(prev => ({ ...prev, ...preset.data }));
    };

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Offers & Coupons</h1>
                    <p className="text-[var(--text-muted)] mt-1">{offers.length} offers created</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Create Offer
                </button>
            </div>

            {loading ? (
                <div className="space-y-3">{[1, 2].map(i => <div key={i} className="card p-5"><div className="skeleton h-20" /></div>)}</div>
            ) : offers.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-5xl mb-3">🏷️</p>
                    <p className="text-[var(--text-secondary)] font-medium">No offers yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {offers.map((offer, i) => (
                        <motion.div key={offer._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5 flex flex-col justify-between h-full">
                            <div>
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-sm font-mono font-bold bg-brand-500/10 text-brand-400 px-3 py-1 rounded-lg border border-brand-500/20">{offer.code}</span>
                                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${offer.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {offer.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                <h3 className="font-bold text-lg leading-tight">{offer.title}</h3>
                                <p className="text-sm text-[var(--text-muted)] mt-1">{offer.description || 'No description'}</p>
                                <div className="mt-3 space-y-1">
                                    <p className="text-xs text-[var(--text-secondary)] flex items-center gap-2">
                                        <Ticket size={12} />
                                        {offer.discountType === 'percentage' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} FLAT OFF`}
                                    </p>
                                    <p className="text-xs text-[var(--text-muted)]">
                                        Min Order: ₹{offer.minOrderValue} {offer.maxDiscount > 0 && `• Max: ₹${offer.maxDiscount}`}
                                    </p>
                                    <p className="text-[10px] text-[var(--text-muted)]">
                                        Valid: {new Date(offer.validFrom).toLocaleDateString()} - {new Date(offer.validUntil).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-[var(--border-color)]">
                                <button onClick={() => handleToggle(offer)} className="p-2 rounded-lg hover:bg-[var(--bg-elevated)]" title="Toggle Search">
                                    {offer.isActive ? <ToggleRight size={20} className="text-green-400" /> : <ToggleLeft size={20} className="text-[var(--text-muted)]" />}
                                </button>
                                <button onClick={() => openEdit(offer)} className="p-2 rounded-lg hover:bg-[var(--bg-elevated)]"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(offer._id)} className="p-2 rounded-lg hover:bg-red-500/10 text-red-400"><Trash2 size={16} /></button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Modal */}
            <AnimatePresence>
                {showModal && (
                    <>
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50" onClick={closeModal} />
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-4xl z-50 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] overflow-hidden max-h-[90vh] flex flex-col">

                            <div className="p-4 border-b border-[var(--border-color)] flex items-center justify-between bg-[var(--bg-card)]">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    {editing ? <Edit2 size={18} /> : <Plus size={18} />}
                                    {editing ? 'Edit Offer' : 'Create New Offer'}
                                </h2>
                                <button onClick={closeModal} className="p-2 rounded-xl hover:bg-[var(--bg-elevated)]"><X size={20} /></button>
                            </div>

                            <div className="overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column: Form */}
                                <div className="space-y-5">
                                    {!editing && (
                                        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
                                            {PRESETS.map((preset, i) => (
                                                <button key={i} onClick={() => applyPreset(preset)} className="px-3 py-1.5 rounded-full bg-brand-500/10 text-brand-400 text-xs font-medium border border-brand-500/20 hover:bg-brand-500/20 shrink-0 flex items-center gap-1">
                                                    <Sparkles size={12} /> {preset.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Offer Code</label>
                                            <div className="relative">
                                                <Ticket size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                                <input className="input uppercase pl-9 font-mono" value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} placeholder="SAVE20" maxLength={15} />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Discount Type</label>
                                            <select className="input" value={form.discountType} onChange={e => setForm(p => ({ ...p, discountType: e.target.value as 'percentage' | 'flat' }))}>
                                                <option value="percentage">Percentage (%)</option>
                                                <option value="flat">Flat Amount (₹)</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Offer Title</label>
                                        <input className="input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. 20% Off on your first order" />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Description</label>
                                        <textarea className="input min-h-[80px]" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Short description for the customer..." />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Value</label>
                                            <input type="number" className="input" value={form.discountValue} onChange={e => setForm(p => ({ ...p, discountValue: parseFloat(e.target.value) || 0 }))} />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Min Order</label>
                                            <input type="number" className="input" value={form.minOrderValue} onChange={e => setForm(p => ({ ...p, minOrderValue: parseFloat(e.target.value) || 0 }))} />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Max Disc.</label>
                                            <input type="number" className="input" value={form.maxDiscount} onChange={e => setForm(p => ({ ...p, maxDiscount: parseFloat(e.target.value) || 0 }))} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Valid From</label>
                                            <input type="date" className="input" value={form.validFrom} onChange={e => setForm(p => ({ ...p, validFrom: e.target.value }))} />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Valid Until</label>
                                            <input type="date" className="input" value={form.validUntil} onChange={e => setForm(p => ({ ...p, validUntil: e.target.value }))} />
                                        </div>
                                    </div>
                                </div>

                                {/* Right Column: Preview */}
                                <div className="space-y-6">
                                    <div className="bg-[var(--bg-elevated)] rounded-2xl p-6 border border-[var(--border-color)]">
                                        <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Customer Preview</h3>
                                        <div className="flex justify-center">
                                            {/* Preview Card */}
                                            <div className="w-full max-w-sm p-5 rounded-2xl bg-gradient-to-br from-brand-900/50 to-brand-800/20 border border-brand-500/20 flex flex-col items-start gap-3 relative overflow-hidden shadow-xl">
                                                <div className="absolute top-0 right-0 p-3 opacity-10">
                                                    <Ticket size={100} />
                                                </div>
                                                <span className="px-2.5 py-1 rounded-lg bg-brand-500 text-white text-xs font-bold tracking-wider shadow-lg shadow-brand-500/20">
                                                    {form.code || 'CODE'}
                                                </span>
                                                <div>
                                                    <h4 className="font-bold text-xl leading-tight text-white/90">{form.title || 'Offer Title'}</h4>
                                                    <p className="text-xs text-white/60 mt-1">{form.description || 'Offer description will appear here...'}</p>
                                                </div>
                                                <div className="mt-1 flex flex-wrap gap-2">
                                                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 text-white/70 border border-white/10">
                                                        Min Order: ₹{form.minOrderValue}
                                                    </span>
                                                    {form.discountType === 'percentage' && form.maxDiscount > 0 && (
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 text-white/70 border border-white/10">
                                                            Max Discount: ₹{form.maxDiscount}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="mt-2 text-xs font-medium text-brand-400 flex items-center gap-1">
                                                    <Copy size={12} /> Tap to copy code
                                                </div>
                                            </div>
                                        </div>
                                        <p className="text-center text-xs text-[var(--text-muted)] mt-4">
                                            This is how the offer will appear on the customer's menu.
                                        </p>
                                    </div>
                                    <button onClick={handleSave} className="w-full btn-primary py-4 text-base font-semibold shadow-xl shadow-brand-500/10">
                                        {editing ? 'Update Offer' : 'Create Offer'}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
