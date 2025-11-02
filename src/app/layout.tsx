import type { Metadata } from 'next';
import './globals.css';
import Image from 'next/image';
import { Toaster } from '@/components/ui/toaster';
import { Inter, Plus_Jakarta_Sans } from 'next/font/google';
import { cn } from '@/lib/utils';
import { AntiCopy } from '@/components/layout/anti-copy';

const fontBody = Inter({
  subsets: ['latin'],
  variable: '--font-body',
});

const fontHeadline = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-headline',
  weight: ['400', '500', '600', '700', '800'],
});


export const metadata: Metadata = {
  title: 'JobTailor',
  description: 'Tailor your resume for any job description with AI.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <body className={cn("font-body antialiased bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#0b0612] dark:via-[#0e0718] dark:to-[#12091e]", fontBody.variable, fontHeadline.variable)}>
        {/* Global decorative background */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute inset-0 -z-10 opacity-30"><img src="/patterns/grid.svg" alt="" className="h-full w-full object-cover"/></div>
        </div>
        <div className="pointer-events-none fixed -top-24 -left-24 -z-10 h-80 w-80 rounded-full bg-gradient-to-tr from-purple-300/40 to-fuchsia-300/20 blur-3xl animate-float-slow" />
        <div className="pointer-events-none fixed -bottom-32 -right-24 -z-10 h-96 w-96 rounded-full bg-gradient-to-tr from-fuchsia-300/40 to-pink-300/20 blur-3xl animate-float-slow" />
        <AntiCopy />
        {children}
        <Toaster />
      </body>
    </html>
  );
}







