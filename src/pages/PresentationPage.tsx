import { useState, useRef, useEffect, type ChangeEvent } from 'react';
import { PDFViewer, AnnotationCanvas, useGestureIntegration } from '@/features/presentation';
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

    // Revoke old blob URL to prevent memory leak (W7)
    if (fileUrl) URL.revokeObjectURL(fileUrl);

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

  // Revoke blob URL on unmount to prevent memory leak (W7)
  useEffect(() => {
    return () => {
      if (fileUrl) URL.revokeObjectURL(fileUrl);
    };
  }, [fileUrl]);

  // Update total pages when PDF document loads (W1 — uses dedicated action instead of fragile setFile cycle)
  useEffect(() => {
    if (pdfDocument && file && file.totalPages === 0) {
      setTotalPages(pdfDocument.numPages);
    }
  }, [pdfDocument, file, setTotalPages]);

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-text-primary tracking-tight flex items-center gap-3">
            <PresentationIcon className="w-8 h-8 text-brand-500" />
            Presentation Mode
          </h1>
          <p className="text-text-secondary">
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
              <h3 className="text-lg font-medium text-text-primary mb-2">
                Upload your slides
              </h3>
              <p className="text-sm text-text-secondary mb-6">
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
            <Card padding="none" className="flex-1 p-2 bg-surface-secondary overflow-hidden relative">
              <PDFViewer fileUrl={fileUrl} className="w-full h-full object-contain relative z-0" />
              <AnnotationCanvas className="z-10" />
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
                <div className="font-mono text-sm font-medium text-text-secondary">
                  Slide {currentPage} <span className="text-text-tertiary">/ {file?.totalPages || '?'}</span>
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
              
              <Badge variant={currentGesture.type !== 'none' ? 'brand' : 'default'}>
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

            <Card title="Annotation Tools" padding="md">
              <div className="flex gap-2">
                <Button 
                  variant={tool === 'pointer' ? 'primary' : 'secondary'} 
                  className="flex-1"
                  onClick={() => setTool('pointer')}
                >
                  Laser
                </Button>
                <Button 
                  variant={tool === 'pen' ? 'primary' : 'secondary'} 
                  className="flex-1"
                  onClick={() => setTool('pen')}
                >
                  Pen
                </Button>
                <Button 
                  variant="secondary" 
                  className="flex-1"
                  onClick={() => clearPage(currentPage)}
                >
                  Clear
                </Button>
              </div>
            </Card>

            <Card title="Gesture Controls" padding="md">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary border border-border-default">
                  <span className="text-sm font-medium text-text-primary">Next Slide</span>
                  <Badge variant="brand">Peace</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary border border-border-default">
                  <span className="text-sm font-medium text-text-primary">Prev Slide</span>
                  <Badge variant="brand">Open Palm</Badge>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-surface-secondary border border-border-default">
                  <span className="text-sm font-medium text-text-primary">Draw/Laser</span>
                  <Badge variant="brand">Pinch / Point</Badge>
                </div>
              </div>
            </Card>

            {file && (
              <Card title="Deck Info" padding="md">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Name</span>
                    <span className="text-text-primary truncate max-w-[150px]" title={file.name}>
                      {file.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-text-tertiary">Size</span>
                    <span className="text-text-primary">
                      {(file.fileSize / 1024 / 1024).toFixed(2)} MB
                    </span>
                  </div>
                  <div className="flex justify-between">
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
