"use client";

import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShieldAlert, Loader2 } from "lucide-react";
import "./protectedroute.css";
import { useAuthStore } from "@/store/useAuthStore";

interface ProtectedRouteProps {
    children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
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

    if (!isHydrated || !hasValidSession) {
        return (
            <div className="protectedroute_guard_div min-h-screen w-full flex items-center justify-center p-6">
                <div className="protectedroute_card_div max-w-sm w-full p-6 text-center space-y-3">
                    <div className="protectedroute_iconbox_div w-11 h-11 mx-auto flex items-center justify-center">
                        {!isHydrated ? (
                            <Loader2 className="protectedroute_spin_svg w-5 h-5 animate-spin" />
                        ) : (
                            <ShieldAlert className="protectedroute_alert_svg w-5 h-5" />
                        )}
                    </div>
                    <h2 className="protectedroute_title_h2 text-base font-bold text-slate-900">
                        {!isHydrated
                            ? "Verifying Session..."
                            : "Authentication Required"}
                    </h2>
                    <p className="protectedroute_desc_p text-xs text-slate-500">
                        {!isHydrated
                            ? "Checking your administrator credentials."
                            : "Unauthorized access blocked. Redirecting to sign in..."}
                    </p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
};

export default ProtectedRoute;