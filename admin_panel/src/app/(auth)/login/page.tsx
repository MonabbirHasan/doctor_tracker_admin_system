"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import {
  Stethoscope,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Activity,
  Users,
  Loader2,
  Sparkles,
} from "lucide-react";
import "./login.css";
import { authService } from "@/services";
import { extractApiErrorMessage } from "@/lib/api";
import { useAuthStore } from "@/store/useAuthStore";
  //============================
  // LOGIN VALIDATION
  //============================
const loginSchema = z.object({
  email: z.string().email("Please enter a valid administrator email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const AdminLoginPage = () => {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: true,
    },
  });
  //============================
  // ADMIN LOGIN AUTO FILL
  //============================
  const handleFillDemo = () => {
    setValue("email", "admin@doctortracker.com", { shouldValidate: true });
    setValue("password", "StrongPassword123!", { shouldValidate: true });
    toast.info("Demo admin credentials filled");
  };
  //============================
  // HANDLE ADMIN LOGIN
  //============================
  const onSubmit = async (data: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await authService.login({
        email: data.email.trim(),
        password: data.password,
      });

      if (!response?.success || !response.token || !response.user) {
        throw new Error("Invalid authentication response from server");
      }

      useAuthStore.getState().setAuthSession({
        user: response.user,
        token: response.token,
      });

      toast.success(`Welcome back, ${response.user.name}!`);

      const params = new URLSearchParams(window.location.search);
      const nextPath = params.get("next") || "/dashboard";
      const safeNextPath = nextPath.startsWith("/") ? nextPath : "/dashboard";
      router.replace(safeNextPath);
    } catch (error) {
      toast.error(
        extractApiErrorMessage(
          error,
          "Invalid credentials. Please verify your email and password."
        )
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  //============================
  // RENDER AMIN ELEMENT
  //============================
  return (
    <div className="adminloginpage_wrapper_div min-h-screen w-full grid grid-cols-1 lg:grid-cols-12">
      {/* Left Brand & System Overview Panel */}
      <aside className="adminloginpage_brandpanel_aside hidden lg:flex lg:col-span-6 xl:col-span-7 flex-col justify-between p-12 text-white">
        <div className="adminloginpage_gridoverlay_div absolute inset-0 pointer-events-none" />
        <div className="adminloginpage_gloworb_div absolute -top-24 -left-24 w-96 h-96 rounded-full pointer-events-none" />
        <div className="adminloginpage_gloworb_div absolute -bottom-24 -right-24 w-96 h-96 rounded-full pointer-events-none" />

        {/* Brand Logo Header */}
        <div className="adminloginpage_brandheader_div relative z-10 flex items-center gap-3">
          <div className="adminloginpage_logoicon_div w-11 h-11 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center shadow-lg">
            <Stethoscope className="adminloginpage_logosvg_svg w-6 h-6 text-white" />
          </div>
          <div className="adminloginpage_brandtext_div">
            <span className="adminloginpage_brandtitle_span text-xl font-bold tracking-tight block">
              Doctor Tracker
            </span>
            <span className="adminloginpage_brandsub_span text-xs text-blue-200 uppercase tracking-widest">
              Clinical Admin Portal
            </span>
          </div>
        </div>

        {/* Center Hero Value Proposition */}
        <div className="adminloginpage_herocontent_div relative z-10 max-w-xl my-auto space-y-6">
          <div className="adminloginpage_badge_div inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-blue-100">
            <ShieldCheck className="adminloginpage_badgesvg_svg w-4 h-4 text-emerald-400" />
            <span className="adminloginpage_badgetext_span">
              Role-Protected Healthcare Operations Suite
            </span>
          </div>

          <h1 className="adminloginpage_herotitle_h1 text-4xl xl:text-5xl font-bold leading-tight tracking-tight">
            Streamline Doctor Rosters &amp; Patient Care Analytics.
          </h1>

          <p className="adminloginpage_herodesc_p text-base text-blue-100/85 leading-relaxed">
            Centralized medical administration to manage specialist directories,
            assign patient caseloads, and monitor real-time clinical growth
            metrics from a single secure workspace.
          </p>

          {/* Feature Highlight Cards */}
          <div className="adminloginpage_featuregrid_div grid grid-cols-2 gap-4 pt-4">
            <div className="adminloginpage_glasscard_div p-4 space-y-2">
              <div className="adminloginpage_cardicon_div w-9 h-9 rounded-lg bg-blue-500/30 flex items-center justify-center">
                <Users className="adminloginpage_cardsvg_svg w-5 h-5 text-blue-200" />
              </div>
              <h3 className="adminloginpage_cardtitle_h3 font-semibold text-sm">
                Doctor-Patient Mapping
              </h3>
              <p className="adminloginpage_cardtext_p text-xs text-blue-200/80 leading-relaxed">
                Instant filtering, pagination, and direct patient assignment per
                specialist.
              </p>
            </div>

            <div className="adminloginpage_glasscard_div p-4 space-y-2">
              <div className="adminloginpage_cardicon_div w-9 h-9 rounded-lg bg-emerald-500/25 flex items-center justify-center">
                <Activity className="adminloginpage_cardsvg_svg w-5 h-5 text-emerald-300" />
              </div>
              <h3 className="adminloginpage_cardtitle_h3 font-semibold text-sm">
                Live Clinical Insights
              </h3>
              <p className="adminloginpage_cardtext_p text-xs text-blue-200/80 leading-relaxed">
                Visual breakdowns of patient distribution and date-wise intake
                trends.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Meta */}
        <div className="adminloginpage_brandfooter_div relative z-10 flex items-center justify-between text-xs text-blue-200/75 border-t border-white/15 pt-6">
          <span className="adminloginpage_copyright_span">
            &copy; {new Date().getFullYear()} Doctor Tracker System
          </span>
          <span className="adminloginpage_securitynote_span flex items-center gap-1.5">
            <Lock className="adminloginpage_footersvg_svg w-3.5 h-3.5" />
            End-to-End Encrypted Session
          </span>
        </div>
      </aside>

      {/* Right Authentication Form Panel */}
      <main className="adminloginpage_formpanel_main lg:col-span-6 xl:col-span-5 flex flex-col justify-center items-center p-6 sm:p-10 lg:p-12">
        <div className="adminloginpage_formcontainer_div w-full max-w-md space-y-6">
          {/* Mobile Brand Header */}
          <div className="adminloginpage_mobilebrand_div flex lg:hidden items-center justify-center gap-2.5 mb-2">
            <div className="adminloginpage_mobilelogo_div w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md">
              <Stethoscope className="adminloginpage_mobilelogosvg_svg w-5 h-5" />
            </div>
            <span className="adminloginpage_mobiletitle_span text-xl font-bold tracking-tight text-slate-900">
              Doctor Tracker
            </span>
          </div>

          {/* Login Form Card */}
          <div className="adminloginpage_formcard_div p-7 sm:p-9 space-y-6">
            <div className="adminloginpage_formheader_div space-y-1.5">
              <h2 className="adminloginpage_formtitle_h2 text-2xl font-bold tracking-tight">
                Administrator Sign In
              </h2>
              <p className="adminloginpage_formsubtitle_p text-sm text-slate-500">
                Enter your authorized credentials to access the control panel.
              </p>
            </div>

            {/* Quick Demo Fill Banner */}
            <div className="adminloginpage_demobanner_div flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-lg bg-slate-100 border border-slate-200 text-xs">
              <span className="adminloginpage_demotext_span text-slate-600 font-medium">
                Evaluating the portal?
              </span>
              <button
                type="button"
                onClick={handleFillDemo}
                className="adminloginpage_demobtn_button inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <Sparkles className="adminloginpage_demosvg_svg w-3.5 h-3.5" />
                Fill Demo Login
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="adminloginpage_form_form space-y-4"
              noValidate
            >
              {/* Email Field */}
              <div className="adminloginpage_fieldgroup_div space-y-1.5">
                <label
                  htmlFor="admin_email"
                  className="adminloginpage_fieldlabel_label block text-sm font-medium text-slate-700"
                >
                  Email Address
                </label>
                <div className="adminloginpage_inputwrapper_div relative">
                  <Mail className="adminloginpage_inputicon_svg w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="admin_email"
                    type="email"
                    autoComplete="email"
                    placeholder="admin@doctortracker.com"
                    {...register("email")}
                    className={`adminloginpage_fieldinput_input w-full pl-10 pr-4 py-2.5 text-sm ${errors.email ? "adminloginpage_fieldinput_error_input" : ""
                      }`}
                  />
                </div>
                {errors.email && (
                  <p className="adminloginpage_errortext_p text-xs font-medium text-red-600">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div className="adminloginpage_fieldgroup_div space-y-1.5">
                <div className="adminloginpage_labelrow_div flex items-center justify-between">
                  <label
                    htmlFor="admin_password"
                    className="adminloginpage_fieldlabel_label block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>
                </div>
                <div className="adminloginpage_inputwrapper_div relative">
                  <Lock className="adminloginpage_inputicon_svg w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="admin_password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    {...register("password")}
                    className={`adminloginpage_fieldinput_input w-full pl-10 pr-11 py-2.5 text-sm ${errors.password
                      ? "adminloginpage_fieldinput_error_input"
                      : ""
                      }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="adminloginpage_togglepass_button absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showPassword ? (
                      <EyeOff className="adminloginpage_togglesvg_svg w-4 h-4" />
                    ) : (
                      <Eye className="adminloginpage_togglesvg_svg w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="adminloginpage_errortext_p text-xs font-medium text-red-600">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Remember Session Row */}
              <div className="adminloginpage_optionsrow_div flex items-center justify-between pt-1">
                <label className="adminloginpage_checkboxlabel_label inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    {...register("rememberMe")}
                    className="adminloginpage_checkbox_input w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="adminloginpage_checkboxtext_span">
                    Keep session active
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="adminloginpage_submitbtn_button w-full py-2.5 px-4 mt-2 font-semibold text-sm inline-flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="adminloginpage_loadersvg_svg w-4 h-4 animate-spin" />
                    <span className="adminloginpage_btntext_span">
                      Authenticating...
                    </span>
                  </>
                ) : (
                  <>
                    <span className="adminloginpage_btntext_span">
                      Sign In to Dashboard
                    </span>
                    <ArrowRight className="adminloginpage_btnsvg_svg w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <p className="adminloginpage_bottomnote_p text-center text-xs text-slate-500">
            Protected administrative gateway. Unauthorized access is prohibited.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminLoginPage;