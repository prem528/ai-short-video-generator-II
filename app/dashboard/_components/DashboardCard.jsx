import React from "react";
import PropTypes from "prop-types";

export const DashboardCard = ({
  title,
  value,
  unit,
  icon: Icon,
  description,
  accent = "brand",
  progress, // optional 0-100 -> renders a playhead meter
}) => {
  const accentText = accent === "coral" ? "text-brand-2" : "text-brand";
  const accentBg = accent === "coral" ? "bg-brand-2/10" : "bg-brand/10";

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card p-5 transition-colors hover:border-brand/40">
      {/* faint corner glow */}
      <div className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full bg-brand/5 blur-2xl transition-opacity group-hover:opacity-100 opacity-0" />

      <div className="mb-4 flex items-center justify-between">
        <span className="timecode text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {title}
        </span>
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${accentBg}`}>
          <Icon className={`h-4 w-4 ${accentText}`} />
        </span>
      </div>

      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-semibold tracking-tight text-foreground tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="timecode text-xs uppercase tracking-wide text-muted-foreground">
            {unit}
          </span>
        )}
      </div>

      {typeof progress === "number" ? (
        <div className="mt-4">
          <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-brand to-brand-2"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-muted-foreground">{description}</p>
        </div>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">{description}</p>
      )}
    </div>
  );
};

DashboardCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  unit: PropTypes.string,
  icon: PropTypes.elementType.isRequired,
  description: PropTypes.string.isRequired,
  accent: PropTypes.oneOf(["brand", "coral"]),
  progress: PropTypes.number,
};
