"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Stethoscope, Users } from "lucide-react";
import { doctorService, type DoctorRecord } from "@/services/doctor.service";
import { patientService, type PatientRecord } from "@/services/patient.service";

export default function DoctorDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const doctorId = params?.id ?? "";

  const [doctor, setDoctor] = useState<DoctorRecord | null>(null);
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!doctorId) return;

    let active = true;
    const loadDetails = async () => {
      try {
        setLoading(true);
        setError(null);

        const [docRes, patientRes] = await Promise.all([
          doctorService.getAll({ limit: 100 }),
          patientService.getAll({ doctorId, limit: 100 }),
        ]);

        if (!active) return;

        const foundDoctor =
          (docRes.data ?? []).find((item) => item.id === doctorId) ?? null;

        if (!foundDoctor) {
          setDoctor(null);
          setPatients([]);
          setError("Doctor not found.");
          return;
        }

        setDoctor(foundDoctor);
        setPatients(patientRes.data ?? []);
      } catch (err: unknown) {
        if (!active) return;
        setError(
          err instanceof Error ? err.message : "Failed to load doctor details"
        );
      } finally {
        if (active) setLoading(false);
      }
    };

    loadDetails();
    return () => {
      active = false;
    };
  }, [doctorId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[320px] gap-2 text-slate-600">
        <Loader2 className="w-5 h-5 animate-spin" />
        <span>Loading doctor profile...</span>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="p-6 space-y-4">
        <button
          type="button"
          onClick={() => router.push("/doctors")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Doctors
        </button>
        <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
          {error || "Doctor not found."}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => router.push("/doctors")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Doctors
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-2">
        <div className="flex items-center gap-2 text-slate-900">
          <Stethoscope className="w-5 h-5" />
          <h1 className="text-xl font-bold">{doctor.name}</h1>
        </div>
        {doctor.email && (
          <p className="text-sm text-slate-500">Email: {doctor.email}</p>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-900">
          <Users className="w-5 h-5" />
          <h2 className="text-base font-semibold">
            Assigned Patients ({patients.length})
          </h2>
        </div>

        {patients.length === 0 ? (
          <p className="text-sm text-slate-500">
            No patients currently assigned to this doctor.
          </p>
        ) : (
          <div className="divide-y divide-slate-100">
            {patients.map((patient) => (
              <div
                key={patient.id}
                className="py-3 flex items-center justify-between text-sm"
              >
                <div>
                  <p className="font-medium text-slate-900">{patient.name}</p>
                  <p className="text-xs text-slate-500">
                    Condition: {patient.condition} • Age: {patient.age}
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-600">
                  {patient.admissionDate
                    ? new Date(patient.admissionDate).toLocaleDateString()
                    : ""}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}