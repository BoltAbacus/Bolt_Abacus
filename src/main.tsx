import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import 'react-tooltip/dist/react-tooltip.css';

import { router } from '@routes/router';
import LoadingBox from '@components/organisms/LoadingBox';
import ErrorBoundary from '@components/organisms/ErrorBoundary';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <ErrorBoundary>
        <Suspense fallback={<LoadingBox />}>
          <RouterProvider router={router} />
        </Suspense>
      </ErrorBoundary>
    </HelmetProvider>
  </React.StrictMode>
);
