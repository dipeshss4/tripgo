import "./globals.css";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import FloatingVideoButton from "./components/FloatingVideoButton";

export const metadata = {
  title: "Azure Travel - Premium Journeys & Luxury Experiences",
  description: "Experience luxury travel with Azure Travel - Premium cruises, exclusive hotels, and bespoke travel packages.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-white">
        <Navbar />
        <main className="pt-20">{children}</main>
        <Footer />
        <FloatingVideoButton />
      </body>
    </html>
  );
}