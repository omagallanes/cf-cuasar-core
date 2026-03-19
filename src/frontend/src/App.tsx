import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import ProjectsPage from './pages/ProjectsPage';
import CreateProjectPage from './pages/CreateProjectPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import ResultsPage from './pages/ResultsPage';
import '@/styles/globals.css';

function App() {
  return (
    <ErrorBoundary
      onError={(error, errorInfo) => {
        // Loggear errores para debugging
        console.error('[App ErrorBoundary]', error, errorInfo);
      }}
    >
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Dashboard stats={{
              total: 10,
              pending: 3,
              inProgress: 2,
              completed: 4,
              failed: 1,
              cancelled: 0
            }} />} />
            <Route path="projects" element={<ProjectsPage />} />
            <Route path="projects/new" element={<CreateProjectPage />} />
            <Route path="projects/:id" element={<ProjectDetailPage />} />
            <Route path="projects/:id/results" element={<ResultsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
