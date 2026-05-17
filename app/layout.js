import "./globals.css";

export const metadata = {
  title: "rastrealo.lat",
  description: "Rastrea tu pedido en tiempo real",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
