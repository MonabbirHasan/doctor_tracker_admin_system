"use client";

import React from "react";
import {
    TrendingUp,
    TrendingDown,
    Minus,
    Users,
    ChevronRight,
} from "lucide-react";
import "./statcard.css";

export type StatTone =
    | "primary"
    | "success"
    | "warning"
    | "destructive"
    | "neutral";

export type TrendDirection = "up" | "down" | "neutral";

export interface StatCardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    trendValue?: string;
    trendDirection?: TrendDirection;
    tone?: StatTone;
    icon?: React.ReactNode;
    isLoading?: boolean;
    onClick?: () => void;
}

const TONE_ICON_CLASS: Record<StatTone, string> = {
    primary: "statcard_iconbox_primary_div",
    success: "statcard_iconbox_success_div",
    warning: "statcard_iconbox_warning_div",
    destructive: "statcard_iconbox_destructive_div",
    neutral: "statcard_iconbox_neutral_div",
};

const TREND_BADGE_CLASS: Record<TrendDirection, string> = {
    up: "statcard_trend_up_span",
    down: "statcard_trend_down_span",
    neutral: "statcard_trend_neutral_span",
};

const StatCard: React.FC<StatCardProps> = ({
    title,
    value,
    subtitle,
    trendValue,
    trendDirection = "neutral",
    tone = "primary",
    icon,
    isLoading = false,
    onClick,
}) => {
    const formattedValue =
        typeof value === "number" ? value.toLocaleString() : value;

    const renderTrendIcon = () => {
        if (trendDirection === "up") {
            return <TrendingUp className="statcard_trendicon_svg w-3.5 h-3.5" />;
        }
        if (trendDirection === "down") {
            return <TrendingDown className="statcard_trendicon_svg w-3.5 h-3.5" />;
        }
        return <Minus className="statcard_trendicon_svg w-3.5 h-3.5" />;
    };

    if (isLoading) {
        return (
            <div className="statcard_card_div p-5 sm:p-6 space-y-4">
                <div className="statcard_skeltop_div flex items-center justify-between">
                    <div className="statcard_skeleton_div h-4 w-28 animate-pulse" />
                    <div className="statcard_skeleton_div h-10 w-10 animate-pulse" />
                </div>
                <div className="statcard_skeleton_div h-8 w-24 animate-pulse" />
                <div className="statcard_skelbot_div flex items-center gap-2">
                    <div className="statcard_skeleton_div h-5 w-16 animate-pulse" />
                    <div className="statcard_skeleton_div h-4 w-32 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onClick={onClick}
            onKeyDown={(e) => {
                if (onClick && (e.key === "Enter" || e.key === " ")) {
                    e.preventDefault();
                    onClick();
                }
            }}
            className={`statcard_card_div p-5 sm:p-6 flex flex-col justify-between gap-4 ${onClick ? "statcard_card_clickable_div cursor-pointer" : ""
                }`}
        >
            {/* Top Row: Title & Icon */}
            <div className="statcard_header_div flex items-start justify-between gap-3">
                <div className="statcard_labelgroup_div space-y-1">
                    <p className="statcard_title_p text-xs sm:text-sm font-medium text-slate-500">
                        {title}
                    </p>
                    <h3 className="statcard_value_h3 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 tabular-nums">
                        {formattedValue}
                    </h3>
                </div>

                <div
                    className={`statcard_iconbox_div w-11 h-11 shrink-0 ${TONE_ICON_CLASS[tone]}`}
                >
                    {icon ?? <Users className="statcard_defaulticon_svg w-5 h-5" />}
                </div>
            </div>

            {/* Bottom Row: Trend Badge + Subtitle / Action Hint */}
            {(trendValue || subtitle || onClick) && (
                <div className="statcard_footer_div flex items-center justify-between gap-2 pt-3 border-t border-slate-100 text-xs">
                    <div className="statcard_meta_div flex flex-wrap items-center gap-2">
                        {trendValue && (
                            <span
                                className={`statcard_trendbadge_span inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-semibold tabular-nums ${TREND_BADGE_CLASS[trendDirection]}`}
                            >
                                {renderTrendIcon()}
                                <span className="statcard_trendtext_span">{trendValue}</span>
                            </span>
                        )}
                        {subtitle && (
                            <span className="statcard_subtitle_span text-slate-500">
                                {subtitle}
                            </span>
                        )}
                    </div>

                    {onClick && (
                        <ChevronRight className="statcard_arrow_svg w-4 h-4 text-slate-400 shrink-0" />
                    )}
                </div>
            )}
        </div>
    );
};

export default StatCard;