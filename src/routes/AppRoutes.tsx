import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { CharactersPage } from '@/pages/CharactersPage';
import { CharacterDetailPage } from '@/pages/CharacterDetailPage';
import { TierListPage } from '@/pages/TierListPage';
import { UpdatesPage } from '@/pages/UpdatesPage';
import { UpdateDetailPage } from '@/pages/UpdateDetailPage';
import { IntelPage } from '@/pages/IntelPage';
import { IntelDetailPage } from '@/pages/IntelDetailPage';
import { SeaServersPage } from '@/pages/SeaServersPage';
import { GameCodesPage } from '@/pages/GameCodesPage';
import { SpecCalculatorPage } from '@/pages/SpecCalculatorPage';
import { CoreLabPage } from '@/pages/CoreLabPage';
import { CoreLabCalculatorPage } from '@/pages/CoreLabCalculatorPage';
import { TicketCalculatorPage } from '@/pages/TicketCalculatorPage';
import { CalculatorsPage } from '@/pages/CalculatorsPage';
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage';
import { DisclaimerPage } from '@/pages/DisclaimerPage';
import { FeedbackPage } from '@/pages/FeedbackPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="characters" element={<CharactersPage />} />
        <Route path="characters/:slug" element={<CharacterDetailPage />} />
        <Route path="tier-list" element={<TierListPage />} />
        <Route path="updates" element={<UpdatesPage />} />
        <Route path="updates/:slug" element={<UpdateDetailPage />} />
        <Route path="intel" element={<IntelPage />} />
        <Route path="intel/:slug" element={<IntelDetailPage />} />
        <Route path="sea-servers" element={<SeaServersPage />} />
        <Route path="game-codes" element={<GameCodesPage />} />
        <Route path="core-lab" element={<CoreLabPage />} />
        <Route path="calculators" element={<CalculatorsPage />} />
        <Route path="spec-calculator" element={<SpecCalculatorPage />} />
        <Route path="core-lab-calculator" element={<CoreLabCalculatorPage />} />
        <Route path="ticket-calculator" element={<TicketCalculatorPage />} />
        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="disclaimer" element={<DisclaimerPage />} />
        <Route path="feedback" element={<FeedbackPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
