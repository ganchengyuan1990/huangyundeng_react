import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Button,
} from 'antd';
import "./index.css"



export const Header = () => {

  useEffect(() => {
  }, [])


  return (
    <div className="header-wrapper">
      <div className="header-wrapper-image"></div>
      <div className="header-wrapper-title">
        广州市南沙区不动产登记中心
      </div>
      <div className="header-wrapper-content">
        二手房转移登记智能申报系统
      </div>
      <Button className="header-wrapper-button" onClick={() => {
        window.location.href = './intro'
      }}>返回首页</Button>
    </div>
  );
};
