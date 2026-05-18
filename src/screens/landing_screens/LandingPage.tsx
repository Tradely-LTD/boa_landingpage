import Navbar from '../../components/Navbar';
import HeroSection from '../../components/HeroSection';
import StatsBanner from '../../components/StatsBanner';
import HowItWorks from '../../components/HowItWorks';
import FarmerJourney from '../../components/FarmerJourney/FarmerJourney';
import WarehouseSection from '../../components/WarehouseSection/WarehouseSection';
import RolesSection from '../../components/RolesSection/RolesSection';
import Features from '../../components/Features';
import MarketplaceSection from '../../components/MarketplaceSection/MarketplaceSection';
import MechanizationSection from '../../components/MechanizationSection/MechanizationSection';
import RegistrationCTA from '../../components/RegistrationCTA';
import Footer from '../../components/Footer';
import { useScrollAnimations } from '../../hooks/useScrollAnimations';

const LandingPage = () => {
  useScrollAnimations();

  return (
    <div className="scroll-smooth">
      <Navbar />
      <HeroSection />
      <StatsBanner />
      <HowItWorks />
      <FarmerJourney />
      <WarehouseSection />
      <RolesSection />
      <MechanizationSection />
      <Features />
      <MarketplaceSection />
      <RegistrationCTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
