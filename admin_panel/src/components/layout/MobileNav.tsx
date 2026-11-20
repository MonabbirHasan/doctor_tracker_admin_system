"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Stethoscope,
    Users,
    X,
    LogOut,
    ShieldCheck,
} from "lucide-react";
import "./mobilenav.css";

export interface MobileNavItem {
    label: string;
    href: string;
    description: string;
    icon: React.ReactNode;
}

interface MobileNavProps {
    isOpen: boolean;
    showBottomBar?: boolean;
    onClose: () => void;
    onLogout?: () => void;
}

const NAV_ITEMS: MobileNavItem[] = [
    {
        label: "Dashboard",
        href: "/dashboard",
        description: "Analytics & caseload overview",
        icon: <LayoutDashboard className="mobilenav_itemicon_svg w-5 h-5" />,
    },
    {
        label: "Doctors",
        href: "/doctors",
        description: "Specialists & doctor patients",
        icon: <Stethoscope className="mobilenav_itemicon_svg w-5 h-5" />,
    },
    {
        label: "Patients",
        href: "/patients",
        description: "Full patient directory & filters",
        icon: <Users className="mobilenav_itemicon_svg w-5 h-5" />,
    },
];

const MobileNav: React.FC<MobileNavProps> = ({
    isOpen,
    showBottomBar = false,
    onClose,
    onLogout,
}) => {
    const pathname = usePathname() || "/";
    const router = useRouter();

    useEffect(() => {
        if (!isOpen) return;
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                onClose();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isOpen, onClose]);

    const isRouteActive = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/" || pathname === "/dashboard";
        }
        return pathname === href || pathname.startsWith(`${href}/`);
    };

    const handleLogout = () => {
        onClose();
        if (onLogout) {
            onLogout();
        } else {
            router.push("/login");
        }
    };

    return (
        <>
            {/* Slide-Over Mobile Navigation Drawer */}
            {isOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label="Mobile Navigation Menu"
                    onClick={(e) => {
                        if (e.target === e.currentTarget) {
                            onClose();
                        }
                    }}
                    className="mobilenav_backdrop_div fixed inset-0 z-50 lg:hidden flex"
                >
                    <aside className="mobilenav_drawer_aside w-80 max-w-[85vw] h-full flex flex-col justify-between p-5">
                        {/* Top Brand & Close */}
                        <div className="mobilenav_topsection_div space-y-6">
                            <div className="mobilenav_header_div flex items-center justify-between gap-2 pb-4 border-b border-slate-100">
                                <Link
                                    href="/dashboard"
                                    onClick={onClose}
                                    className="mobilenav_brandlink_a flex items-center gap-3"
                                >
                                    <div className="mobilenav_logo_div w-10 h-10 flex items-center justify-center shadow-sm shrink-0">
                                        <Stethoscope className="mobilenav_logosvg_svg w-5 h-5" />
                                    </div>
                                    <div className="mobilenav_brandtext_div">
                                        <span className="mobilenav_brandtitle_span text-base font-bold tracking-tight text-slate-900 block">
                                            Doctor Tracker
                                        </span>
                                        <span className="mobilenav_brandsub_span text-[11px] font-medium text-slate-500 block">
                                            Admin Workspace
                                        </span>
                                    </div>
                                </Link>

                                <button
                                    type="button"
                                    onClick={onClose}
                                    aria-label="Close mobile menu"
                                    className="mobilenav_closebtn_button p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                                >
                                    <X className="mobilenav_closesvg_svg w-5 h-5" />
                                </button>
                            </div>

                            {/* Navigation Links */}
                            <nav
                                aria-label="Mobile primary links"
                                className="mobilenav_nav_nav space-y-1.5"
                            >
                                <p className="mobilenav_navlabel_p px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                                    Navigation
                                </p>

                                {NAV_ITEMS.map((item) => {
                                    const active = isRouteActive(item.href);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={onClose}
                                            aria-current={active ? "page" : undefined}
                                            className={`mobilenav_link_a flex items-center gap-3 px-3.5 py-2.5 ${active ? "mobilenav_link_active_a" : ""
                                                }`}
                                        >
                                            <span className="mobilenav_iconwrap_span shrink-0">
                                                {item.icon}
                                            </span>
                                            <span className="mobilenav_linktexts_span min-w-0">
                                                <span className="mobilenav_linktitle_span text-sm block leading-snug">
                                                    {item.label}
                                                </span>
                                                <span className="mobilenav_linkdesc_span text-[11px] text-slate-400 block truncate">
                                                    {item.description}
                                                </span>
                                            </span>
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Bottom Security Info & Logout */}
                        <div className="mobilenav_footer_div space-y-3 pt-4 border-t border-slate-100">
                            <div className="mobilenav_quickcard_div p-3 flex items-center gap-2.5 text-xs">
                                <ShieldCheck className="mobilenav_shieldsvg_svg w-4 h-4 text-emerald-600 shrink-0" />
                                <span className="mobilenav_shieldtext_span text-slate-600 font-medium">
                                    Protected Admin Session
                                </span>
                            </div>

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="mobilenav_logoutbtn_button w-full py-2.5 px-4 text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
                            >
                                <LogOut className="mobilenav_logoutsvg_svg w-4 h-4" />
                                <span className="mobilenav_logouttext_span">Sign Out</span>
                            </button>
                        </div>
                    </aside>
                </div>
            )}

            {/* Optional Compact Bottom Navigation Bar for Mobile */}
            {showBottomBar && (
                <nav
                    aria-label="Mobile quick navigation"
                    className="mobilenav_bottombar_nav lg:hidden fixed bottom-0 inset-x-0 z-30 h-16 px-3 grid grid-cols-3 items-center gap-1"
                >
                    {NAV_ITEMS.map((item) => {
                        const active = isRouteActive(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                className={`mobilenav_bottomitem_a flex flex-col items-center justify-center py-1.5 text-[11px] font-medium gap-0.5 ${active ? "mobilenav_bottomitem_active_a" : ""
                                    }`}
                            >
                                {item.icon}
                                <span className="mobilenav_bottomlabel_span">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            )}
        </>
    );
};

export default MobileNav;