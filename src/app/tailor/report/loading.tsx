'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <Card className="h-[60vh]">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-foreground">Edit</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </CardContent>
        </Card>
        <Card className="h-[60vh]">
          <CardHeader>
            <CardTitle className="font-headline text-xl text-foreground">Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center justify-center h-[48vh]">
            <Skeleton className="w-[8.5in] h-[11in] max-w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

