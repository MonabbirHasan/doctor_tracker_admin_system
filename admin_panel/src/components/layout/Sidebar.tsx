"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Stethoscope,
    Users,
    ChevronLeft,
    ChevronRight,
    ShieldCheck,
} from "lucide-react";
import "./sidebar.css";

export interface SidebarNavItem {
    id: string;
    label: string;
    href: string;
    badge?: string | number;
    icon: React.ReactNode;
}

interface SidebarProps {
    isCollapsed?: boolean;
    doctorCount?: number;
    patientCount?: number;
    onToggleCollapse?: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
    isCollapsed = false,
    doctorCount,
    patientCount,
    onToggleCollapse,
}) => {
    const pathname = usePathname() || "/";

    const navItems: SidebarNavItem[] = [
        {
            id: "dashboard",
            label: "Dashboard",
            href: "/dashboard",
            icon: <LayoutDashboard className="sidebar_navicon_svg w-5 h-5" />,
        },
        {
            id: "doctors",
            label: "Doctors",
            href: "/doctors",
            badge: typeof doctorCount === "number" ? doctorCount : undefined,
            icon: <Stethoscope className="sidebar_navicon_svg w-5 h-5" />,
        },
        {
            id: "patients",
            label: "Patients",
            href: "/patients",
            badge: typeof patientCount === "number" ? patientCount : undefined,
            icon: <Users className="sidebar_navicon_svg w-5 h-5" />,
        },
    ];

    const isActiveRoute = (href: string) => {
        if (href === "/dashboard") {
            return pathname === "/" || pathname === "/dashboard";
        }
        return pathname === href || pathname.startsWith(`${href}/`);
    };
//=========================
// RENDER MAIN ELEMENT
//=========================
    return (
        <aside
            aria-label="Primary Sidebar Navigation"
            className={`sidebar_panel_aside hidden lg:flex flex-col justify-between min-h-screen sticky top-0 select-none ${isCollapsed ? "w-20" : "w-64"
                }`}
        >
            {/* Top Section: Brand + Links */}
            <div className="sidebar_top_div flex flex-col">
                {/* Brand Header */}
                <div
                    className={`sidebar_brand_div h-16 flex items-center ${isCollapsed ? "justify-center px-3" : "justify-between px-5"
                        }`}
                >
                    <Link
                        href="/dashboard"
                        className="sidebar_brandlink_a flex items-center gap-3 min-w-0"
                    >
                        <div className="sidebar_logo_div w-10 h-10 flex items-center justify-center shadow-sm shrink-0">
                            <Stethoscope className="sidebar_logosvg_svg w-5 h-5" />
                        </div>

                        {!isCollapsed && (
                            <div className="sidebar_brandtext_div min-w-0">
                                <span className="sidebar_brandtitle_span text-base font-bold tracking-tight text-slate-900 block truncate">
                                    Doctor Tracker
                                </span>
                                <span className="sidebar_brandsub_span text-[11px] font-medium text-slate-500 block truncate">
                                    Clinical Operations
                                </span>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation Menu */}
                <nav
                    aria-label="Main Menu"
                    className={`sidebar_nav_nav p-3 space-y-1.5 ${isCollapsed ? "flex flex-col items-center" : ""
                        }`}
                >
                    {!isCollapsed && (
                        <p className="sidebar_sectionlabel_p px-3 pt-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                            Workspace
                        </p>
                    )}

                    {navItems.map((item) => {
                        const active = isActiveRoute(item.href);
                        return (
                            <Link
                                key={item.id}
                                href={item.href}
                                aria-current={active ? "page" : undefined}
                                title={isCollapsed ? item.label : undefined}
                                className={`sidebar_link_a flex items-center ${isCollapsed
                                        ? "justify-center w-11 h-11"
                                        : "justify-between px-3.5 py-2.5"
                                    } ${active ? "sidebar_link_active_a" : ""}`}
                            >
                                <span className="sidebar_linkleft_span flex items-center gap-3 min-w-0">
                                    <span className="sidebar_iconwrap_span shrink-0">
                                        {item.icon}
                                    </span>
                                    {!isCollapsed && (
                                        <span className="sidebar_linklabel_span text-sm truncate">
                                            {item.label}
                                        </span>
                                    )}
                                </span>

                                {!isCollapsed && typeof item.badge === "number" && (
                                    <span className="sidebar_badge_span px-2 py-0.5 text-[11px] font-bold rounded-full bg-slate-100 text-slate-700 tabular-nums">
                                        {item.badge.toLocaleString()}
                                    </span>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom Section: Roster Snapshot & Collapse Toggle */}
            <div className="sidebar_bottom_div p-3 space-y-3 border-t border-slate-100">
                {!isCollapsed && (
                    <div className="sidebar_summarybox_div p-3 space-y-2 text-xs">
                        <div className="sidebar_statusrow_div flex items-center gap-1.5 font-semibold text-emerald-700">
                            <ShieldCheck className="sidebar_statussvg_svg w-4 h-4 shrink-0" />
                            <span>Portal Secured</span>
                        </div>
                        {(typeof doctorCount === "number" ||
                            typeof patientCount === "number") && (
                                <div className="sidebar_countsrow_div flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/70 tabular-nums">
                                    <span>Doctors: {doctorCount ?? 0}</span>
                                    <span>Patients: {patientCount ?? 0}</span>
                                </div>
                            )}
                    </div>
                )}

                {onToggleCollapse && (
                    <button
                        type="button"
                        onClick={onToggleCollapse}
                        aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                        className={`sidebar_collapsebtn_button w-full py-2 px-3 text-xs font-semibold inline-flex items-center ${isCollapsed ? "justify-center" : "justify-between"
                            } cursor-pointer`}
                    >
                        {!isCollapsed && (
                            <span className="sidebar_collapsetext_span">Collapse Sidebar</span>
                        )}
                        {isCollapsed ? (
                            <ChevronRight className="sidebar_collapseicon_svg w-4 h-4" />
                        ) : (
                            <ChevronLeft className="sidebar_collapseicon_svg w-4 h-4" />
                        )}
                    </button>
                )}
            </div>
        </aside>
    );
};

export default Sidebar;