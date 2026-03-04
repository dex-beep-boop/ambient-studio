import type { LayerConfig, LayerState } from '../types'

interface Props {
  config: LayerConfig
  state: LayerState
  onToggle: () => void
  onVolumeChange: (v: number) => void
}

export function SoundLayer({ config, state, onToggle, onVolumeChange }: Props) {
  return (
    <div
      className={`
        relative flex flex-col gap-3 p-4 rounded-2xl border transition-all duration-500 cursor-default
        ${state.active
          ? 'border-amber-500/50 bg-amber-500/5 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
          : 'border-white/5 bg-white/3 hover:border-white/10'
        }
      `}
    >
      {/* Pulse ring when active */}
      {state.active && (
        <div className="absolute inset-0 rounded-2xl border border-amber-400/20 animate-pulse pointer-events-none" />
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.emoji}</span>
          <span className={`text-sm font-medium tracking-wide ${state.active ? 'text-amber-200' : 'text-white/50'}`}>
            {config.label}
          </span>
        </div>

        {/* Toggle button */}
        <button
          onClick={onToggle}
          className={`
            w-10 h-6 rounded-full relative transition-all duration-300 focus:outline-none
            ${state.active
              ? 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
              : 'bg-white/10'
            }
          `}
          aria-label={`${state.active ? 'Disable' : 'Enable'} ${config.label}`}
        >
          <div
            className={`
              absolute top-1 w-4 h-4 rounded-full transition-all duration-300
              ${state.active ? 'left-5 bg-white' : 'left-1 bg-white/40'}
            `}
          />
        </button>
      </div>

      {/* Volume slider */}
      <div className="flex items-center gap-3">
        <div
          className={`text-xs transition-colors duration-300 ${state.active ? 'text-teal-400' : 'text-white/20'}`}
        >
          ◀
        </div>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={state.volume}
          onChange={e => onVolumeChange(parseFloat(e.target.value))}
          className="flex-1 ambient-slider"
          disabled={!state.active}
        />
        <div
          className={`text-xs transition-colors duration-300 ${state.active ? 'text-teal-400' : 'text-white/20'}`}
        >
          ▶
        </div>
      </div>
    </div>
  )
}
