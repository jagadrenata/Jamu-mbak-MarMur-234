'use client';

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-8 flex items-start justify-between">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="text-gray-600 mt-1">{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-cream-100 rounded shadow-sm p-6 ${className}`}>
      {children}
    </div>
  );
}

export function Badge({ children, variant = 'default' }) {
  const variants = {
    default: 'bg-cream-200 text-gray-700',
    success: 'bg-green-100 text-green-700',
    warning: 'bg-yellow-100 text-yellow-700',
    danger: 'bg-red-100 text-red-700',
    info: 'bg-blue-100 text-blue-700',
  };
  return (
    <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${variants[variant]}`}>
      {children}
    </span>
  );
}

export function Button({ children, onClick, variant = 'primary', size = 'md', disabled = false, className = '' }) {
  const variants = {
    primary: 'bg-cream-700 text-white hover:bg-cream-800',
    secondary: 'bg-cream-200 text-gray-800 hover:bg-cream-300',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'bg-transparent text-gray-700 hover:bg-cream-100',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </button>
  );
}

export function Input({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <input
        className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cream-500 bg-white"
        {...props}
      />
    </div>
  );
}

export function Select({ label, children, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <select
        className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cream-500 bg-white"
        {...props}
      >
        {children}
      </select>
    </div>
  );
}

export function Textarea({ label, ...props }) {
  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
      <textarea
        className="w-full px-3 py-2 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-cream-500 bg-white"
        rows={3}
        {...props}
      />
    </div>
  );
}

export function Table({ headers, children, emptyMessage = 'Tidak ada data' }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-cream-200">
            {headers.map((h, i) => (
              <th key={i} className="text-left py-3 px-4 font-semibold text-gray-600">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Tr({ children, onClick }) {
  return (
    <tr
      onClick={onClick}
      className={`border-b border-cream-50 ${onClick ? 'cursor-pointer hover:bg-cream-50' : 'hover:bg-cream-50'} transition-colors`}
    >
      {children}
    </tr>
  );
}

export function Td({ children, className = '' }) {
  return <td className={`py-3 px-4 text-gray-700 ${className}`}>{children}</td>;
}

export function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded shadow-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl leading-none">&times;</button>
        </div>
        <div className="p-5">{children}</div>
        {footer && <div className="flex justify-end gap-3 px-5 pb-5">{footer}</div>}
      </div>
    </div>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-16">
      <div className="w-8 h-8 border-4 border-cream-200 border-t-cream-700 rounded-full animate-spin" />
    </div>
  );
}

export function Pagination({ limit, offset, total, onChange }) {
  const page = Math.floor(offset / limit);
  const totalPages = Math.ceil(total / limit);
  return (
    <div className="flex items-center justify-between mt-4 text-sm text-gray-600">
      <span>Menampilkan {Math.min(offset + 1, total)}–{Math.min(offset + limit, total)} dari {total}</span>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" disabled={page === 0} onClick={() => onChange((page - 1) * limit)}>← Prev</Button>
        <Button variant="secondary" size="sm" disabled={page >= totalPages - 1} onClick={() => onChange((page + 1) * limit)}>Next →</Button>
      </div>
    </div>
  );
}

export function statusBadge(status) {
  const map = {
    pending: ['Menunggu Pembayaran', 'warning'],
    paid: ['Dibayar', 'success'],
    processing: ['Diproses', 'info'],
    shipping: ['Dikirim', 'info'],
    completed: ['Selesai', 'success'],
    cancelled: ['Dibatalkan', 'danger'],
    archived: ['Diarsipkan', 'default'],
    active: ['Aktif', 'success'],
  };
  const [label, variant] = map[status] || [status, 'default'];
  return <Badge variant={variant}>{label}</Badge>;
}
