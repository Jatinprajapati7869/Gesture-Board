import { useEffect, useRef } from 'react';
import { useAnnotationStore } from '@/stores/useAnnotationStore';
import { usePresentationStore } from '@/stores/usePresentationStore';
import { cn } from '@/lib/cn';
import { CANVAS } from '@/lib/constants';
import type { Stroke } from '@/types';

interface AnnotationCanvasProps {
  className?: string;
}

export function AnnotationCanvas({ className }: AnnotationCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { currentPage } = usePresentationStore();
  const { tool, activeColor } = useAnnotationStore();

  // Resize canvas to match container exactly
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const { clientWidth, clientHeight } = containerRef.current;
      
      // Use devicePixelRatio for sharp rendering
      const dpr = window.devicePixelRatio || 1;
      
      canvasRef.current.width = clientWidth * dpr;
      canvasRef.current.height = clientHeight * dpr;
      
      // Force CSS size to match container
      canvasRef.current.style.width = `${clientWidth}px`;
      canvasRef.current.style.height = `${clientHeight}px`;
      
      // Re-render after resize
      renderCanvas();
    };

    // Initial resize and listener
    handleResize();
    window.addEventListener('resize', handleResize);
    
    // We also need to resize if the container's contents change, but window resize is a good proxy.
    // For a robust implementation, a ResizeObserver on the container is better.
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }
    
    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Main Render Loop
  const renderCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const dpr = window.devicePixelRatio || 1;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw completed strokes for this page
    const pageStrokes = useAnnotationStore.getState().strokes[usePresentationStore.getState().currentPage] || [];
    pageStrokes.forEach(stroke => drawStroke(ctx, stroke, width, height));
    
    // Draw current active stroke
    const currentStroke = useAnnotationStore.getState().currentStroke;
    if (currentStroke) {
      drawStroke(ctx, currentStroke, width, height);
    }
    
    // Draw cursor / laser pointer
    const cursorPosition = useAnnotationStore.getState().cursorPosition;
    if (cursorPosition) {
      const x = cursorPosition.x * width;
      const y = cursorPosition.y * height;
      
      if (tool === 'pointer') {
        // Laser pointer effect
        ctx.beginPath();
        ctx.arc(x, y, CANVAS.POINTER_RADIUS * dpr, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.8)';
        ctx.fill();
        
        // Outer glow
        ctx.beginPath();
        ctx.arc(x, y, CANVAS.POINTER_GLOW_RADIUS * dpr, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(239, 68, 68, 0.3)';
        ctx.fill();
      } else if (tool === 'pen') {
        // Brush preview
        ctx.beginPath();
        ctx.arc(x, y, (currentStroke?.width || CANVAS.DEFAULT_PEN_WIDTH) * dpr / 2, 0, Math.PI * 2);
        ctx.fillStyle = activeColor;
        ctx.fill();
      }
    }
  };

  // Render on data change via Zustand subscription to avoid React renders
  useEffect(() => {
    // Initial render
    renderCanvas();

    // Subscribe to all changes
    const unsubscribe = useAnnotationStore.subscribe(() => {
      renderCanvas();
    });

    return () => unsubscribe();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, tool, activeColor]);

  const drawStroke = (ctx: CanvasRenderingContext2D, stroke: Stroke, canvasWidth: number, canvasHeight: number) => {
    if (stroke.points.length === 0) return;
    
    const dpr = window.devicePixelRatio || 1;
    
    ctx.beginPath();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.width * dpr;
    
    const firstPt = stroke.points[0];
    ctx.moveTo(firstPt.x * canvasWidth, firstPt.y * canvasHeight);
    
    for (let i = 1; i < stroke.points.length; i++) {
      const pt = stroke.points[i];
      ctx.lineTo(pt.x * canvasWidth, pt.y * canvasHeight);
    }
    
    ctx.stroke();
  };

  return (
    <div ref={containerRef} className={cn("absolute inset-0 pointer-events-none z-10", className)}>
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}

