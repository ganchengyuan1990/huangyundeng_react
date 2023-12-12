import React, { createContext, useEffect, useState } from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import { FormPage } from './pages/index/form';
import { IntroPage } from './pages/intro';
import { CompletePage } from './pages/complete';
import { CommitPage } from './pages/commit';
import { FformAdminPage } from './pages/admin';
import { AdminLayout } from './pages/admin/layout';
import { AdminLoginPage } from './pages/admin/login';

// import { QaPage } from './pages/qa/qa';

export const AppContext = createContext<{}>({})

function App() {
  return (
    <div className="App">
      <AppContext.Provider value={{}}>
        <Routes>
          <Route path="/" element={<IntroPage />} />
          <Route path="/form" element={<FormPage />} />
          <Route path="/complete" element={<CompletePage />} />
          <Route path="/commit" element={<CommitPage />} />


          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="fform" element={<FformAdminPage />} />
          </Route>
        </Routes>
      </AppContext.Provider>
    </div>
  );
}


export default App;
