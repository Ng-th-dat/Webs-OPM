import { Route, Routes } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { DashboardPage } from './pages/DashboardPage';
import { CharacterListPage } from './pages/CharacterListPage';
import { CharacterFormPage } from './pages/CharacterFormPage';
import { SchedulePage } from './pages/SchedulePage';
import { ScheduleFormPage } from './pages/ScheduleFormPage';
import { UpdatesListPage } from './pages/UpdatesListPage';
import { UpdateFormPage } from './pages/UpdateFormPage';

export function App() {
  return (
    <Routes>
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
      </Route>
    </Routes>
  );
}
