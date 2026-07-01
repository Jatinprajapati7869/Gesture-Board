import { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { usePresentationStore } from '@/stores/usePresentationStore';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

// Setup PDF.js worker
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.mjs?url';

if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorkerUrl;
}

interface PDFViewerProps {
  fileUrl: string | null;
  className?: string;
}

export function PDFViewer({ fileUrl, className }: PDFViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { currentPage, setPdfDocument, pdfDocument } = usePresentationStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Track container width for responsive PDF rendering
  useEffect(() => {
    if (!containerRef.current) return;
    
    // We use a small debounce/throttle in ResizeObserver implicitly by React batching,
    // but setting state directly is fine since it's just width.
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Load PDF Document
  useEffect(() => {
    if (!fileUrl) return;
    
    let isMounted = true;
    setIsLoading(true);
    setError(null);

    const loadPDF = async () => {
      try {
        const loadingTask = pdfjsLib.getDocument({ url: fileUrl });
        const doc = await loadingTask.promise;
        if (isMounted) {
          setPdfDocument(doc);
          setIsLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError('Failed to load PDF');
          setIsLoading(false);
          console.error('Error loading PDF:', err);
        }
      }
    };

    loadPDF();

    return () => {
      isMounted = false;
    };
  }, [fileUrl, setPdfDocument]);

  // Render Page
  useEffect(() => {
    if (!pdfDocument || !canvasRef.current || !containerRef.current) return;
    
    let isMounted = true;
    let renderTask: pdfjsLib.RenderTask | null = null;
    
    const renderPage = async () => {
      setIsLoading(true);
      try {
        const page = await pdfDocument.getPage(currentPage);
        
        if (!isMounted) return;
        
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Calculate scale to fit container width
        const containerWidth = containerRef.current!.clientWidth;
        const unscaledViewport = page.getViewport({ scale: 1.0 });
        const scale = containerWidth / unscaledViewport.width;
        const viewport = page.getViewport({ scale });
        
        // Support HiDPI displays
        const outputScale = window.devicePixelRatio || 1;
        
        canvas.width = Math.floor(viewport.width * outputScale);
        canvas.height = Math.floor(viewport.height * outputScale);
        
        // Use CSS to scale the canvas down
        canvas.style.width = Math.floor(viewport.width) + "px";
        canvas.style.height =  Math.floor(viewport.height) + "px";

        const transform = outputScale !== 1
          ? [outputScale, 0, 0, outputScale, 0, 0]
          : null;

        const renderContext = {
          canvasContext: ctx,
          canvas: canvas,
          transform: transform || undefined,
          viewport: viewport
        };
        
        const currentTask = page.render(renderContext);
        renderTask = currentTask;
        await currentTask.promise;
        
        if (isMounted) {
          setIsLoading(false);
        }
      } catch (err) {
        // Ignore CancelledException when rendering is interrupted by page change
        if (err instanceof Error && err.name === 'RenderingCancelledException') {
          return;
        }
        if (isMounted) {
          setError('Failed to render page');
          setIsLoading(false);
          console.error('Error rendering page:', err);
        }
      }
    };

    renderPage();

    return () => {
      isMounted = false;
      renderTask?.cancel();
    };
  }, [pdfDocument, currentPage, containerWidth]);

  if (!fileUrl) {
    return (
      <div className={cn("flex flex-col items-center justify-center h-full min-h-[400px] border-2 border-dashed border-border-default rounded-xl bg-surface-secondary text-text-tertiary", className)}>
        <p>No presentation loaded</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className={cn("relative w-full h-full min-h-[400px] flex items-center justify-center bg-surface-secondary rounded-xl overflow-hidden shadow-inner", className)}
    >
      <canvas 
        ref={canvasRef} 
        className={cn("max-w-full shadow-lg transition-opacity duration-300", isLoading ? "opacity-50" : "opacity-100")} 
      />
      
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 backdrop-blur-[1px]">
          <Loader2 className="w-8 h-8 text-interactive-primary animate-spin" />
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-surface-secondary">
          <p className="text-feedback-error font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}
