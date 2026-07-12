import { ChevronLeft, ChevronRight, Highlighter, MousePointer2, PenLine, Eraser } from 'lucide-react';
import { Badge, Button, Card } from '@/components/ui';
import { useAnnotationStore } from '@/stores/useAnnotationStore';
import { usePresentationStore } from '@/stores/usePresentationStore';

export function DemoControls() {
  const currentPage = usePresentationStore((s) => s.currentPage);
  const file = usePresentationStore((s) => s.file);
  const nextPage = usePresentationStore((s) => s.nextPage);
  const prevPage = usePresentationStore((s) => s.prevPage);
  const clearPage = useAnnotationStore((s) => s.clearPage);
  const setTool = useAnnotationStore((s) => s.setTool);
  const tool = useAnnotationStore((s) => s.tool);

  const totalPages = file?.totalPages ?? 0;

  return (
    <Card title="Demo Mode" padding="md">
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-text-primary">No camera required</p>
            <p className="mt-1 text-xs leading-relaxed text-text-tertiary">
              Use these buttons when camera permissions are blocked or you want to review the
              product without hand tracking.
            </p>
          </div>
          <Badge variant="default">Fallback</Badge>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={prevPage} disabled={!file || currentPage <= 1}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          <Button variant="secondary" onClick={nextPage} disabled={!file || currentPage >= totalPages}>
            <ChevronRight className="mr-2 h-4 w-4" />
            Next
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <Button variant={tool === 'pointer' ? 'primary' : 'secondary'} onClick={() => setTool('pointer')}>
            <MousePointer2 className="mr-2 h-4 w-4" />
            Pointer
          </Button>
          <Button variant={tool === 'pen' ? 'primary' : 'secondary'} onClick={() => setTool('pen')}>
            <PenLine className="mr-2 h-4 w-4" />
            Pen
          </Button>
          <Button
            variant={tool === 'highlighter' ? 'primary' : 'secondary'}
            onClick={() => setTool('highlighter')}
          >
            <Highlighter className="mr-2 h-4 w-4" />
            Highlight
          </Button>
        </div>

        <Button variant="secondary" className="w-full" onClick={() => clearPage(currentPage)}>
          <Eraser className="mr-2 h-4 w-4" />
          Clear Current Slide
        </Button>
      </div>
    </Card>
  );
}