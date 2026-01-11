import { Suspense, lazy } from 'react';
import { Route, Switch } from 'wouter';
import { AnimatePresence } from 'framer-motion';
import { Layout } from './components/Layout';
import './styles.css';

// Lazy load pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const ImageCompressor = lazy(() => import('./pages/ImageCompressor'));
const PdfMerger = lazy(() => import('./pages/PdfMerger'));
const Notes = lazy(() => import('./pages/Notes'));
const BcryptGenerator = lazy(() => import('./pages/BcryptGenerator'));
const ThreeDShowcase = lazy(() => import('./pages/ThreeDShowcase'));
const WasmBenchmark = lazy(() => import('./pages/WasmBenchmark'));
const RadhaKrishnaHub = lazy(() => import('./pages/RadhaKrishnaHub'));

// Loading component
const PageLoader = () => (
  <div className="loading-page">
    <div className="loading-spinner" />
  </div>
);

function App() {
  return (
    <Layout>
      <Suspense fallback={<PageLoader />}>
        <AnimatePresence mode="wait">
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/image-compressor" component={ImageCompressor} />
            <Route path="/pdf-merger" component={PdfMerger} />
            <Route path="/notes" component={Notes} />
            <Route path="/bcrypt" component={BcryptGenerator} />
            <Route path="/3d-showcase" component={ThreeDShowcase} />
            <Route path="/wasm-benchmark" component={WasmBenchmark} />
            <Route path="/radha-krishna" component={RadhaKrishnaHub} />
            
            {/* 404 Fallback */}
            <Route>
              <div className="page-container" style={{ textAlign: 'center', padding: '3rem' }}>
                <h1 className="page-title">404</h1>
                <p className="page-subtitle">Page not found</p>
              </div>
            </Route>
          </Switch>
        </AnimatePresence>
      </Suspense>
    </Layout>
  );
}

export default App;
