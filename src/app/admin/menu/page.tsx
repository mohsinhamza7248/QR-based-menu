'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Upload, ToggleLeft, ToggleRight } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
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

const emptyItem = { name: '', description: '', price: 0, image: '', category: 'veg', isAvailable: true, preparationTime: 15, tags: [] as string[] };

export default function MenuManagement() {
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [formData, setFormData] = useState(emptyItem);
    const [tagInput, setTagInput] = useState('');
    const [uploading, setUploading] = useState(false);
    const [filter, setFilter] = useState('all');

    useEffect(() => { fetchItems(); }, []);

    const getToken = () => localStorage.getItem('token') || '';

    const fetchItems = async () => {
        try {
            const res = await fetch('/api/menu');
            const data = await res.json();
            setItems(data.items || []);
        } catch { toast.error('Failed to load menu'); }
        finally { setLoading(false); }
    };

    const handleSave = async () => {
        if (!formData.name || !formData.price) { toast.error('Name and price are required'); return; }
        try {
            const url = editingItem ? `/api/menu/${editingItem._id}` : '/api/menu';
            const method = editingItem ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                toast.success(editingItem ? 'Item updated!' : 'Item created!');
                fetchItems();
                closeModal();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to save');
            }
        } catch { toast.error('Something went wrong'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this item?')) return;
        try {
            const res = await fetch(`/api/menu/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${getToken()}` },
            });
            if (res.ok) { toast.success('Item deleted'); fetchItems(); }
        } catch { toast.error('Failed to delete'); }
    };

    const handleToggle = async (item: MenuItem) => {
        try {
            await fetch(`/api/menu/${item._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify({ isAvailable: !item.isAvailable }),
            });
            fetchItems();
        } catch { toast.error('Failed to update'); }
    };

    const handleUpload = async (file: File) => {
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await fetch('/api/upload', { method: 'POST', body: fd });
            const data = await res.json();
            if (res.ok) { setFormData(prev => ({ ...prev, image: data.url })); toast.success('Uploaded!'); }
        } catch { toast.error('Upload failed'); }
        finally { setUploading(false); }
    };

    const openEdit = (item: MenuItem) => {
        setEditingItem(item);
        setFormData({ name: item.name, description: item.description, price: item.price, image: item.image, category: item.category, isAvailable: item.isAvailable, preparationTime: item.preparationTime, tags: item.tags || [] });
        setShowModal(true);
    };

    const closeModal = () => { setShowModal(false); setEditingItem(null); setFormData(emptyItem); setTagInput(''); };

    const addTag = () => {
        if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
            setFormData(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
            setTagInput('');
        }
    };

    const filtered = filter === 'all' ? items : items.filter(i => i.category === filter);

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold">Menu Management</h1>
                    <p className="text-[var(--text-muted)] mt-1">{items.length} items total</p>
                </div>
                <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
                    <Plus size={18} /> Add Item
                </button>
            </div>

            {/* Filter */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-4">
                {['all', 'veg', 'non-veg', 'drinks', 'combos', 'desserts'].map(cat => (
                    <button key={cat} onClick={() => setFilter(cat)}
                        className={`category-pill shrink-0 capitalize ${filter === cat ? 'active' : ''}`}>
                        {cat}
                    </button>
                ))}
            </div>

            {/* Items */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => <div key={i} className="card p-4"><div className="skeleton h-40" /></div>)}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((item, i) => (
                        <motion.div key={item._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card overflow-hidden">
                            <div className="h-40 bg-[var(--bg-elevated)] relative">
                                {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> :
                                    <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>}
                                <div className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold ${item.isAvailable ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                    {item.isAvailable ? 'Available' : 'Unavailable'}
                                </div>
                            </div>
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-semibold">{item.name}</h3>
                                        <p className="text-xs text-[var(--text-muted)] capitalize">{item.category} · {item.preparationTime} min</p>
                                    </div>
                                    <span className="font-bold text-brand-400">{formatPrice(item.price)}</span>
                                </div>
                                <p className="text-sm text-[var(--text-muted)] mt-2 line-clamp-2">{item.description}</p>
                                {item.tags?.length > 0 && (
                                    <div className="flex gap-1 mt-2 flex-wrap">
                                        {item.tags.map(tag => <span key={tag} className="text-[0.625rem] px-1.5 py-0.5 rounded-full bg-brand-500/10 text-brand-400">{tag}</span>)}
                                    </div>
                                )}
                                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--border-color)]">
                                    <button onClick={() => handleToggle(item)} className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors" title="Toggle availability">
                                        {item.isAvailable ? <ToggleRight size={20} className="text-green-400" /> : <ToggleLeft size={20} className="text-[var(--text-muted)]" />}
                                    </button>
                                    <button onClick={() => openEdit(item)} className="p-2 rounded-lg hover:bg-[var(--bg-elevated)] transition-colors"><Edit2 size={16} /></button>
                                    <button onClick={() => handleDelete(item._id)} className="p-2 rounded-lg hover:bg-red-500/10 transition-colors text-red-400"><Trash2 size={16} /></button>
                                </div>
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
                        <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="fixed inset-4 sm:inset-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-full sm:max-w-lg z-50 bg-[var(--bg-secondary)] rounded-2xl border border-[var(--border-color)] overflow-y-auto max-h-[90vh]">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-bold">{editingItem ? 'Edit Item' : 'Add New Item'}</h2>
                                    <button onClick={closeModal} className="p-2 rounded-xl hover:bg-[var(--bg-elevated)]"><X size={20} /></button>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Name</label>
                                        <input className="input" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))} placeholder="Dish name" />
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Description</label>
                                        <textarea className="input min-h-[80px] resize-none" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} placeholder="Short description" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Price (₹)</label>
                                            <input type="number" className="input" value={formData.price} onChange={e => setFormData(p => ({ ...p, price: parseFloat(e.target.value) || 0 }))} />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Prep Time (min)</label>
                                            <input type="number" className="input" value={formData.preparationTime} onChange={e => setFormData(p => ({ ...p, preparationTime: parseInt(e.target.value) || 0 }))} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Category</label>
                                        <select className="input" value={formData.category} onChange={e => setFormData(p => ({ ...p, category: e.target.value }))}>
                                            <option value="veg">Veg</option>
                                            <option value="non-veg">Non-Veg</option>
                                            <option value="drinks">Drinks</option>
                                            <option value="combos">Combos</option>
                                            <option value="desserts">Desserts</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Image</label>
                                        <div className="flex gap-2">
                                            <input className="input flex-1" value={formData.image} onChange={e => setFormData(p => ({ ...p, image: e.target.value }))} placeholder="Image URL or upload" />
                                            <label className="btn-secondary flex items-center gap-1.5 cursor-pointer shrink-0">
                                                <Upload size={14} />{uploading ? '...' : 'Upload'}
                                                <input type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-[var(--text-secondary)] mb-1.5 block">Tags</label>
                                        <div className="flex gap-2">
                                            <input className="input flex-1" value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add tag" onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())} />
                                            <button onClick={addTag} className="btn-secondary shrink-0">Add</button>
                                        </div>
                                        {formData.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {formData.tags.map(tag => (
                                                    <span key={tag} className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full bg-brand-500/10 text-brand-400">
                                                        {tag}
                                                        <button onClick={() => setFormData(p => ({ ...p, tags: p.tags.filter(t => t !== tag) }))} className="hover:text-red-400"><X size={12} /></button>
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={handleSave} className="w-full btn-primary py-3 mt-4">
                                        {editingItem ? 'Update Item' : 'Create Item'}
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
