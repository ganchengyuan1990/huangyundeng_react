import React from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import { IndexPage } from './pages/index';
import { QaPage } from './pages/qa/qa';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<IndexPage />} />
        <Route path="/qa/qa" element={<QaPage />} />
      </Routes>
    </div>
  );
}


export default App;
