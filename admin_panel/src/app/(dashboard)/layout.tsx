"use client";
// src\app\(dashboard)\layout.tsx
import React from "react";
import { Toaster } from "sonner";
import DashboardShell from "@/components/layout/DashboardShell";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function ProtectedDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ProtectedRoute>
        <Toaster position="top-right" richColors />
        <DashboardShell
          admin={{
            name: "Dr. Admin",
            email: "admin@doctortracker.com",
            role: "System Administrator",
          }}
          doctorCount={6}
          patientCount={6}
          showMobileBottomBar={false}
        >
          {children}
        </DashboardShell>
      </ProtectedRoute>
    </>
  );
}