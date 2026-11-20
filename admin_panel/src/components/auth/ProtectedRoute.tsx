"use client";

import React, { Suspense, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert, Loader2 } from "lucide-react";
import "./protectedroute.css";
import { useAuthStore } from "@/store/useAuthStore";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const GuardFallback: React.FC<{ label?: string; detail?: string }> = ({
    label = "Verifying Session...",
    detail = "Checking your administrator credentials.",
}) => (
    <div className="protectedroute_guard_div min-h-screen w-full flex items-center justify-center p-6">
        <div className="protectedroute_card_div max-w-sm w-full p-6 text-center space-y-3">
            <div className="protectedroute_iconbox_div w-11 h-11 mx-auto flex items-center justify-center">
                <Loader2 className="protectedroute_spin_svg w-5 h-5 animate-spin" />
            </div>
            <h2 className="protectedroute_title_h2 text-base font-bold text-slate-900">
                {label}
            </h2>
            <p className="protectedroute_desc_p text-xs text-slate-500">
                {detail}
            </p>
        </div>
    </div>
);

const ProtectedRouteContent: React.FC<ProtectedRouteProps> = ({ children }) => {
    const router = useRouter();
    const pathname = usePathname() || "/dashboard";
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const token = useAuthStore((s) => s.token);
    const isHydrated = useAuthStore((s) => s.isHydrated);

    const hasValidSession = Boolean(isAuthenticated && token);

    useEffect(() => {
        if (!isHydrated) return;
        if (!hasValidSession) {
            const nextParam = encodeURIComponent(pathname);
            router.replace(`/login?next=${nextParam}`);
        }
    }, [isHydrated, hasValidSession, pathname, router]);

    if (!isHydrated) {
        return <GuardFallback />;
    }

    if (!hasValidSession) {
        return (
            <div className="protectedroute_guard_div min-h-screen w-full flex items-center justify-center p-6">
                <div className="protectedroute_card_div max-w-sm w-full p-6 text-center space-y-3">
                    <div className="protectedroute_iconbox_div w-11 h-11 mx-auto flex items-center justify-center">
                        <ShieldAlert className="protectedroute_alert_svg w-5 h-5" />
                    </div>
                    <h2 className="protectedroute_title_h2 text-base font-bold text-slate-900">
                        Authentication Required
                    </h2>
                    <p className="protectedroute_desc_p text-xs text-slate-500">
                        Unauthorized access blocked. Redirecting to sign in...
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    return (
        <Suspense fallback={<GuardFallback />}>
            <ProtectedRouteContent>{children}</ProtectedRouteContent>
        </Suspense>
    );
};

export default ProtectedRoute;