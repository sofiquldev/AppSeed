import "./globals.css";

export const metadata = {
  title: "AppSeed",
  description: "{{APPSEED_TAGLINE}}",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
