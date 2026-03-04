import { useRef, useState, useCallback } from 'react'
import type { LayerId, LayerState, SceneConfig } from '../types'

const LAYER_IDS: LayerId[] = ['rain', 'thunder', 'forest', 'fire', 'ocean', 'wind']

interface NoiseNodes {
  source: AudioBufferSourceNode
  gainNode: GainNode
  filterNode: BiquadFilterNode
  lfoOsc?: OscillatorNode
  lfoGain?: GainNode
}

function generateWhiteNoiseBuffer(ctx: AudioContext, duration = 2): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * duration
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) {
    data[i] = Math.random() * 2 - 1
  }
  return buffer
}

function generatePinkNoiseBuffer(ctx: AudioContext, duration = 2): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * duration
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + white * 0.0555179
    b1 = 0.99332 * b1 + white * 0.0750759
    b2 = 0.96900 * b2 + white * 0.1538520
    b3 = 0.86650 * b3 + white * 0.3104856
    b4 = 0.55000 * b4 + white * 0.5329522
    b5 = -0.7616 * b5 - white * 0.0168980
    data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) / 6
    b6 = white * 0.115926
  }
  return buffer
}

function generateBrownNoiseBuffer(ctx: AudioContext, duration = 2): AudioBuffer {
  const sampleRate = ctx.sampleRate
  const length = sampleRate * duration
  const buffer = ctx.createBuffer(1, length, sampleRate)
  const data = buffer.getChannelData(0)
  let lastOut = 0.0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    lastOut = (lastOut + 0.02 * white) / 1.02
    data[i] = lastOut * 3.5
  }
  return buffer
}

function buildLayerNodes(ctx: AudioContext, layerId: LayerId, masterGain: GainNode): NoiseNodes {
  let buffer: AudioBuffer

  switch (layerId) {
    case 'rain':
    case 'forest':
    case 'ocean':
      buffer = generatePinkNoiseBuffer(ctx)
      break
    case 'thunder':
    case 'fire':
      buffer = generateBrownNoiseBuffer(ctx)
      break
    case 'wind':
    default:
      buffer = generateWhiteNoiseBuffer(ctx)
      break
  }

  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.loop = true

  const gainNode = ctx.createGain()
  gainNode.gain.value = 0

  const filterNode = ctx.createBiquadFilter()

  switch (layerId) {
    case 'rain':
      filterNode.type = 'bandpass'
      filterNode.frequency.value = 1000
      filterNode.Q.value = 0.5
      break
    case 'thunder':
      filterNode.type = 'lowpass'
      filterNode.frequency.value = 200
      filterNode.Q.value = 0.5
      break
    case 'forest':
      filterNode.type = 'bandpass'
      filterNode.frequency.value = 3000
      filterNode.Q.value = 0.4
      break
    case 'fire':
      filterNode.type = 'lowpass'
      filterNode.frequency.value = 800
      filterNode.Q.value = 0.7
      break
    case 'ocean':
      filterNode.type = 'lowpass'
      filterNode.frequency.value = 600
      filterNode.Q.value = 0.5
      break
    case 'wind':
      filterNode.type = 'highpass'
      filterNode.frequency.value = 600
      filterNode.Q.value = 0.3
      break
  }

  // LFO for modulation
  const lfoOsc = ctx.createOscillator()
  const lfoGain = ctx.createGain()
  lfoOsc.type = 'sine'

  switch (layerId) {
    case 'thunder':
      lfoOsc.frequency.value = 0.05
      lfoGain.gain.value = 0.6
      lfoGain.connect(gainNode.gain)
      break
    case 'forest':
      lfoOsc.frequency.value = 0.2
      lfoGain.gain.value = 0.3
      lfoGain.connect(gainNode.gain)
      break
    case 'fire':
      lfoOsc.frequency.value = 4
      lfoGain.gain.value = 0.15
      lfoGain.connect(gainNode.gain)
      break
    case 'ocean':
      lfoOsc.frequency.value = 0.08
      lfoGain.gain.value = 200
      lfoGain.connect(filterNode.frequency)
      break
    case 'wind':
      lfoOsc.frequency.value = 0.15
      lfoGain.gain.value = 0.4
      lfoGain.connect(gainNode.gain)
      break
    default:
      lfoGain.gain.value = 0
      break
  }

  lfoOsc.connect(lfoGain)
  source.connect(filterNode)
  filterNode.connect(gainNode)
  gainNode.connect(masterGain)

  source.start()
  lfoOsc.start()

  return { source, gainNode, filterNode, lfoOsc, lfoGain }
}

export function useAmbientEngine() {
  const ctxRef = useRef<AudioContext | null>(null)
  const masterGainRef = useRef<GainNode | null>(null)
  const nodesRef = useRef<Partial<Record<LayerId, NodesEntry>>>({})
  const [playing, setPlaying] = useState(false)
  const [initialized, setInitialized] = useState(false)
  const [layerStates, setLayerStates] = useState<Record<LayerId, LayerState>>(() =>
    Object.fromEntries(LAYER_IDS.map(id => [id, { active: false, volume: 0.5 }])) as Record<LayerId, LayerState>
  )

  const initAudio = useCallback(() => {
    if (ctxRef.current) return
    const ctx = new AudioContext()
    const masterGain = ctx.createGain()
    masterGain.gain.value = 1
    masterGain.connect(ctx.destination)
    ctxRef.current = ctx
    masterGainRef.current = masterGain

    // Build all layer nodes upfront
    for (const id of LAYER_IDS) {
      const nodes = buildLayerNodes(ctx, id, masterGain)
      nodesRef.current[id] = { nodes, active: false }
    }

    setInitialized(true)
  }, [])

  const play = useCallback(() => {
    if (!ctxRef.current) initAudio()
    if (ctxRef.current?.state === 'suspended') {
      ctxRef.current.resume()
    }
    setPlaying(true)
  }, [initAudio])

  const pause = useCallback(() => {
    ctxRef.current?.suspend()
    setPlaying(false)
  }, [])

  const togglePlayPause = useCallback(() => {
    if (playing) pause()
    else play()
  }, [playing, play, pause])

  const setLayerVolume = useCallback((id: LayerId, volume: number) => {
    const entry = nodesRef.current[id]
    if (entry) {
      const ctx = ctxRef.current!
      const gainNode = entry.nodes.gainNode
      const active = entry.active
      const targetGain = active ? volume : 0
      gainNode.gain.cancelScheduledValues(ctx.currentTime)
      gainNode.gain.setTargetAtTime(targetGain, ctx.currentTime, 0.2)
    }
    setLayerStates(prev => ({ ...prev, [id]: { ...prev[id], volume } }))
  }, [])

  const toggleLayer = useCallback((id: LayerId) => {
    if (!ctxRef.current) {
      initAudio()
      setTimeout(() => toggleLayer(id), 100)
      return
    }
    const ctx = ctxRef.current
    const entry = nodesRef.current[id]
    if (!entry) return

    const newActive = !entry.active
    entry.active = newActive
    const volume = layerStates[id]?.volume ?? 0.5

    entry.nodes.gainNode.gain.cancelScheduledValues(ctx.currentTime)
    entry.nodes.gainNode.gain.setTargetAtTime(newActive ? volume : 0, ctx.currentTime, 0.2)

    if (newActive && !playing) {
      play()
    }

    setLayerStates(prev => ({ ...prev, [id]: { ...prev[id], active: newActive } }))
  }, [layerStates, playing, play, initAudio])

  const loadScene = useCallback((scene: SceneConfig) => {
    if (!ctxRef.current) {
      initAudio()
      setTimeout(() => loadScene(scene), 150)
      return
    }
    const ctx = ctxRef.current

    // Deactivate all layers first
    for (const id of LAYER_IDS) {
      const entry = nodesRef.current[id]
      if (!entry) continue
      const sceneVol = scene.layers[id]
      if (sceneVol !== undefined) {
        entry.active = true
        entry.nodes.gainNode.gain.cancelScheduledValues(ctx.currentTime)
        entry.nodes.gainNode.gain.setTargetAtTime(sceneVol, ctx.currentTime, 0.3)
      } else {
        entry.active = false
        entry.nodes.gainNode.gain.cancelScheduledValues(ctx.currentTime)
        entry.nodes.gainNode.gain.setTargetAtTime(0, ctx.currentTime, 0.3)
      }
    }

    const newStates = { ...layerStates }
    for (const id of LAYER_IDS) {
      const sceneVol = scene.layers[id]
      newStates[id] = {
        active: sceneVol !== undefined,
        volume: sceneVol ?? layerStates[id].volume,
      }
    }
    setLayerStates(newStates)

    if (!playing) play()
  }, [layerStates, playing, play, initAudio])

  return {
    playing,
    initialized,
    layerStates,
    togglePlayPause,
    toggleLayer,
    setLayerVolume,
    loadScene,
  }
}

interface NodesEntry {
  nodes: NoiseNodes
  active: boolean
}
