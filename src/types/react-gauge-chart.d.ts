declare module 'react-gauge-chart' {
  import { FC } from 'react'

  export interface GaugeChartProps {
    id?: string
    className?: string
    style?: React.CSSProperties
    marginInPercent?: number
    cornerRadius?: number
    nrOfLevels?: number
    percent?: number
    arcPadding?: number
    arcWidth?: number
    colors?: string[]
    textColor?: string
    needleColor?: string
    needleBaseColor?: string
    hideText?: boolean
    animate?: boolean
    animDelay?: number
    formatTextValue?: (value: string) => string
    arcsLength?: number[]
    arcOverdraw?: boolean
  }

  const GaugeChart: FC<GaugeChartProps>
  export default GaugeChart
}
