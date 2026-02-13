import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, CaretLeft, CaretRight } from '@phosphor-icons/react'
import { useState } from 'react'

interface ImagePreviewDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  images: string[]
  title?: string
}

export function ImagePreviewDialog({ open, onOpenChange, images, title }: ImagePreviewDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  if (images.length === 0) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl max-h-[95vh] p-0 bg-black/95 border-0">
        <div className="relative h-full flex items-center justify-center p-8">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={() => onOpenChange(false)}
          >
            <X size={24} weight="bold" />
          </Button>

          {title && (
            <div className="absolute top-4 left-4 text-white text-sm bg-black/50 px-3 py-1.5 rounded">
              {title}
            </div>
          )}

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={handlePrevious}
              >
                <CaretLeft size={32} weight="bold" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/20"
                onClick={handleNext}
              >
                <CaretRight size={32} weight="bold" />
              </Button>
            </>
          )}

          <div className="flex flex-col items-center gap-4 w-full">
            <img
              src={images[currentIndex]}
              alt={`Podgląd ${currentIndex + 1}`}
              className="max-w-full max-h-[80vh] object-contain rounded"
            />
            {images.length > 1 && (
              <div className="text-white text-sm bg-black/50 px-3 py-1 rounded">
                {currentIndex + 1} / {images.length}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
