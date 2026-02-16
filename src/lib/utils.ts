export type ClassValue = string | number | boolean | undefined | null | ClassValue[] | Record<string, boolean | undefined | null>;

function clsx(...args: ClassValue[]): string {
    const classes: string[] = [];

    for (const arg of args) {
        if (!arg) continue;

        if (typeof arg === 'string') {
            classes.push(arg);
        } else if (Array.isArray(arg)) {
            const inner = clsx(...arg);
            if (inner) classes.push(inner);
        } else if (typeof arg === 'object') {
            for (const [key, value] of Object.entries(arg)) {
                if (value) classes.push(key);
            }
        }
    }

    return classes.join(' ');
}

export function cn(...inputs: ClassValue[]) {
    return clsx(...inputs);
}

export function formatPrice(price: number): string {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(price);
}

export function generateOrderNumber(): string {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 5).toUpperCase();
    return `ORD-${timestamp}${random}`;
}

export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        accepted: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        preparing: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
        ready: 'bg-green-500/20 text-green-400 border-green-500/30',
        completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    };
    return colors[status] || colors.pending;
}

export function getTimeAgo(date: Date | string): string {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${Math.floor(diffHours / 24)}d ago`;
}
