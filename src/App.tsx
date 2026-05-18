import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './screens/landing_screens/LandingPage';
import RegistrationPage from './screens/registration_screens/RegistrationPage';
import TrackPage from './screens/track_screens/TrackPage';
import VerifyReceiptPage from './screens/verify_screens/VerifyReceiptPage';
import ApplyLoanPage from './screens/loan_screens/ApplyLoanPage';
import CollectionRequestPage from './screens/collection_screens/CollectionRequestPage';
import MarketplacePage      from './screens/marketplace_screens/MarketplacePage';
import ListingDetailPage    from './screens/marketplace_screens/ListingDetailPage';
import CheckoutPage         from './screens/marketplace_screens/CheckoutPage';
import PaymentVerifyPage    from './screens/marketplace_screens/PaymentVerifyPage';
import BuyerAccountPage     from './screens/marketplace_screens/BuyerAccountPage';

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/register" element={<RegistrationPage />} />
      <Route path="/track" element={<TrackPage />} />
      <Route path="/verify-receipt" element={<VerifyReceiptPage />} />
      <Route path="/apply-loan"     element={<ApplyLoanPage />} />
      <Route path="/request-collection" element={<CollectionRequestPage />} />
      {/* Marketplace */}
      <Route path="/marketplace"          element={<MarketplacePage />} />
      <Route path="/marketplace/:id"      element={<ListingDetailPage />} />
      <Route path="/marketplace/checkout"        element={<CheckoutPage />} />
      <Route path="/marketplace/checkout/verify" element={<PaymentVerifyPage />} />
      <Route path="/marketplace/account"         element={<BuyerAccountPage />} />
    </Routes>
  </BrowserRouter>
);

export default App;
