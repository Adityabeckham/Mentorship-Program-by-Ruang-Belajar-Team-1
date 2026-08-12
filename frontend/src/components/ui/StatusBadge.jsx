/**
 * StatusBadge — Design System Component (Prototype Style)
 */
const statusConfig = {
  published: {
    label: 'Published',
    className: 'bg-[#e2f3e8] text-[var(--color-ok-green)] border border-[#86efac]',
    dot: 'bg-green-500',
  },
  pending_verification: {
    label: 'Pending',
    className: 'bg-[#fef3c7] text-[#92400e] border border-[#f59e0b]',
    dot: 'bg-yellow-500',
  },
  rejected: {
    label: 'Rejected',
    className: 'bg-[#fee2e2] text-[#991b1b] border border-[#f87171]',
    dot: 'bg-red-500',
  },
  draft: {
    label: 'Draft',
    className: 'bg-[#e5e7eb] text-[#4b5563] border border-[#9ca3af]',
    dot: 'bg-gray-500',
  },
};

const StatusBadge = ({ status, size = 'md' }) => {
  const config = statusConfig[status] || statusConfig.draft;
  const sizeClass = size === 'sm'
    ? 'text-[10px] px-2 py-0.5'
    : 'text-[11px] px-2.5 py-1';

  return (
    <span className={`inline-flex items-center gap-1.5 font-bold rounded-[12px] font-work ${sizeClass} ${config.className}`}>
      {config.label}
    </span>
  );
};

export default StatusBadge;
