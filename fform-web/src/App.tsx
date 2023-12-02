import React, { createContext, useEffect, useState } from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import { IndexPage } from './pages/index';
// import { QaPage } from './pages/qa/qa';

export const AppContext = createContext<{}>({})

function App() {
  return (
    <div className="App">
      <AppContext.Provider value={{}}>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          {/*<Route path="/qa/qa" element={<QaPage />} />*/}

          <Route path="/admin" element={<IndexPage />} />
        </Routes>
      </AppContext.Provider>
    </div>
  );
}


export default App;
