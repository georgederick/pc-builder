import { lazy, Suspense, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';

const Builder = lazy(() => import('@/pages/Builder'));
const Overview = lazy(() => import('@/pages/Overview'));
const Compare = lazy(() => import('@/pages/Compare'));
const ReadyBuilds = lazy(() => import('@/pages/ReadyBuilds'));
const Saved = lazy(() => import('@/pages/Saved'));
const About = lazy(() => import('@/pages/About'));
const Shared = lazy(() => import('@/pages/Shared'));
const PrintView = lazy(() => import('@/pages/PrintView'));

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [pathname]);
  return null;
}

function Loading() {
  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-12">
      <div className="skeleton h-10 w-64" />
      <div className="skeleton h-64 w-full" />
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollTop />
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/print" element={<PrintView />} />
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/builder" element={<Builder />} />
            <Route path="/builder/:category" element={<Builder />} />
            <Route path="/overview" element={<Overview />} />
            <Route path="/compare" element={<Compare />} />
            <Route path="/ready-builds" element={<ReadyBuilds />} />
            <Route path="/saved" element={<Saved />} />
            <Route path="/shared" element={<Shared />} />
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Home />} />
          </Route>
        </Routes>
      </Suspense>
    </>
  );
}
