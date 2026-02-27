import { Suspense, lazy } from 'react';
import { Route, Switch } from 'wouter';
import Sidebar from './components/Sidebar';
import ErrorBoundary from './components/ErrorBoundary';
import NotFound from './pages/NotFound';

const DateConverter = lazy(() => import('./pages/DateConverter'));
const Calendar = lazy(() => import('./pages/Calendar'));
const ImageCompressor = lazy(() => import('./pages/ImageCompressor'));
const PdfMerger = lazy(() => import('./pages/PdfMerger'));
const Notes = lazy(() => import('./pages/Notes'));
const BcryptGenerator = lazy(() => import('./pages/BcryptGenerator'));
const AI = lazy(() => import('./pages/AI'));
const ChatRoom = lazy(() => import('./pages/ChatRoom'));

function Loader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-3 border-slate-300 border-t-red-600 rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <div className="flex h-dvh overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <ErrorBoundary>
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <Suspense fallback={<Loader />}>
            <Switch>
              {/* Pages with explicit padding wrapper */}
              <Route path="/" component={() => <div className="p-4 sm:p-6"><Calendar /></div>} />
              <Route path="/date-converter" component={() => <div className="p-4 sm:p-6"><DateConverter /></div>} />
              <Route path="/image" component={() => <div className="p-4 sm:p-6"><ImageCompressor /></div>} />
              <Route path="/pdf" component={() => <div className="p-4 sm:p-6"><PdfMerger /></div>} />
              <Route path="/notes" component={() => <div className="p-4 sm:p-6"><Notes /></div>} />
              <Route path="/bcrypt" component={() => <div className="p-4 sm:p-6"><BcryptGenerator /></div>} />
              <Route path="/ai" component={() => <div className="p-4 sm:p-6"><AI /></div>} />
              
              {/* Full bleed for Chat */}
              <Route path="/chat" component={ChatRoom} />
              
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </main>
      </ErrorBoundary>
    </div>
  );
}
