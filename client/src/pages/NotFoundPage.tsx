import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

// Custom 404 (required by brief; no Figma frame exists for it)
export default function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 bg-canvas px-6 text-center">
      <p className="text-sm text-brand">404</p><h1 className="font-serif text-display">We can’t find that page</h1>
      <p className="max-w-md text-muted-foreground">The link may be broken or the page may have been removed.</p>
      <div className="flex gap-3"><Button asChild><Link to="/">Back to home</Link></Button><Button asChild variant="secondary"><Link to="/shop">Shop all</Link></Button></div>
    </div>
  );
}
