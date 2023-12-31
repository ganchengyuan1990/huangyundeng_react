import React, { createContext, useEffect, useState } from 'react';
import './App.css';
import { Route, Routes } from 'react-router-dom';
import { IndexPage } from './pages/index';
import { StepsPage } from './pages/steps/steps';
import { CompletePage } from './pages/complete/complete';


import { getBase } from './apis/account';

export const AppContext = createContext<{
  title: string,
  showLogo: boolean,
}>({
  title: '',
  showLogo: false,
})

const HostToMiniId: { [key: string]: string } = {
  'aichan.info': '',
  'huangshi.aichan.info': 'wx07755a85c868c35d',
  'tianmen.aichan.info': 'wx5f6601101020cf52',
}

function App() {
  const [showLogo, showLogoSetter] = useState(false);
  const [title, titleSetter] = useState('');

  useEffect(() => {
    // (async () => {
    //   const miniId = HostToMiniId[window.location.host] || ''
    //   const { title, showLogo } = await getBase(miniId)
    //   showLogoSetter(showLogo)
    //   titleSetter(title)
    //   document.title = title
    // })()
  })

  return (
    <div className="App">
      <AppContext.Provider value={{ showLogo, title }}>
        <Routes>
          <Route path="/" element={<IndexPage />} />
          <Route path="/steps/steps" element={<StepsPage />} />
          <Route path="/complete/complete" element={<CompletePage />} />
        </Routes>
      </AppContext.Provider>
    </div>
  );
}


export default App;
