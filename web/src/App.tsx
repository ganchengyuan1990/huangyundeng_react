import React, { createContext, useEffect, useState } from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import { IndexPage } from './pages/index';
import { QaPage } from './pages/qa/qa';
import { getBase } from './apis/account';

export const AppContext = createContext<{
  title: string,
  showLogo: boolean,
}>({
  title: '',
  showLogo: false,
})

function App() {
  const [showLogo, showLogoSetter] = useState(false);
  const [title, titleSetter] = useState('');

  useEffect(() => {
    (async () => {
      const miniId = window.location.host
      const { title, showLogo } = await getBase(miniId)
      showLogoSetter(showLogo)
      titleSetter(title)
      document.title = title
    })()
  })

  return (
    <div className="App">
      <AppContext.Provider value={{ showLogo, title }}>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/qa/qa" element={<QaPage />} />
        </Routes>
      </AppContext.Provider>
    </div>
  );
}


export default App;
