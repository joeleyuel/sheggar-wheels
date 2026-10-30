import "./globals.css";
export const metadata = {
  title: { default: "Sheggar Wheels | Find your next ride", template: "%s | Sheggar Wheels" },
  description: "A peer-to-peer car rental marketplace demo for Addis Ababa.",
  openGraph: { title: "Sheggar Wheels", description: "Discover and rent cars around Addis Ababa.", type: "website" }
};
export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
