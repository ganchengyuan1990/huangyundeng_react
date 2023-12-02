import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter } from 'react-router-dom';
import { StyleProvider, px2remTransformer } from '@ant-design/cssinjs';

const maxWidth = 900
const currentWidth = maxWidth > window.innerWidth ? window.innerWidth : maxWidth;
const newFontSize = currentWidth / 75;
document.documentElement.style.fontSize = `${newFontSize}px`;

const px2rem = px2remTransformer({
  rootValue: newFontSize,
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <StyleProvider transformers={[px2rem]}>
        <App />
      </StyleProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
