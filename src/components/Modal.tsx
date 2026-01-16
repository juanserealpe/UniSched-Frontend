/**
 * Generic Modal component.
 * Provides a reusable modal overlay with header, body, and footer sections.
 */
import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
}

/**
 * Reusable Modal dialog component.
 * @param isOpen - Controls visibility
 * @param onClose - Handler called when closing the modal
 * @param title - Modal title
 * @param children - Modal content
 * @param footer - Optional footer content
 */
export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, footer }) => {
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity z-40" onClick={onClose} />
            <div className="fixed inset-0 z-50 overflow-y-auto pointer-events-none">
                <div className="flex min-h-full items-center justify-center p-4 text-center">
                    <div className="w-full max-w-lg transform overflow-hidden rounded-3xl bg-white text-left align-middle shadow-2xl transition-all pointer-events-auto border border-slate-100">
                        {/* Header */}
                        <div className="px-6 py-5 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-slate-800 leading-tight">
                                {title}
                            </h3>
                            <button
                                onClick={onClose}
                                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto custom-scrollbar text-slate-600">
                            {children}
                        </div>

                        {/* Footer */}
                        {footer && (
                            <div className="px-6 py-5 bg-slate-50/80 border-t border-slate-100 flex items-center justify-end gap-3">
                                {footer}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};
