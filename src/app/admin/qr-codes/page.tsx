'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Download, QrCode } from 'lucide-react';
import toast from 'react-hot-toast';

interface Table {
    _id: string;
    number: number;
    label: string;
    isActive: boolean;
    qrCode: string;
}

export default function QRCodesPage() {
    const [tables, setTables] = useState<Table[]>([]);
    const [loading, setLoading] = useState(true);
    const [newNumber, setNewNumber] = useState('');
    const [newLabel, setNewLabel] = useState('');

    useEffect(() => { fetchTables(); }, []);

    const getToken = () => localStorage.getItem('token') || '';

    const fetchTables = async () => {
        try {
            const res = await fetch('/api/tables', { headers: { Authorization: `Bearer ${getToken()}` } });
            const data = await res.json();
            setTables(data.tables || []);
        } catch { } finally { setLoading(false); }
    };

    const handleCreate = async () => {
        if (!newNumber || !newLabel) { toast.error('Table number and label are required'); return; }
        try {
            const res = await fetch('/api/tables', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify({ number: parseInt(newNumber), label: newLabel }),
            });
            if (res.ok) {
                toast.success('Table created!');
                setNewNumber(''); setNewLabel('');
                fetchTables();
            } else {
                const data = await res.json();
                toast.error(data.error || 'Failed to create table');
            }
        } catch { toast.error('Error'); }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this table?')) return;
        try {
            await fetch(`/api/tables/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${getToken()}` } });
            toast.success('Deleted'); fetchTables();
        } catch { }
    };

    const downloadQR = (table: Table) => {
        const link = document.createElement('a');
        link.download = `table-${table.number}-qr.png`;
        link.href = table.qrCode;
        link.click();
    };

    return (
        <div>
            <div className="mb-6">
                <h1 className="text-2xl font-bold">QR Code Generator</h1>
                <p className="text-[var(--text-muted)] mt-1">Generate QR codes for restaurant tables</p>
            </div>

            {/* Create Table */}
            <div className="card p-5 mb-8">
                <h3 className="font-semibold mb-4">Add New Table</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input className="input sm:w-32" type="number" value={newNumber} onChange={e => setNewNumber(e.target.value)} placeholder="Table #" />
                    <input className="input flex-1" value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Label (e.g., VIP Booth 1)" />
                    <button onClick={handleCreate} className="btn-primary flex items-center gap-2 shrink-0">
                        <Plus size={18} /> Generate QR
                    </button>
                </div>
            </div>

            {/* Tables Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="card p-5"><div className="skeleton h-52" /></div>)}
                </div>
            ) : tables.length === 0 ? (
                <div className="text-center py-20">
                    <QrCode size={48} className="text-[var(--text-muted)] mx-auto mb-4" />
                    <p className="text-[var(--text-secondary)] font-medium">No tables created yet</p>
                    <p className="text-sm text-[var(--text-muted)] mt-1">Add a table above to generate its QR code</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {tables.map((table, i) => (
                        <motion.div key={table._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="card p-5 text-center">
                            <div className="w-full aspect-square max-w-[200px] mx-auto mb-4 bg-white rounded-2xl p-3 flex items-center justify-center">
                                {table.qrCode ? (
                                    <img src={table.qrCode} alt={`QR for ${table.label}`} className="w-full h-full object-contain" />
                                ) : (
                                    <QrCode size={64} className="text-gray-400" />
                                )}
                            </div>
                            <h3 className="font-bold text-lg">Table {table.number}</h3>
                            <p className="text-sm text-[var(--text-muted)]">{table.label}</p>
                            <p className="text-xs text-[var(--text-muted)] mt-1 font-mono">
                                /table/{table.number}
                            </p>
                            <div className="flex items-center gap-2 mt-4">
                                <button onClick={() => downloadQR(table)} className="flex-1 btn-secondary flex items-center justify-center gap-1.5 text-sm py-2">
                                    <Download size={14} /> Download
                                </button>
                                <button onClick={() => handleDelete(table._id)} className="p-2.5 rounded-xl hover:bg-red-500/10 text-red-400 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
