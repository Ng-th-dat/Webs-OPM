import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { LanguageProvider } from '@/i18n';
import { AuthProvider } from '@/context/AuthContext';
import { LoginModalProvider } from '@/context/LoginModalContext';
import { ConfirmDialogProvider } from '@/components/common/ConfirmDialog';
import './styles/index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <LanguageProvider>
      <AuthProvider>
        <LoginModalProvider>
          <ConfirmDialogProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </ConfirmDialogProvider>
        </LoginModalProvider>
      </AuthProvider>
    </LanguageProvider>
  </StrictMode>,
);
