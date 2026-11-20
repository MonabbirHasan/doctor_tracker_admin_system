"use client";

import React, { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import {
    Menu,
    PanelLeftClose,
    PanelLeftOpen,
    ShieldCheck,
    LogOut,
    ChevronRight,
    Stethoscope,
} from "lucide-react";
import "./header.css";
import { useAuthStore } from "@/store/useAuthStore";

export interface HeaderAdminProfile {
    name: string;
    email: string;
    role?: string;
}

interface HeaderProps {
    admin?: HeaderAdminProfile;
    isMobileMenuOpen?: boolean;
    isSidebarCollapsed?: boolean;
    onToggleMobileMenu?: () => void;
    onToggleSidebarCollapse?: () => void;
    onLogout?: () => void;
}

const ROUTE_META: Array<{
    match: (pathname: string) => boolean;
    title: string;
    breadcrumb: string;
}> = [
    {
        match: (p) => p === "/" || p.startsWith("/dashboard"),
        title: "Admin Dashboard",
        breadcrumb: "Analytics & Overview",
    },
    {
        match: (p) => p.startsWith("/doctors"),
        title: "Doctors Directory",
        breadcrumb: "Doctor Management",
    },
    {
        match: (p) => p.startsWith("/patients"),
        title: "Patients Management",
        breadcrumb: "Patient Registry",
    },
];

const DEFAULT_ADMIN: HeaderAdminProfile = {
    name: "Monabbir Hasan",
    email: "contact@alhalalinnovation.com",
    role: "Administrator",
};

const Header: React.FC<HeaderProps> = ({
    admin,
    isMobileMenuOpen = false,
    isSidebarCollapsed = false,
    onToggleMobileMenu,
    onToggleSidebarCollapse,
    onLogout,
}) => {
    const pathname = usePathname() || "/";
    const router = useRouter();
    const storeUser = useAuthStore((state) => state.user);
    const clearAuthSession = useAuthStore((state) => state.clearAuthSession);

    const activeAdmin = useMemo<HeaderAdminProfile>(() => {
        if (admin) return admin;
        if (storeUser?.name || storeUser?.email) {
            return {
                name: storeUser.name || DEFAULT_ADMIN.name,
                email: storeUser.email || DEFAULT_ADMIN.email,
                role: storeUser.role || DEFAULT_ADMIN.role,
            };
        }
        return DEFAULT_ADMIN;
    }, [admin, storeUser]);

    const currentMeta = ROUTE_META.find((item) => item.match(pathname)) ?? {
        title: "Doctor Tracker",
        breadcrumb: "Clinical Portal",
    };

    const initials = activeAdmin.name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0]?.toUpperCase())
        .join("");

    const handleLogoutClick = () => {
        if (onLogout) {
            onLogout();
            return;
        }
        clearAuthSession();
        toast.success("Signed out successfully");
        router.replace("/login");
    };

    return (
        <header className="header_bar_header h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4">
            {/* Left: Mobile Drawer Button + Desktop Collapse + Page Context */}
            <div className="header_left_div flex items-center gap-3 min-w-0">
                {onToggleMobileMenu && (
                    <button
                        type="button"
                        onClick={onToggleMobileMenu}
                        aria-label={
                            isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"
                        }
                        aria-expanded={isMobileMenuOpen}
                        className="header_iconbtn_button lg:hidden p-2 cursor-pointer shrink-0"
                    >
                        <Menu className="header_menusvg_svg w-5 h-5" />
                    </button>
                )}

                {onToggleSidebarCollapse && (
                    <button
                        type="button"
                        onClick={onToggleSidebarCollapse}
                        aria-label={
                            isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
                        }
                        title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        className="header_iconbtn_button hidden lg:inline-flex items-center justify-center p-2 cursor-pointer shrink-0"
                    >
                        {isSidebarCollapsed ? (
                            <PanelLeftOpen className="header_collapsesvg_svg w-4 h-4" />
                        ) : (
                            <PanelLeftClose className="header_collapsesvg_svg w-4 h-4" />
                        )}
                    </button>
                )}

                {/* Brand Pill on Compact Viewports + Route Breadcrumb */}
                <div className="header_context_div min-w-0">
                    <div className="header_breadcrumb_div flex items-center gap-1.5 text-[11px] font-medium text-slate-400">
                        <span className="header_brandchip_span inline-flex items-center gap-1 text-blue-600 font-semibold">
                            <Stethoscope className="header_brandicon_svg w-3.5 h-3.5" />
                            <span>Doctor Tracker</span>
                        </span>
                        <span className="header_orgtag_span hidden md:inline text-slate-400">
                            • Al Halal Innovation
                        </span>
                        <ChevronRight className="header_chevronsvg_svg w-3 h-3 shrink-0" />
                        <span className="header_crumbtext_span truncate">
                            {currentMeta.breadcrumb}
                        </span>
                    </div>
                    <h1 className="header_pagetitle_h1 text-base sm:text-lg font-bold tracking-tight text-slate-900 truncate">
                        {currentMeta.title}
                    </h1>
                </div>
            </div>

            {/* Right: Auth Status + Admin Profile + Sign Out */}
            <div className="header_right_div flex items-center gap-2.5 sm:gap-3 shrink-0">
                {/* Session Pill */}
                <div className="header_session_div hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-xs font-semibold text-emerald-700">
                    <span className="header_statusdot_span w-2 h-2 rounded-full inline-block" />
                    <ShieldCheck className="header_shieldsvg_svg w-3.5 h-3.5" />
                    <span className="header_sessiontext_span">Authenticated</span>
                </div>

                {/* Admin Identity Card */}
                <div
                    title={activeAdmin.email}
                    className="header_profilecard_div px-2.5 py-1.5 flex items-center gap-2.5"
                >
                    <div className="header_avatar_div w-8 h-8 flex items-center justify-center text-xs font-bold shrink-0">
                        {initials || "MH"}
                    </div>
                    <div className="header_admininfo_div hidden sm:block text-left leading-tight">
                        <p className="header_adminname_p text-xs font-bold text-slate-900">
                            {activeAdmin.name}
                        </p>
                        <p className="header_adminrole_p text-[11px] text-slate-500">
                            {activeAdmin.role ?? "Administrator"}
                        </p>
                    </div>
                </div>

                {/* Logout Action */}
                <button
                    type="button"
                    onClick={handleLogoutClick}
                    title="Sign out"
                    className="header_logoutbtn_button inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold cursor-pointer"
                >
                    <LogOut className="header_logoutsvg_svg w-4 h-4" />
                    <span className="header_logouttext_span hidden sm:inline">
                        Logout
                    </span>
                </button>
            </div>
        </header>
    );
};

export default Header;