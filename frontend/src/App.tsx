import { Suspense, lazy } from 'react';
import { Route, Switch } from 'wouter';
import Sidebar from './components/Sidebar';

const DateConverter = lazy(() => import('./pages/DateConverter'));
const Calendar = lazy(() => import('./pages/Calendar'));
const ImageCompressor = lazy(() => import('./pages/ImageCompressor'));
const PdfMerger = lazy(() => import('./pages/PdfMerger'));
const Notes = lazy(() => import('./pages/Notes'));
const BcryptGenerator = lazy(() => import('./pages/BcryptGenerator'));

function Loader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-3 border-slate-300 border-t-red-600 rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <div className="flex min-h-dvh bg-slate-950 text-slate-100">
      <Sidebar />
      <main className="flex-1 min-w-0 p-4 sm:p-6 lg:ml-60">
        <Suspense fallback={<Loader />}>
          <Switch>
            <Route path="/" component={DateConverter} />
            <Route path="/calendar" component={Calendar} />
            <Route path="/image" component={ImageCompressor} />
            <Route path="/pdf" component={PdfMerger} />
            <Route path="/notes" component={Notes} />
            <Route path="/bcrypt" component={BcryptGenerator} />
            <Route>
              <div className="text-center py-20">
                <h1 className="text-4xl font-bold">404</h1>
                <p className="text-slate-400 mt-2">Page not found</p>
              </div>
            </Route>
          </Switch>
        </Suspense>
      </main>
    </div>
  );
}
