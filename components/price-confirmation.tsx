import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

interface PriceConfirmationProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  duration: number
  fileName: string
}

function calculatePrice(durationInSeconds: number): number {
  const basePrice = 1
  const pricePerMinute = 0.1
  const minutes = Math.ceil(durationInSeconds / 60)
  return basePrice + minutes * pricePerMinute
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}h ${minutes}m ${remainingSeconds}s`
  }
  if (minutes > 0) {
    return `${minutes}m ${remainingSeconds}s`
  }
  return `${remainingSeconds}s`
}

export function PriceConfirmation({
  isOpen,
  onClose,
  onConfirm,
  duration,
  fileName,
}: PriceConfirmationProps) {
  const price = calculatePrice(duration)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Transcription</DialogTitle>
          <DialogDescription className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <span className="text-muted-foreground">File:</span>
              <span>{fileName}</span>
              <span className="text-muted-foreground">Duration:</span>
              <span>{formatDuration(duration)}</span>
              <span className="text-muted-foreground">Base price:</span>
              <span>$1.00</span>
              <span className="text-muted-foreground">Duration price:</span>
              <span>${(price - 1).toFixed(2)}</span>
              <span className="text-muted-foreground font-semibold">
                Total price:
              </span>
              <span className="font-semibold">${price.toFixed(2)}</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm}>Confirm (${price.toFixed(2)})</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
