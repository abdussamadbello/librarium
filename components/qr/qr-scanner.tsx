'use client'

import { useState, useEffect, useRef } from 'react'
import { Html5Qrcode } from 'html5-qrcode'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Camera, X } from 'lucide-react'

interface QRScannerProps {
  onScan: (data: string) => void
  onError?: (error: string) => void
}

export function QRScanner({ onScan, onError }: QRScannerProps) {
  const [isScanning, setIsScanning] = useState(false)
  const [hasPermission, setHasPermission] = useState<boolean | null>(null)
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const qrRegionId = 'qr-reader'

  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (scannerRef.current && isScanning) {
        scannerRef.current.stop().catch(console.error)
      }
    }
  }, [isScanning])

  const startScanning = async () => {
    try {
      // Check camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ video: true })
      stream.getTracks().forEach((track) => track.stop())
      setHasPermission(true)

      // Initialize scanner
      const scanner = new Html5Qrcode(qrRegionId)
      scannerRef.current = scanner

      await scanner.start(
        { facingMode: 'environment' }, // Use back camera
        {
          fps: 10, // Frames per second
          qrbox: { width: 250, height: 250 }, // QR box size
        },
        (decodedText) => {
          // Success callback
          onScan(decodedText)
          stopScanning()
        },
        (errorMessage) => {
          // Error callback (for scanning errors, not critical)
          // We don't want to spam the console with these
        }
      )

      setIsScanning(true)
    } catch (error: any) {
      console.error('Error starting scanner:', error)
      setHasPermission(false)
      onError?.(error.message || 'Failed to access camera')
    }
  }

  const stopScanning = async () => {
    if (scannerRef.current && isScanning) {
      try {
        await scannerRef.current.stop()
        scannerRef.current.clear()
        setIsScanning(false)
      } catch (error) {
        console.error('Error stopping scanner:', error)
      }
    }
  }

  return (
    <Card className="p-6">
      <div className="space-y-4">
        {!isScanning ? (
          <div className="text-center">
            {hasPermission === false && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">
                  Camera permission denied. Please enable camera access in your browser settings.
                </p>
              </div>
            )}
            <div className="w-full h-64 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
              <Camera className="w-16 h-16 text-slate-400" />
            </div>
            <Button
              onClick={startScanning}
              className="bg-teal-600 hover:bg-teal-700"
            >
              <Camera className="w-4 h-4 mr-2" />
              Start Scanning
            </Button>
          </div>
        ) : (
          <div>
            <div
              id={qrRegionId}
              className="w-full rounded-lg overflow-hidden border-2 border-teal-600"
            />
            <div className="mt-4 text-center">
              <p className="text-sm text-slate-600 mb-3">
                Position the QR code within the frame
              </p>
              <Button
                onClick={stopScanning}
                variant="outline"
              >
                <X className="w-4 h-4 mr-2" />
                Stop Scanning
              </Button>
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
