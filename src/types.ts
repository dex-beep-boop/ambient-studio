export type LayerId = 'rain' | 'thunder' | 'forest' | 'fire' | 'ocean' | 'wind'

export interface LayerConfig {
  id: LayerId
  label: string
  emoji: string
  defaultVolume: number
}

export interface SceneConfig {
  id: string
  label: string
  emoji: string
  layers: Partial<Record<LayerId, number>>
}

export interface LayerState {
  active: boolean
  volume: number
}
