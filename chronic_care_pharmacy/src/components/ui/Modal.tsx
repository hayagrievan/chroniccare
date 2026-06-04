'use client';

import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    footer?: React.ReactNode;
    size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-lg' };

export default function Modal({ isOpen, onClose, title, children, footer, size = 'md' }: ModalProps) {
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div
            ref={overlayRef}
            onClick={(e) => { if (e.target === overlayRef.current) onClose(); }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in"
        >
            <div
                className={`w-full ${sizeClasses[size]} mx-4 bg-white rounded-2xl shadow-2xl transform transition-all`}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>
                {/* Body */}
                <div className="px-6 py-5">{children}</div>
                {/* Footer */}
                {footer && (
                    <div className="px-6 py-4 border-t border-gray-100 flex justify-end gap-3">{footer}</div>
                )}
            </div>
        </div>
    );
}
