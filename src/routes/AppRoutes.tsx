import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { RequireAuth } from './RequireAuth';
import { HomePage } from '@/pages/HomePage';
import { CharactersPage } from '@/pages/CharactersPage';
import { CharacterDetailPage } from '@/pages/CharacterDetailPage';
import { UpdatesPage } from '@/pages/UpdatesPage';
import { UpdateDetailPage } from '@/pages/UpdateDetailPage';
import { SpecCalculatorPage } from '@/pages/SpecCalculatorPage';
import { MasteryPage } from '@/pages/MasteryPage';
import { CoreLabPage } from '@/pages/CoreLabPage';
import { CoreLabCalculatorPage } from '@/pages/CoreLabCalculatorPage';
import { TicketCalculatorPage } from '@/pages/TicketCalculatorPage';
import { CalculatorsPage } from '@/pages/CalculatorsPage';
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage';
import { DisclaimerPage } from '@/pages/DisclaimerPage';
import { FeedbackPage } from '@/pages/FeedbackPage';
import { TradePage } from '@/pages/TradePage';
import { TradeListingDetailPage } from '@/pages/TradeListingDetailPage';
import { TradeListingFormPage } from '@/pages/TradeListingFormPage';
import { MyTradeListingsPage } from '@/pages/MyTradeListingsPage';
import { TradeDisclaimerPage } from '@/pages/TradeDisclaimerPage';
import { WalletPage } from '@/pages/WalletPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="characters" element={<CharactersPage />} />
        <Route path="characters/:slug" element={<CharacterDetailPage />} />
        <Route path="updates" element={<UpdatesPage />} />
        <Route path="updates/:slug" element={<UpdateDetailPage />} />
        <Route path="mastery" element={<MasteryPage />} />
        <Route path="core-lab" element={<CoreLabPage />} />
        <Route path="calculators" element={<CalculatorsPage />} />
        <Route path="spec-calculator" element={<SpecCalculatorPage />} />
        <Route path="core-lab-calculator" element={<CoreLabCalculatorPage />} />
        <Route path="ticket-calculator" element={<TicketCalculatorPage />} />
        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="disclaimer" element={<DisclaimerPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="trade" element={<TradePage />} />
        <Route path="trade/disclaimer" element={<TradeDisclaimerPage />} />
        <Route path="trade/:id" element={<TradeListingDetailPage />} />
        <Route element={<RequireAuth />}>
          <Route path="trade/new" element={<TradeListingFormPage />} />
          <Route path="trade/:id/edit" element={<TradeListingFormPage />} />
          <Route path="trade/mine" element={<MyTradeListingsPage />} />
          <Route path="wallet" element={<WalletPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
