import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import '../shared/foundation.css';
import './theme.css';
import './sciety.css';
import { handleResetParam } from '../shared/store.js';
import Layout from './components/Layout.jsx';
import ListingPage from './pages/ListingPage.jsx';
import ArticlePage from './pages/ArticlePage.jsx';

handleResetParam();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<ListingPage />} />
          <Route path="articles/:id" element={<ArticlePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>,
);
