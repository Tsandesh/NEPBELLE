import React from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from '@/services/queryClient';
import { router } from '@/routes/router';
import { bootstrapSession } from '@/features/auth/hooks/useAuth';
import './index.css';

bootstrapSession(); // restore session from refresh cookie; guards wait on `bootstrapped`

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}><RouterProvider router={router} /></QueryClientProvider>
  </React.StrictMode>,
);
