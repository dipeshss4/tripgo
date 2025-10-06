import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingVideoButton from "./components/FloatingVideoButton";

export const metadata = {
  title: "TripGo - Cruises, Hotels & Packages",
  description: "Discover cruises, hotels, and travel packages with TripGo.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-gray-50">
        <Navbar />
        <main>{children}</main>
        <Footer />
        <FloatingVideoButton />
      </body>
    </html>
  );
}