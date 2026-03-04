import { useAmbientEngine } from './hooks/useAmbientEngine'
import { SoundLayer } from './components/SoundLayer'
import type { LayerConfig, SceneConfig } from './types'

const LAYERS: LayerConfig[] = [
  { id: 'rain', label: 'Rain', emoji: '🌧️', defaultVolume: 0.6 },
  { id: 'thunder', label: 'Thunder', emoji: '⛈️', defaultVolume: 0.4 },
  { id: 'forest', label: 'Forest', emoji: '🌿', defaultVolume: 0.5 },
  { id: 'fire', label: 'Fire', emoji: '🔥', defaultVolume: 0.5 },
  { id: 'ocean', label: 'Ocean', emoji: '🌊', defaultVolume: 0.6 },
  { id: 'wind', label: 'Wind', emoji: '💨', defaultVolume: 0.4 },
]

const SCENES: SceneConfig[] = [
  {
    id: 'deep-focus',
    label: 'Deep Focus',
    emoji: '🧠',
    layers: { rain: 0.65, forest: 0.3 },
  },
  {
    id: 'late-night',
    label: 'Late Night',
    emoji: '🌙',
    layers: { fire: 0.45, wind: 0.25, rain: 0.2 },
  },
  {
    id: 'morning-forest',
    label: 'Morning Forest',
    emoji: '🌅',
    layers: { forest: 0.7, rain: 0.2, ocean: 0.25 },
  },
  {
    id: 'storm-season',
    label: 'Storm Season',
    emoji: '⚡',
    layers: { rain: 0.8, thunder: 0.65, wind: 0.5 },
  },
]

export default function App() {
  const { playing, layerStates, togglePlayPause, toggleLayer, setLayerVolume, loadScene } = useAmbientEngine()

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden relative">
      {/* Atmospheric background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-radial-ambient" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-[0.06] bg-teal-500 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.04] bg-amber-500 blur-[100px]" />
        {/* Grain overlay */}
        <div className="absolute inset-0 opacity-[0.03] bg-noise" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-10">

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 mb-1 text-teal-400/60 text-xs tracking-[0.3em] uppercase">
            <span className="w-8 h-px bg-teal-400/30" />
            ambient audio
            <span className="w-8 h-px bg-teal-400/30" />
          </div>
          <h1 className="font-['Cinzel'] text-4xl font-semibold tracking-widest text-white/90 mb-2">
            Ambient Studio
          </h1>
          <p className="text-white/30 text-sm tracking-[0.15em]">craft your atmosphere</p>
        </div>

        {/* Master play/pause */}
        <div className="flex justify-center mb-10">
          <button
            onClick={togglePlayPause}
            className={`
              relative w-20 h-20 rounded-full flex items-center justify-center
              transition-all duration-500 focus:outline-none group
              ${playing
                ? 'bg-amber-500/20 border-2 border-amber-400/60 shadow-[0_0_40px_rgba(245,158,11,0.35)]'
                : 'bg-white/5 border-2 border-white/15 hover:border-teal-400/40 hover:shadow-[0_0_30px_rgba(20,184,166,0.2)]'
              }
            `}
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <div className="flex gap-1.5">
                <span className="w-[3px] h-6 bg-amber-400 rounded-full" />
                <span className="w-[3px] h-6 bg-amber-400 rounded-full" />
              </div>
            ) : (
              <svg className="w-7 h-7 text-white/70 ml-1 group-hover:text-teal-300 transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}

            {/* Ripple when playing */}
            {playing && (
              <>
                <span className="absolute inset-0 rounded-full border border-amber-400/20 animate-ping" />
              </>
            )}
          </button>
        </div>

        {/* Scene presets */}
        <div className="mb-8">
          <p className="text-xs text-white/25 tracking-[0.2em] uppercase text-center mb-4">Scenes</p>
          <div className="grid grid-cols-4 gap-2">
            {SCENES.map(scene => (
              <button
                key={scene.id}
                onClick={() => loadScene(scene)}
                className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border border-white/7 bg-white/3 hover:border-teal-400/30 hover:bg-teal-400/5 transition-all duration-300 focus:outline-none group"
              >
                <span className="text-xl">{scene.emoji}</span>
                <span className="text-[10px] text-white/40 group-hover:text-teal-300 transition-colors tracking-wide text-center leading-tight">
                  {scene.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-white/5" />
          <span className="text-white/20 text-xs tracking-[0.2em] uppercase">Layers</span>
          <div className="flex-1 h-px bg-white/5" />
        </div>

        {/* Sound layers grid */}
        <div className="grid grid-cols-2 gap-3">
          {LAYERS.map(layer => (
            <SoundLayer
              key={layer.id}
              config={layer}
              state={layerStates[layer.id]}
              onToggle={() => toggleLayer(layer.id)}
              onVolumeChange={v => setLayerVolume(layer.id, v)}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-10 text-center text-white/15 text-xs tracking-widest">
          built by dex · web audio api · no files needed
        </div>
      </div>
    </div>
  )
}
