import { translations as t } from '@/lib/translations/es';
import { formatCurrency } from '@/lib/utils/currency';

interface GlassVisualizationProps {
  currentAmount: number;
  goalAmount: number;
  ticketsSold: number;
}

export default function GlassVisualization({
  currentAmount,
  goalAmount,
  ticketsSold,
}: GlassVisualizationProps) {
  const percentage = Math.min((currentAmount / goalAmount) * 100, 100);

  // Calculate the line position to match the top of the liquid
  // Glass: y=80 (20%), height=280 (70% of viewBox)
  // At 0%: line at 90% (bottom of glass)
  // At 100%: line at 20% (top of glass)
  const linePosition = 90 - (percentage * 0.7);

  return (
    <div className="relative max-w-xl mx-auto overflow-hidden">
      {/* Subtle background for contrast */}
      <div className="absolute inset-0 bg-white/5 dark:bg-white/5 backdrop-blur-sm rounded-3xl -mx-4 sm:-mx-8 -mb-8"></div>

      {/* Glass container - responsive sizing */}
      <div className="relative mx-auto w-[280px] h-[400px] sm:w-[320px] sm:h-[460px] lg:w-[360px] lg:h-[520px] z-10">
        {/* Scale markers with lines - positioned at correct heights */}
        {/* 100% mark */}
        <div className="hidden sm:flex absolute left-0 items-center -ml-8 md:-ml-12" style={{ top: '30%' }}>
          <span className="text-xs text-slate-200 dark:text-slate-300 font-medium mr-2">100%</span>
          <div className="w-6 h-0.5 bg-slate-300 dark:bg-slate-400" />
        </div>
        {/* 75% mark */}
        <div className="hidden sm:flex absolute left-0 items-center -ml-8 md:-ml-12" style={{ top: '45.625%' }}>
          <span className="text-xs text-slate-200 dark:text-slate-300 font-medium mr-2">75%</span>
          <div className="w-6 h-0.5 bg-slate-300 dark:bg-slate-400" />
        </div>
        {/* 50% mark */}
        <div className="hidden sm:flex absolute left-0 items-center -ml-8 md:-ml-12" style={{ top: '61.25%' }}>
          <span className="text-xs text-slate-200 dark:text-slate-300 font-medium mr-2">50%</span>
          <div className="w-6 h-0.5 bg-slate-300 dark:bg-slate-400" />
        </div>
        {/* 25% mark */}
        <div className="hidden sm:flex absolute left-0 items-center -ml-8 md:-ml-12" style={{ top: '76.875%' }}>
          <span className="text-xs text-slate-200 dark:text-slate-300 font-medium mr-2">25%</span>
          <div className="w-6 h-0.5 bg-slate-300 dark:bg-slate-400" />
        </div>

        {/* Glass outline with handle */}
        <svg
          viewBox="0 0 280 400"
          className="absolute inset-0 w-full h-full"
          style={{ filter: 'drop-shadow(0 4px 12px rgba(139, 92, 246, 0.3))' }}
        >
          {/* Glass body - rounded rectangle */}
          <defs>
            <linearGradient id="glassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(167, 139, 250, 0.15)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0.08)" />
            </linearGradient>
          </defs>

          {/* Glass outer border */}
          <rect
            x="60"
            y="80"
            width="160"
            height="280"
            rx="20"
            fill="url(#glassGradient)"
            stroke="rgba(167, 139, 250, 0.7)"
            strokeWidth="3"
          />

          {/* Handle */}
          <path
            d="M 220 180 Q 250 180 250 220 Q 250 260 220 260"
            fill="none"
            stroke="rgba(167, 139, 250, 0.7)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        {/* Liquid fill - positioned from bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-[40px] sm:pb-[46px] lg:pb-[52px]">
          <div className="relative w-[160px] sm:w-[183px] lg:w-[206px]">
            {/* Mobile liquid */}
            <div
              className="sm:hidden rounded-b-3xl transition-all duration-700 ease-out"
              style={{
                height: `${(percentage / 100) * 280}px`,
                background: 'linear-gradient(to top, #f59e0b, #fbbf24, #fcd34d)',
                boxShadow: '0 -4px 20px rgba(251, 191, 36, 0.4)',
              }}
            >
              {/* Liquid shine effect */}
              <div
                className="absolute inset-0 rounded-b-3xl"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
                }}
              />
            </div>
            {/* Desktop liquid */}
            <div
              className="hidden sm:block lg:hidden rounded-b-3xl transition-all duration-700 ease-out"
              style={{
                height: `${(percentage / 100) * 322}px`,
                background: 'linear-gradient(to top, #f59e0b, #fbbf24, #fcd34d)',
                boxShadow: '0 -4px 20px rgba(251, 191, 36, 0.4)',
              }}
            >
              {/* Liquid shine effect */}
              <div
                className="absolute inset-0 rounded-b-3xl"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
                }}
              />
            </div>
            {/* Large screen liquid */}
            <div
              className="hidden lg:block rounded-b-3xl transition-all duration-700 ease-out"
              style={{
                height: `${(percentage / 100) * 364}px`,
                background: 'linear-gradient(to top, #f59e0b, #fbbf24, #fcd34d)',
                boxShadow: '0 -4px 20px rgba(251, 191, 36, 0.4)',
              }}
            >
              {/* Liquid shine effect */}
              <div
                className="absolute inset-0 rounded-b-3xl"
                style={{
                  background:
                    'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.2) 50%, transparent 100%)',
                }}
              />
            </div>
          </div>
        </div>

        {/* Connecting line - hidden on small screens */}
        <div
          className="hidden sm:block absolute left-0 right-0 h-0.5 bg-yellow-400 dark:bg-yellow-500 shadow-lg shadow-yellow-500/50"
          style={{
            top: `${linePosition}%`,
            marginLeft: '-2rem',
            marginRight: '-0.5rem',
          }}
        />

        {/* Percentage indicator floating on right */}
        <div
          className="absolute right-0 bg-yellow-500 text-slate-900 font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm shadow-lg z-10"
          style={{ top: `${linePosition}%` }}
        >
          {percentage.toFixed(1)}%
        </div>
      </div>

      {/* Prize information below glass */}
      <div className="text-center mt-4 sm:mt-6 space-y-2 px-4">
        <div>
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 bg-clip-text text-transparent drop-shadow-[0_2px_4px_rgba(250,204,21,0.3)]">
            {formatCurrency(currentAmount)}
          </div>
          <div className="text-white text-xs sm:text-sm mt-1 font-semibold drop-shadow-md">
            {t.glass.of} <span className="font-bold">{formatCurrency(goalAmount)}</span> {t.glass.goal}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-white text-xs sm:text-sm font-semibold drop-shadow-md">
          <span>🎫</span>
          <span>{ticketsSold} {ticketsSold === 1 ? t.glass.ticket : t.glass.tickets} {t.glass.ticketsSold}</span>
        </div>

        {/* Progress badge */}
        <div className="inline-flex items-center gap-2 bg-purple-600/40 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-purple-400/40 shadow-lg shadow-purple-500/20">
          <span>🏆</span>
          <span className="font-bold text-yellow-300 text-sm sm:text-base drop-shadow-md">{percentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
