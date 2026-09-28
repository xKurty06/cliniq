import { useState, type FormEvent } from 'react'
import { Button, Card, CardBody, CardHeader, Icon, Input } from '../../../components'
import type { StudentNumber } from '../../../types/entities'
import { demoStudentNumber } from '../api/qrLookupApi'
import { useQrScanner } from './useQrScanner'

export interface QrScannerViewProps {
  title: string
  description: string
  onDetected: (studentNumber: StudentNumber) => void
}

function normalize(value: string): StudentNumber {
  return value.trim().toUpperCase()
}

/**
 * Shared QR scanner/manual fallback component. Mobile Staff, mobile Instructor, and later desktop
 * scanner flows all use this same wrapper; only their post-scan behavior differs.
 */
export function QrScannerView({ title, description, onDetected }: QrScannerViewProps) {
  const [manual, setManual] = useState('')
  const { videoRef, status, error, start, stop } = useQrScanner((value) => onDetected(normalize(value)))

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (manual.trim()) onDetected(normalize(manual))
  }

  return (
    <Card aria-labelledby="qr-scanner-title">
      <CardHeader
        titleId="qr-scanner-title"
        title={title}
        description={description}
        icon={<Icon name="qrCode" />}
      />
      <CardBody className="flex flex-col gap-4">
        <div className="overflow-hidden rounded-lg border border-border bg-text-primary">
          <video
            ref={videoRef}
            className="aspect-[4/3] w-full bg-text-primary object-cover"
            muted
            playsInline
          />
        </div>
        {error && <p className="text-xs font-semibold text-error">{error}</p>}
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <Button
            type="button"
            variant="primary"
            icon="qrCode"
            loading={status === 'starting'}
            onClick={status === 'scanning' ? stop : start}
          >
            {status === 'scanning' ? 'Stop camera' : 'Scan QR Code'}
          </Button>
          <Button type="button" variant="secondary" onClick={async () => onDetected(await demoStudentNumber())}>
            Use demo scan
          </Button>
        </div>
        <form className="flex flex-col gap-2" onSubmit={onSubmit}>
          <Input
            label="Enter Student Number manually"
            value={manual}
            placeholder="2026-00001"
            onChange={(event) => setManual(event.target.value)}
          />
          <Button type="submit" variant="secondary">
            Look up student
          </Button>
        </form>
      </CardBody>
    </Card>
  )
}
