import HeroSection from "./components/HeroSection";
import PopularCruisesStatic from "./components/PopularCruisesStatic";
import CruiseShipSection from "./components/CruiseShipSection";
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
      <PopularCruisesStatic />
      <PopularHotels />
      <PopularTravelPackages />
      <CruiseShipSection />
      <DiscoverWeekly />
      {/* <PopularDestinations /> */}
      <VideoShowcase />
      <VideoReels />
    </>
  );
}
