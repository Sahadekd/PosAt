import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "Pós-Atendimento | Quadra Brasileira",
  description:
    "Sistema unificado de cadastro, segmentação e gestão de pós-atendimento imobiliário.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full" suppressHydrationWarning>
      <body className="flex min-h-full flex-col antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          disableTransitionOnChange
          scriptProps={{ suppressHydrationWarning: true }}
        >
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}