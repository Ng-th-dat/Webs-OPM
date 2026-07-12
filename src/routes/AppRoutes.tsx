import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { HomePage } from '@/pages/HomePage';
import { CharactersPage } from '@/pages/CharactersPage';
import { CharacterDetailPage } from '@/pages/CharacterDetailPage';
import { UpdatesPage } from '@/pages/UpdatesPage';
import { UpdateDetailPage } from '@/pages/UpdateDetailPage';
import { SpecCalculatorPage } from '@/pages/SpecCalculatorPage';
import { MasteryPage } from '@/pages/MasteryPage';
import { CoreLabPage } from '@/pages/CoreLabPage';
import { CoreLabCalculatorPage } from '@/pages/CoreLabCalculatorPage';
import { CalculatorsPage } from '@/pages/CalculatorsPage';
import { PrivacyPolicyPage } from '@/pages/PrivacyPolicyPage';
import { DisclaimerPage } from '@/pages/DisclaimerPage';
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
        <Route path="privacy-policy" element={<PrivacyPolicyPage />} />
        <Route path="disclaimer" element={<DisclaimerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
