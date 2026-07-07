import React, { useRef, useEffect } from 'react'
import { Card } from '../../ui/card'
import { Button } from '../../ui/button'
import { Slider } from '../../ui/slider'

export const EQ_BANDS = [
  { frequency: 60, Q: 1.0, label: '60' },
  { frequency: 200, Q: 1.4, label: '200' },
  { frequency: 500, Q: 1.4, label: '500' },
  { frequency: 1500, Q: 1.4, label: '1.5k' },
  { frequency: 4000, Q: 1.4, label: '4k' },
  { frequency: 8000, Q: 1.4, label: '8k' },
  { frequency: 16000, Q: 1.4, label: '16k' },
]

export const EQ_PRESETS = {
  flat:  [ 0,  0,  0,  0,  0,  0,  0],
  voice: [-6, -2,  3,  5,  3, -2, -3],
  keys:  [ 0,  2,  2,  2,  0,  0,  0],
  horns: [-8,  2,  3,  4,  2,  0, -3],
  bass:  [ 6,  4,  0, -3, -5, -6, -8],
  drums: [ 5,  2, -2,  0,  3, -1,  0],
}

function eqResponseAt(f, gains) {
  return EQ_BANDS.reduce((sum, band, i) => {
    const lf = Math.log10(f)
    const lf0 = Math.log10(band.frequency)
    const bw = 1 / (band.Q * 2.8)
    return sum + gains[i] / (1 + Math.pow((lf - lf0) / bw, 2))
  }, 0)
}

function drawCanvas(canvas, gains, analyserNode) {
  const ctx = canvas.getContext('2d')
  const W = canvas.width
  const H = canvas.height

  ctx.clearRect(0, 0, W, H)

  const freqToX = f => (Math.log10(f / 20) / Math.log10(1000)) * W
  const dbToY = db => H / 2 - (db / 15) * (H / 2) * 0.88

  // grid
  ctx.strokeStyle = 'rgba(128,128,128,0.2)'
  ctx.lineWidth = 1
  for (const db of [-12, -6, 6, 12]) {
    const y = dbToY(db)
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(W, y)
    ctx.stroke()
  }
  for (const f of [100, 1000, 10000]) {
    const x = freqToX(f)
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, H)
    ctx.stroke()
  }

  // 0 dB line
  ctx.strokeStyle = 'rgba(128,128,128,0.4)'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(0, dbToY(0))
  ctx.lineTo(W, dbToY(0))
  ctx.stroke()

  // FFT bars beneath EQ curve
  if (analyserNode) {
    const binCount = analyserNode.frequencyBinCount
    const data = new Uint8Array(binCount)
    analyserNode.getByteFrequencyData(data)
    const sampleRate = analyserNode.context.sampleRate
    const fftSize = analyserNode.fftSize

    ctx.fillStyle = 'rgba(16,185,129,0.25)'
    for (let px = 0; px < W; px++) {
      const f = 20 * Math.pow(1000, px / W)
      const bin = Math.min(Math.round((f / sampleRate) * fftSize), binCount - 1)
      const magnitude = data[bin] / 255
      const barH = magnitude * H
      ctx.fillRect(px, H - barH, 1, barH)
    }
  }

  // EQ curve
  const points = []
  for (let px = 0; px < W; px++) {
    const f = 20 * Math.pow(1000, px / W)
    points.push([px, dbToY(eqResponseAt(f, gains))])
  }

  ctx.fillStyle = 'rgba(16,185,129,0.1)'
  ctx.beginPath()
  ctx.moveTo(0, dbToY(0))
  for (const [x, y] of points) ctx.lineTo(x, y)
  ctx.lineTo(W, dbToY(0))
  ctx.closePath()
  ctx.fill()

  ctx.strokeStyle = 'rgb(16,185,129)'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.moveTo(points[0][0], points[0][1])
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1])
  ctx.stroke()
}

export function EqualizerCard({
  gains,
  onBandChange,
  activePreset,
  onPresetChange,
  playerRef,
}) {
  const canvasRef = useRef(null)
  const gainsRef = useRef(gains)
  useEffect(() => { gainsRef.current = gains }, [gains])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    let animId
    function frame() {
      const analyser = playerRef?.current?._analyserNode ?? null
      drawCanvas(canvas, gainsRef.current, analyser)
      animId = requestAnimationFrame(frame)
    }
    animId = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(animId)
  }, [playerRef])

  return (
    <Card className='flex flex-col gap-3 p-4'>
      <div className='text-xs font-medium text-muted-foreground'>Equalizer</div>

      <div className='flex gap-1 flex-wrap'>
        {Object.keys(EQ_PRESETS).map(preset => (
          <Button
            key={preset}
            variant={activePreset === preset ? 'default' : 'outline'}
            size='xs'
            onClick={() => onPresetChange(preset)}
          >
            {preset.charAt(0).toUpperCase() + preset.slice(1)}
          </Button>
        ))}
      </div>

      <canvas
        ref={canvasRef}
        width={400}
        height={80}
        className='w-full rounded border border-border'
        style={{ height: '80px' }}
      />

      <div className='flex justify-around items-end gap-1'>
        {EQ_BANDS.map((band, i) => (
          <div
            key={band.frequency}
            className='flex flex-col items-center gap-1'
          >
            <div className='text-xs tabular-nums text-muted-foreground w-6 text-center'>
              {gains[i] > 0 ? '+' : ''}
              {gains[i]}
            </div>
            <Slider
              orientation='vertical'
              min={-12}
              max={12}
              step={1}
              value={[gains[i]]}
              onValueChange={val => onBandChange(i, val[0])}
              className='h-24'
            />
            <div className='text-xs text-muted-foreground'>{band.label}</div>
          </div>
        ))}
      </div>
    </Card>
  )
}
