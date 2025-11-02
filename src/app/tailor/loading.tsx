'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-10">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-foreground">Tailor</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    </div>
  );
}

