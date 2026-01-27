import { translations as t } from '@/lib/translations/es';

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
  // Glass is 400px tall, liquid starts at bottom with 30px padding (370px from top)
  // Liquid can fill up to 250px, so: top = (370 - percentage * 2.5) / 400 * 100
  const linePosition = 92.5 - (percentage * 0.625);

  return (
    <div className="relative max-w-md mx-auto">
      {/* Glass container - responsive sizing */}
      <div className="relative mx-auto w-[240px] h-[340px] sm:w-[280px] sm:h-[400px]">
        {/* Scale markers with lines - positioned at correct heights */}
        {/* 100% mark */}
        <div className="hidden sm:flex absolute left-0 items-center -ml-8 md:-ml-12" style={{ top: '30%' }}>
          <span className="text-xs text-slate-500 mr-2">100%</span>
          <div className="w-6 h-0.5 bg-slate-300" />
        </div>
        {/* 75% mark */}
        <div className="hidden sm:flex absolute left-0 items-center -ml-8 md:-ml-12" style={{ top: '45.625%' }}>
          <span className="text-xs text-slate-500 mr-2">75%</span>
          <div className="w-6 h-0.5 bg-slate-300" />
        </div>
        {/* 50% mark */}
        <div className="hidden sm:flex absolute left-0 items-center -ml-8 md:-ml-12" style={{ top: '61.25%' }}>
          <span className="text-xs text-slate-500 mr-2">50%</span>
          <div className="w-6 h-0.5 bg-slate-300" />
        </div>
        {/* 25% mark */}
        <div className="hidden sm:flex absolute left-0 items-center -ml-8 md:-ml-12" style={{ top: '76.875%' }}>
          <span className="text-xs text-slate-500 mr-2">25%</span>
          <div className="w-6 h-0.5 bg-slate-300" />
        </div>

        {/* Glass outline with handle */}
        <svg
          viewBox="0 0 280 400"
          className="absolute inset-0 w-full h-full"
          style={{ filter: 'drop-shadow(0 4px 6px rgba(0, 0, 0, 0.1))' }}
        >
          {/* Glass body - rounded rectangle */}
          <defs>
            <linearGradient id="glassGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.1)" />
              <stop offset="100%" stopColor="rgba(139, 92, 246, 0.05)" />
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
            stroke="rgba(139, 92, 246, 0.4)"
            strokeWidth="3"
          />

          {/* Handle */}
          <path
            d="M 220 180 Q 250 180 250 220 Q 250 260 220 260"
            fill="none"
            stroke="rgba(139, 92, 246, 0.4)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>

        {/* Liquid fill - positioned from bottom */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-center pb-[25px] sm:pb-[30px]">
          <div className="relative w-[150px] sm:w-[155px]">
            {/* Mobile liquid */}
            <div
              className="sm:hidden rounded-b-3xl transition-all duration-700 ease-out"
              style={{
                height: `${(percentage / 100) * 210}px`,
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
              className="hidden sm:block rounded-b-3xl transition-all duration-700 ease-out"
              style={{
                height: `${(percentage / 100) * 250}px`,
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
          className="hidden sm:block absolute left-0 right-0 h-0.5 bg-yellow-500"
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
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
            ${currentAmount.toLocaleString()}
          </div>
          <div className="text-slate-400 text-xs sm:text-sm mt-1">
            {t.glass.of} ${goalAmount.toLocaleString()} {t.glass.goal}
          </div>
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-400 text-xs sm:text-sm">
          <span>🎫</span>
          <span>{ticketsSold} {ticketsSold === 1 ? t.glass.ticket : t.glass.tickets} {t.glass.ticketsSold}</span>
        </div>

        {/* Progress badge */}
        <div className="inline-flex items-center gap-2 bg-purple-900/40 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-purple-500/30">
          <span>🏆</span>
          <span className="font-bold text-yellow-400 text-sm sm:text-base">{percentage.toFixed(1)}%</span>
        </div>
      </div>
    </div>
  );
}
