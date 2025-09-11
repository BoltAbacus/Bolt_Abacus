import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import 'react-tooltip/dist/react-tooltip.css';

import { router } from '@routes/router';
import ErrorBoundary from '@components/atoms/ErrorBoundary';
import OfflineIndicator from '@components/atoms/OfflineIndicator';
import serviceWorkerManager from '@helpers/serviceWorker';

import './index.css';

// Register service worker
if (process.env.NODE_ENV === 'production') {
  serviceWorkerManager.register();
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Root Error Boundary caught an error:', error, errorInfo);
      }}
    >
      <HelmetProvider>
        <RouterProvider router={router} />
        <OfflineIndicator />
      </HelmetProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
