import { Route, Routes } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { RequireAdmin } from './routes/RequireAdmin';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { CharacterListPage } from './pages/CharacterListPage';
import { CharacterFormPage } from './pages/CharacterFormPage';
import { SchedulePage } from './pages/SchedulePage';
import { ScheduleFormPage } from './pages/ScheduleFormPage';
import { UpdatesListPage } from './pages/UpdatesListPage';
import { UpdateFormPage } from './pages/UpdateFormPage';
import { IntelListPage } from './pages/IntelListPage';
import { IntelFormPage } from './pages/IntelFormPage';
import { SeaServersPage } from './pages/SeaServersPage';
import { SeaServerFormPage } from './pages/SeaServerFormPage';
import { GameCodesPage } from './pages/GameCodesPage';
import { GameCodeFormPage } from './pages/GameCodeFormPage';
import { MasteryMaterialsPage } from './pages/MasteryMaterialsPage';
import { TicketTypeImagesPage } from './pages/TicketTypeImagesPage';
import { TradeListingsPage } from './pages/TradeListingsPage';
import { TradeListingDetailPage } from './pages/TradeListingDetailPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { TopupsPage } from './pages/TopupsPage';
import { TopupDetailPage } from './pages/TopupDetailPage';

export function App() {
  return (
    <Routes>
      <Route path="login" element={<LoginPage />} />
      <Route element={<RequireAdmin />}>
        <Route element={<AdminLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="characters" element={<CharacterListPage />} />
          <Route path="characters/new" element={<CharacterFormPage />} />
          <Route path="characters/:id/edit" element={<CharacterFormPage />} />
          <Route path="schedule" element={<SchedulePage />} />
          <Route path="schedule/new" element={<ScheduleFormPage />} />
          <Route path="schedule/:id/edit" element={<ScheduleFormPage />} />
          <Route path="updates" element={<UpdatesListPage />} />
          <Route path="updates/new" element={<UpdateFormPage />} />
          <Route path="updates/:id/edit" element={<UpdateFormPage />} />
          <Route path="intel" element={<IntelListPage />} />
          <Route path="intel/new" element={<IntelFormPage />} />
          <Route path="intel/:id/edit" element={<IntelFormPage />} />
          <Route path="sea-servers" element={<SeaServersPage />} />
          <Route path="sea-servers/new" element={<SeaServerFormPage />} />
          <Route path="sea-servers/:id/edit" element={<SeaServerFormPage />} />
          <Route path="game-codes" element={<GameCodesPage />} />
          <Route path="game-codes/new" element={<GameCodeFormPage />} />
          <Route path="game-codes/:id/edit" element={<GameCodeFormPage />} />
          <Route path="mastery-materials" element={<MasteryMaterialsPage />} />
          <Route path="ticket-images" element={<TicketTypeImagesPage />} />
          <Route path="trade-listings" element={<TradeListingsPage />} />
          <Route path="trade-listings/:id" element={<TradeListingDetailPage />} />
          <Route path="feedback" element={<FeedbackPage />} />
          <Route path="topups" element={<TopupsPage />} />
          <Route path="topups/:id" element={<TopupDetailPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
