import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import LeadList from './components/LeadList';
import LeadDetail from './components/LeadDetail';
import Tasks from './components/Tasks';
import Settings from './components/Settings';

const App: React.FC = () => {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="leads" element={<LeadList />} />
          <Route path="leads/:id" element={<LeadDetail />} />
          <Route path="tasks" element={<Tasks />} />
          <Route path="settings" element={<Settings />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default App;