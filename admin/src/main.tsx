import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/Toast';
import { ConfirmDialogProvider } from './components/ConfirmDialog';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ConfirmDialogProvider>
            <App />
          </ConfirmDialogProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
