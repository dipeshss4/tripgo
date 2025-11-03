import HeroSection from "./components/HeroSection";
import PopularCruises from "./components/PopularCruises";
import CruiseShipSection from "./components/CruiseShipSectionEnhanced";
import CruiseByCategorySection from "./components/CruiseByCategorySection";
import PopularHotels from "./components/PopularHotels";
import PopularTravelPackages from "./components/PopularTravelPackages";
import DiscoverWeekly from "./components/DiscoverWeekly";
// import PopularDestinations from "./components/PopularDestinations";
import VideoShowcase from "./components/VideoShowcase";
import VideoReels from "./components/VideoReels";


export default function HomePage() {
  return (
    <>
      <HeroSection />
      <PopularCruises />
      <CruiseByCategorySection />
      <PopularHotels />
      <PopularTravelPackages />

      <DiscoverWeekly />
      {/* <PopularDestinations /> */}
      <VideoShowcase />
      <VideoReels />
    </>
  );
}
