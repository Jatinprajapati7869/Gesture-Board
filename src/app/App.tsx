import { AppProviders } from '@/app/AppProviders';
import { AppLayout } from '@/components/layout/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { PlaceholderPage } from '@/pages/PlaceholderPage';
import type { NavPage } from '@/components/layout/AppLayout';
import { GesturesPage } from '@/pages/GesturesPage';
import { PresentationPage } from '@/pages/PresentationPage';
import { SettingsPage } from '@/pages/SettingsPage';

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
    case 'settings':
      return <SettingsPage />;
    default:
      return (
        <PlaceholderPage
          title="Page Not Found"
          description="The requested page could not be found."
          milestone="404"
        />
      );
  }
}

export default App;
