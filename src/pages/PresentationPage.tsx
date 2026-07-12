import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { PDFViewer, AnnotationCanvas, useGestureIntegration, DemoControls } from '@/features/presentation';
import { WebcamPreview } from '@/features/hand-tracking';
import { usePresentationStore } from '@/stores/usePresentationStore';
import { useGestureStore } from '@/stores/useGestureStore';
import { useAnnotationStore } from '@/stores/useAnnotationStore';
import { PRESENTATION } from '@/lib/constants';
import { Card, Button, Badge } from '@/components/ui';
import { Upload, ChevronLeft, ChevronRight, Maximize2, Presentation as PresentationIcon } from 'lucide-react';

export function PresentationPage() {
  useGestureIntegration();
  const { currentGesture } = useGestureStore();
  const { tool, setTool, clearPage } = useAnnotationStore();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    file, 
    setFile, 
    setTotalPages,
    currentPage, 
    pdfDocument, 
    nextPage, 
    prevPage 
  } = usePresentationStore();

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile || !PRESENTATION.SUPPORTED_TYPES.includes(uploadedFile.type)) {
      alert('Please select a valid PDF file.');
      return;
    }

    if (uploadedFile.size > PRESENTATION.MAX_FILE_SIZE) {
      alert(`File too large. Maximum size is ${Math.round(PRESENTATION.MAX_FILE_SIZE / 1024 / 1024)}MB.`);
      return;
    }

    if (fileUrl) URL.revokeObjectURL(fileUrl);

    const url = URL.createObjectURL(uploadedFile);
    setFileUrl(url);
    setFile({
      name: uploadedFile.name,
      totalPages: 0,
      fileSize: uploadedFile.size,
      loadedAt: Date.now(),
    });
  };

  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  useEffect(() => {
    if (pdfDocument && file && file.totalPages === 0) {
      setTotalPages(pdfDocument.numPages);
    }
  }, [pdfDocument, file, setTotalPages]);

  const hasDeck = Boolean(fileUrl);

  return (
    <div className="mx-auto flex h-full max-w-6xl flex-col gap-6 p-8">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-text-primary">
            <PresentationIcon className="h-8 w-8 text-brand-500" />
            Presentation Mode
          </h1>
          <p className="text-text-secondary">
            Upload a PDF deck and control slides with camera gestures or fallback demo buttons.
          </p>
        </div>

        {hasDeck && (
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload className="mr-2 h-4 w-4" />
              Change Deck
            </Button>
            <Button variant="primary">
              <Maximize2 className="mr-2 h-4 w-4" />
              Enter Fullscreen
            </Button>
          </div>
        )}
      </div>

      {!hasDeck ? (
        <Card padding="none" className="flex flex-1 items-center justify-center border-dashed">
          <div className="max-w-sm space-y-6 text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-brand-500/10">
              <Upload className="h-10 w-10 text-brand-500" />
            </div>
            <div>
              <h3 className="mb-2 text-lg font-medium text-text-primary">Upload your slides</h3>
              <p className="mb-6 text-sm text-text-secondary">
                Select a PDF presentation to get started. All processing happens locally in your browser.
              </p>
              <Button onClick={() => fileInputRef.current?.click()} className="w-full">
                Select PDF File
              </Button>
              <input
                type="file"
                accept="application/pdf"
                className="hidden"
                ref={fileInputRef}
                onChange={handleFileUpload}
              />
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-4">
          <div className="min-h-0 space-y-6 lg:col-span-3">
            <Card padding="none" className="relative flex-1 overflow-hidden bg-surface-secondary p-2">
              <PDFViewer fileUrl={fileUrl} className="relative z-0 h-full w-full object-contain" />
              <AnnotationCanvas className="z-10" />
            </Card>

            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <Button variant="secondary" size="icon" onClick={prevPage} disabled={currentPage <= 1} aria-label="Previous Slide">
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <div className="font-mono text-sm font-medium text-text-secondary">
                  Slide {currentPage} <span className="text-text-tertiary">/ {file?.totalPages || '?'}</span>
                </div>
                <Button
                  variant="secondary"
                  size="icon"
                  onClick={nextPage}
                  disabled={!!file && currentPage >= file.totalPages}
                  aria-label="Next Slide"
                >
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </div>

              <div aria-live="polite" aria-atomic="true">
                <Badge variant={currentGesture.type !== 'none' ? 'brand' : 'default'}>
                  {currentGesture.type !== 'none' ? 'Gesture Detected' : 'Gestures Active'}
                </Badge>
              </div>
            </div>
          </div>

          <div className="space-y-6 overflow-y-auto pr-2">
            <Card padding="none" className="relative aspect-video overflow-hidden bg-black">
              <WebcamPreview className="h-full w-full object-cover" />
              <div className="absolute bottom-2 right-2" aria-live="polite" aria-atomic="true">
                <Badge variant={currentGesture.type !== 'none' ? 'brand' : 'default'} className="bg-black/80 backdrop-blur">
                  {currentGesture.type.replace('_', ' ')}
                </Badge>
              </div>
            </Card>

            <DemoControls />

            <Card title="Annotation Tools" padding="md">
              <div className="flex gap-2">
                <Button variant={tool === 'pointer' ? 'primary' : 'secondary'} className="flex-1" onClick={() => setTool('pointer')}>
                  Laser
                </Button>
                <Button variant={tool === 'pen' ? 'primary' : 'secondary'} className="flex-1" onClick={() => setTool('pen')}>
                  Pen
                </Button>
                <Button variant={tool === 'highlighter' ? 'primary' : 'secondary'} className="flex-1" onClick={() => setTool('highlighter')}>
                  Highlight
                </Button>
                <Button variant="secondary" className="flex-1" onClick={() => clearPage(currentPage)}>
                  Clear
                </Button>
              </div>
            </Card>

            <Card title="Gesture Controls" padding="md">
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border border-border-default bg-surface-secondary p-3">
                  <span className="text-sm font-medium text-text-primary">Next Slide</span>
                  <Badge variant="brand">Peace</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border-default bg-surface-secondary p-3">
                  <span className="text-sm font-medium text-text-primary">Prev Slide</span>
                  <Badge variant="brand">Open Palm</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border-default bg-surface-secondary p-3">
                  <span className="text-sm font-medium text-text-primary">Draw/Laser</span>
                  <Badge variant="brand">Pinch / Point</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border border-border-default bg-surface-secondary p-3">
                  <span className="text-sm font-medium text-text-primary">Highlight</span>
                  <Badge variant="brand">Thumbs Up</Badge>
                </div>
              </div>
            </Card>

            {file && (
              <Card title="Deck Info" padding="md">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between gap-3">
                    <span className="text-text-tertiary">Name</span>
                    <span className="max-w-[150px] truncate text-text-primary" title={file.name}>{file.name}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-text-tertiary">Size</span>
                    <span className="text-text-primary">{(file.fileSize / 1024 / 1024).toFixed(2)} MB</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span className="text-text-tertiary">Pages</span>
                    <span className="text-text-primary">{file.totalPages}</span>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}