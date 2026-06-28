import { AppProviders } from '@/app/AppProviders';
import { AppLayout } from '@/components/layout/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import type { NavPage } from '@/components/layout/AppLayout';
import { GesturesPage } from '@/pages/GesturesPage';
import { PresentationPage } from '@/pages/PresentationPage';

/**
 * Root App component.
 * Uses render-prop pattern from AppLayout to receive
 * the current page and render the appropriate view.
 */
function App() {
  return (
    <AppProviders>
      <AppLayout>
        {(currentPage: NavPage) => <PageRouter page={currentPage} />}
      </AppLayout>
    </AppProviders>
  );
}

function PageRouter({ page }: { page: NavPage }) {
  switch (page) {
    case 'home':
      return <HomePage onNavigate={() => {}} />;
    case 'present':
      return <PresentationPage />;
    case 'gestures':
      return <GesturesPage />;
    case 'canvas':
      return (
        <PlaceholderPage
          title="Canvas & Annotations"
          description="Draw on slides in real-time using hand gestures. Laser pointer, freeform drawing, and annotation persistence."
          milestone="Milestone 6"
        />
      );
    case 'settings':
      return (
        <PlaceholderPage
          title="Settings"
          description="Customize gesture mappings, adjust sensitivity, configure webcam, and manage presentation preferences."
          milestone="Milestone 7"
        />
      );
    default:
      return <HomePage onNavigate={() => {}} />;
  }
}

export default App;
