'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    ClipboardList,
    Search,
    LogOut,
    Menu,
    X,
    Pill,
    ChevronRight,
    Activity,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const navItems = [
    { label: 'Dashboard', href: '/pharmacy/dashboard', icon: LayoutDashboard },
    { label: 'Pending Prescriptions', href: '/pharmacy/prescriptions', icon: ClipboardList },
    { label: 'Search Patient', href: '/pharmacy/search', icon: Search },
    { label: 'Adherence Intelligence', href: '/pharmacy/adherence', icon: Activity },
];

export default function PharmacySidebar() {
    const pathname = usePathname();
    const { user, logout } = useAuth();
    const [collapsed, setCollapsed] = useState(false);

    return (
        <>
            {/* Sidebar */}
            <aside
                className={`
          fixed left-0 top-0 h-full bg-white border-r border-gray-100 shadow-sm z-40
          transition-all duration-300 ease-in-out flex flex-col
          ${collapsed ? 'w-16' : 'w-64'}
        `}
            >
                {/* Logo */}
                <div className={`flex items-center gap-3 px-4 py-5 border-b border-gray-100 ${collapsed ? 'justify-center' : ''}`}>
                    <div className="flex-shrink-0 w-9 h-9 bg-medical-blue rounded-xl flex items-center justify-center shadow-sm">
                        <Pill size={18} className="text-white" />
                    </div>
                    {!collapsed && (
                        <div>
                            <p className="text-sm font-bold text-gray-900 leading-tight">CCMS</p>
                            <p className="text-xs text-medical-blue font-medium">Pharmacy Portal</p>
                        </div>
                    )}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className={`ml-auto p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 ${collapsed ? 'hidden' : ''}`}
                    >
                        <Menu size={16} />
                    </button>
                    {collapsed && (
                        <button
                            onClick={() => setCollapsed(false)}
                            className="absolute -right-3 top-6 bg-white border border-gray-200 rounded-full p-1 shadow-sm"
                        >
                            <ChevronRight size={12} className="text-gray-500" />
                        </button>
                    )}
                </div>

                {/* Nav */}
                <nav className="flex-1 py-4 px-2 space-y-1">
                    {navItems.map(({ label, href, icon: Icon }) => {
                        const isActive = pathname === href || pathname.startsWith(href + '/');
                        return (
                            <Link
                                key={href}
                                href={href}
                                title={collapsed ? label : undefined}
                                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 group relative
                  ${isActive
                                        ? 'bg-blue-50 text-medical-blue'
                                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                  ${collapsed ? 'justify-center' : ''}
                `}
                            >
                                <Icon size={18} className={`flex-shrink-0 ${isActive ? 'text-medical-blue' : 'text-gray-400 group-hover:text-gray-600'}`} />
                                {!collapsed && <span>{label}</span>}
                                {isActive && !collapsed && (
                                    <span className="ml-auto w-1.5 h-1.5 bg-medical-blue rounded-full" />
                                )}
                                {/* Tooltip when collapsed */}
                                {collapsed && (
                                    <div className="absolute left-full ml-2 px-2.5 py-1.5 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50">
                                        {label}
                                    </div>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* User + Logout */}
                <div className={`px-3 py-4 border-t border-gray-100 ${collapsed ? 'flex justify-center' : ''}`}>
                    {!collapsed && (
                        <div className="flex items-center gap-3 px-3 py-2 mb-2 rounded-lg bg-gray-50">
                            <div className="w-8 h-8 rounded-full bg-medical-blue text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                                {user?.name?.charAt(0) ?? 'P'}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={logout}
                        title="Logout"
                        className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full ${collapsed ? 'justify-center' : ''}`}
                    >
                        <LogOut size={18} />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>
        </>
    );
}
