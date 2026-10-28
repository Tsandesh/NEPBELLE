import { lazy, Suspense } from 'react';
import { createBrowserRouter, type RouteObject } from 'react-router-dom';
import RootLayout from '@/layouts/RootLayout';
import AuthLayout from '@/layouts/AuthLayout';
import CheckoutLayout from '@/layouts/CheckoutLayout';
import AccountLayout from '@/layouts/AccountLayout';
import { ErrorFallback } from '@/components/common/ErrorFallback';
import { Skeleton } from '@/components/ui/skeleton';
import { GuestRoute, ProtectedRoute } from './guards';

const page = (loader: () => Promise<{ default: React.ComponentType }>) => {
  const C = lazy(loader);
  return <Suspense fallback={<div className="container-nb py-16"><Skeleton className="h-96 w-full" /></div>}><C /></Suspense>;
};

const routes: RouteObject[] = [
  {
    element: <RootLayout />, errorElement: <ErrorFallback />,
    children: [
      { index: true, element: page(() => import('@/pages/HomePage')) },
      { path: 'shop', element: page(() => import('@/pages/CatalogPage')) },
      { path: 'shop/:category', element: page(() => import('@/pages/CatalogPage')) },
      { path: 'search', element: page(() => import('@/pages/CatalogPage')) },
      { path: 'product/:slug', element: page(() => import('@/pages/ProductDetailPage')) },
      { path: 'cart', element: page(() => import('@/pages/CartPage')) },
      { path: 'track-order', element: page(() => import('@/pages/OrderTrackingPage')) },
      {
        element: <ProtectedRoute />,
        children: [
          { path: 'orders/:id/confirmation', element: page(() => import('@/pages/OrderConfirmationPage')) },
          { path: 'orders/:id/tracking', element: page(() => import('@/pages/OrderTrackingPage')) },
          {
            path: 'account', element: <AccountLayout />,
            children: [
              { index: true, element: page(() => import('@/pages/ProfilePage')) },
              { path: 'orders', element: page(() => import('@/pages/OrderHistoryPage')) },
              { path: 'wishlist', element: page(() => import('@/pages/WishlistPage')) },
            ],
          },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute />, errorElement: <ErrorFallback />,
    children: [{
      path: 'checkout', element: <CheckoutLayout />,
      children: [
        { path: 'shipping', element: page(() => import('@/pages/CheckoutShippingPage')) },
        { path: 'payment', element: page(() => import('@/pages/CheckoutPaymentPage')) },
      ],
    }],
  },
  {
    element: <GuestRoute />, errorElement: <ErrorFallback />,
    children: [{ element: <AuthLayout />, children: [
      { path: 'login', element: page(() => import('@/pages/LoginPage')) },
      { path: 'register', element: page(() => import('@/pages/RegisterPage')) },
    ] }],
  },
  { path: '*', element: <RootLayout />, children: [{ path: '*', element: page(() => import('@/pages/NotFoundPage')) }] },
];

export const router = createBrowserRouter(routes);
