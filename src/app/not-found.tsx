import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="text-6xl font-bold text-text-primary">404</div>
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-2">Page Not Found</h2>
              <p className="text-text-secondary mb-4">
                The page you're looking for doesn't exist or has been moved.
              </p>
            </div>
            <Link href="/">
              <Button>
                <Home className="w-4 h-4 mr-2" />
                Go to Dashboard
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

