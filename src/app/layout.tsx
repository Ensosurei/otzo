import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'otzo_db — Sistema de Gestión',
  description: 'Panel de control y base de datos otzo_db con TiDB Cloud',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
