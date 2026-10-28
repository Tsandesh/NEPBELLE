import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';
import { Button } from '@/components/ui/button';

export const ErrorFallback = () => {
  const err = useRouteError();
  const notFound = isRouteErrorResponse(err) && err.status === 404;
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <p className="text-sm text-brand">{notFound ? '404' : 'Error'}</p>
      <h1 className="font-serif text-display text-ink">{notFound ? 'Page not found' : 'Something went wrong'}</h1>
      <p className="max-w-md text-muted-foreground">{notFound ? 'The page you are looking for has moved or no longer exists.' : 'An unexpected error occurred. Please try again.'}</p>
      <div className="flex gap-3"><Button asChild><Link to="/">Back to home</Link></Button><Button variant="secondary" onClick={() => window.location.reload()}>Reload</Button></div>
    </div>
  );
};
