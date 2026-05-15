import { X } from 'lucide-react';
import { ReactNode } from 'react';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  iconBgClass?: string;
  iconColorClass?: string;
};

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
};

export function Modal({
  isOpen,
  onClose,
  title,
  icon,
  children,
  maxWidth = 'md',
  iconBgClass = 'bg-blue-100',
  iconColorClass = 'text-blue-600',
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className={`bg-white rounded-xl shadow-2xl ${maxWidthClasses[maxWidth]} w-full max-h-[85vh] overflow-hidden flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-[#1e3a5f] to-[#2d4a6b] text-white px-6 py-4 flex items-center justify-between shrink-0">
          <h2 className="text-lg font-bold flex items-center gap-2">
            {icon && (
              <span className={`p-1.5 rounded-lg ${iconBgClass} ${iconColorClass} bg-opacity-20`}>
                {icon}
              </span>
            )}
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

export default Modal;
