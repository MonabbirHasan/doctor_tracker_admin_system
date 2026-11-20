"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import "./dashboardshell.css";
import Sidebar from "@/components/layout/Sidebar";
import Header, { type HeaderAdminProfile } from "@/components/layout/Header";
import MobileNav from "@/components/layout/MobileNav";
import ProtectedRoute from "../auth/ProtectedRoute";
import { useAuthStore } from "@/store/useAuthStore";

interface DashboardShellProps {
    children: React.ReactNode;
    admin?: HeaderAdminProfile;
    doctorCount?: number;
    patientCount?: number;
    showMobileBottomBar?: boolean;
    onLogout?: () => void;
}

const DashboardShell: React.FC<DashboardShellProps> = ({
    children,
    admin,
    doctorCount,
    patientCount,
    showMobileBottomBar = false,
    onLogout,
}) => {
    const router = useRouter();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleToggleCollapse = () => {
        setIsSidebarCollapsed((prev) => !prev);
    };

    const handleOpenMobileMenu = () => {
        setIsMobileMenuOpen(true);
    };

    const handleCloseMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    const handleLogout = () => {
        useAuthStore.getState().clearAuthSession();
        if (onLogout) {
            onLogout();
        }
        toast.success("Signed out of Doctor Tracker");
        router.replace("/login");
        router.refresh();
    };

    return (
        <div className="dashboardshell_root_div flex w-full">
            {/* Desktop Sidebar */}
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                doctorCount={doctorCount}
                patientCount={patientCount}
                onToggleCollapse={handleToggleCollapse}
            />

            {/* Mobile Slide-Over Drawer (+ optional bottom bar) */}
            <MobileNav
                isOpen={isMobileMenuOpen}
                showBottomBar={showMobileBottomBar}
                onClose={handleCloseMobileMenu}
                onLogout={handleLogout}
            />

            {/* Main Column: Sticky Header + Route Content */}
            <div className="dashboardshell_body_div">
                <Header
                    admin={admin}
                    isMobileMenuOpen={isMobileMenuOpen}
                    isSidebarCollapsed={isSidebarCollapsed}
                    onToggleMobileMenu={handleOpenMobileMenu}
                    onToggleSidebarCollapse={handleToggleCollapse}
                    onLogout={handleLogout}
                />

                <main
                    className={`dashboardshell_main_main ${showMobileBottomBar ? "pb-20 lg:pb-0" : ""
                        }`}
                >
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardShell;