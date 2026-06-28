import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { PDFViewer, useGestureIntegration } from '@/features/presentation';
import { WebcamPreview } from '@/features/hand-tracking';
import { usePresentationStore } from '@/stores/usePresentationStore';
import { useGestureStore } from '@/stores/useGestureStore';
import { Card, Button, Badge } from '@/components/ui';
import { Upload, ChevronLeft, ChevronRight, Maximize2, Presentation as PresentationIcon } from 'lucide-react';

export function PresentationPage() {
  useGestureIntegration();
  const { currentGesture } = useGestureStore();
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    file, 
    setFile, 
    currentPage, 
    pdfDocument, 
    nextPage, 
    prevPage 
  } = usePresentationStore();

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile || uploadedFile.type !== 'application/pdf') {
      alert('Please select a valid PDF file.');
      return;
    }

    const url = URL.createObjectURL(uploadedFile);
    setFileUrl(url);
    
    // We get total pages via pdfjs in PDFViewer, but we can set basic file metadata now
    setFile({
      name: uploadedFile.name,
      totalPages: 0, // Will be updated when PDF loads
      fileSize: uploadedFile.size,
      loadedAt: Date.now()
    });
  };

  // Listen for pdf document load to update total pages
  useEffect(() => {
    if (pdfDocument && file && file.totalPages === 0) {
      setFile({
        ...file,
        totalPages: pdfDocument.numPages
      });
    }
  }, [pdfDocument, file, setFile]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-[var(--gb-text-primary)] tracking-tight flex items-center gap-3">
            <PresentationIcon className="w-8 h-8 text-brand-500" />
            Presentation Mode
          </h1>
          <p className="text-[var(--gb-text-secondary)]">
            Upload your PDF deck. Use gestures to navigate slides without touching your keyboard.
          </p>
        </div>
        
        {fileUrl && (
          <div className="flex items-center gap-3">
            <Button variant="secondary" onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Change Deck
            </Button>
            <Button variant="primary">
              <Maximize2 className="w-4 h-4 mr-2" />
              Enter Fullscreen
            </Button>
          </div>
        )}
      </div>

      {!fileUrl ? (
        <Card padding="none" className="flex-1 flex items-center justify-center border-dashed">
          <div className="text-center space-y-6 max-w-sm">
            <div className="w-20 h-20 bg-brand-500/10 rounded-full flex items-center justify-center mx-auto">
              <Upload className="w-10 h-10 text-brand-500" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-[var(--gb-text-primary)] mb-2">
                Upload your slides
              </h3>
              <p className="text-sm text-[var(--gb-text-secondary)] mb-6">
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
          {/* Main Slide Area */}
          <div className="lg:col-span-3 flex flex-col gap-4 min-h-0">
            <Card padding="none" className="flex-1 p-2 bg-[var(--gb-bg-secondary)] overflow-hidden">
              <PDFViewer fileUrl={fileUrl} className="w-full h-full object-contain" />
            </Card>
            
            {/* Slide Navigation Controls */}
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-4">
                <Button 
                  variant="secondary" 
                  size="icon" 
                  onClick={prevPage}
                  disabled={currentPage <= 1}
                >
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="font-mono text-sm font-medium text-[var(--gb-text-secondary)]">
                  Slide {currentPage} <span className="text-[var(--gb-text-tertiary)]">/ {file?.totalPages || '?'}</span>
                </div>
                <Button 
                  variant="secondary" 
                  size="icon" 
                  onClick={nextPage}
                  disabled={!!file && currentPage >= file.totalPages}
                >
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </div>
              
              <Badge variant={currentGesture.type !== 'none' ? 'brand' : 'default'} dot>
                {currentGesture.type !== 'none' ? 'Gesture Detected' : 'Gestures Active'}
              </Badge>
            </div>
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6 overflow-y-auto pr-2">
            <Card padding="none" className="overflow-hidden bg-black aspect-video relative">
              <WebcamPreview className="w-full h-full object-cover" />
              <div className="absolute bottom-2 right-2">
                <Badge variant={currentGesture.type !== 'none' ? 'brand' : 'default'} className="bg-black/80 backdrop-blur">
                  {currentGesture.type.replace('_', ' ')}
                </Badge>
              </div>
            </Card>

            <Card title="Gesture Controls" padding="md">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--gb-bg-secondary)] border border-[var(--gb-border)]">
                  <span className="text-sm font-medium text-[var(--gb-text-primary)]">Next Slide</span>
                  <Badge variant="brand">Swipe Right</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--gb-bg-secondary)] border border-[var(--gb-border)]">
                  <span className="text-sm font-medium text-[var(--gb-text-primary)]">Prev Slide</span>
                  <Badge variant="brand">Swipe Left</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-[var(--gb-bg-secondary)] border border-[var(--gb-border)]">
                  <span className="text-sm font-medium text-[var(--gb-text-primary)]">Laser Pointer</span>
                  <Badge variant="brand">Point</Badge>
                </div>
              </div>
            </Card>

            {file && (
              <Card title="Deck Info" padding="md">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-[var(--gb-text-tertiary)]">Name</span>
                    <span className="text-[var(--gb-text-primary)] truncate max-w-[150px]" title={file.name}>
                      {file.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--gb-text-tertiary)]">Size</span>
                    <span className="text-[var(--gb-text-primary)]">
                      {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[var(--gb-text-tertiary)]">Pages</span>
                    <span className="text-[var(--gb-text-primary)]">{file.totalPages}</span>
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
