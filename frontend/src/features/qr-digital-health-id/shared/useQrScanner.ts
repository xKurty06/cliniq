import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

type ScannerStatus = 'idle' | 'starting' | 'scanning' | 'error'

export interface UseQrScannerResult {
  videoRef: RefObject<HTMLVideoElement | null>
  status: ScannerStatus
  error: string | null
  start: () => Promise<void>
  stop: () => void
}

/**
 * Thin `qr-scanner` wrapper. The library is dynamically imported only when the user starts the
 * camera, so non-QR screens and tests don't pay the camera/scanner cost up front.
 */
export function useQrScanner(onDetected: (value: string) => void): UseQrScannerResult {
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const scannerRef = useRef<{ start: () => Promise<void>; stop: () => void; destroy: () => void } | null>(
    null,
  )
  const [status, setStatus] = useState<ScannerStatus>('idle')
  const [error, setError] = useState<string | null>(null)

  const stop = useCallback(() => {
    scannerRef.current?.stop()
    setStatus('idle')
  }, [])

  const start = useCallback(async () => {
    if (!videoRef.current) return
    setStatus('starting')
    setError(null)
    try {
      const { default: QrScanner } = await import('qr-scanner')
      scannerRef.current?.destroy()
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result: { data: string } | string) => {
          const value = typeof result === 'string' ? result : result.data
          onDetected(value)
          stop()
        },
        { highlightScanRegion: true, highlightCodeOutline: true },
      )
      await scannerRef.current.start()
      setStatus('scanning')
    } catch {
      setStatus('error')
      setError('Camera scan is unavailable. Enter the Student Number manually.')
    }
  }, [onDetected, stop])

  useEffect(() => {
    return () => scannerRef.current?.destroy()
  }, [])

  return { videoRef, status, error, start, stop }
}
