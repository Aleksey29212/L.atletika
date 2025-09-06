import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { DataProvider } from '@/providers/data-provider';
import { AppSidebar } from '@/components/layout/app-sidebar';
import { AppHeader } from '@/components/layout/app-header';
import { SidebarProvider } from '@/components/ui/sidebar';

export const metadata: Metadata = {
  title: 'Кросс среди образовательных учреждений города Омска',
  description: 'Платформа для проведения соревнований по кроссу среди образовательных учреждений города Омска.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased">
        <DataProvider>
          <SidebarProvider>
            <AppSidebar />
            <main className="flex-1 md:pl-[var(--sidebar-width-icon)]">
              <AppHeader />
              <div className="p-4 sm:p-6 lg:p-8">
                {children}
              </div>
            </main>
          </SidebarProvider>
        </DataProvider>
        <Toaster />
      </body>
    </html>
  );
}
