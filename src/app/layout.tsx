import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';

export const metadata: Metadata = {
  title: 'CloakRelay | Zero-Leak Hybrid AI Workspace',
  description: 'Secure, privacy-first workspace using on-device AI for PII redaction and cloud models for reasoning.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="3H9PTBYIRCoc_j8lgKZo2QkLkEzyrnyN4wIqY-5c4D0" />
      </head>
      <body className="antialiased min-h-screen bg-slate-950 font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}