import React, { useState } from 'react';
import { Button, message, Steps, theme, Form } from 'antd';
import FirstStep from './components/firstStep';
import SecondStep from './components/secondStep';
import ThirdStep from './components/thirdStep';
import FourthStep from './components/fourthStep';


import "./index.css"

const steps = [
  {
    title: 'Step1',
    content: '卖方登录',
  },
  {
    title: 'Step2',
    content: '卖方信息补充',
  },
  {
    title: 'Step3',
    content: '买方信息补充',
  },
  {
    title: 'Step4',
    content: '材料清单上传',
  },
];

export const StepsPage: React.FC = () => {
  const { token } = theme.useToken();
  const [current, setCurrent] = useState(0);

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const items = steps.map((item) => ({ key: item.title, title: item.title }));

  const contentStyle: React.CSSProperties = {
    lineHeight: '160px',
    textAlign: 'center',
    color: "#333",
    backgroundColor: token.colorFillAlter,
    borderRadius: token.borderRadiusLG,
    border: `1px dashed ${token.colorBorder}`,
    marginBottom: 50,
    marginTop: 30,
    fontSize: 38,
    fontWeight: 500
  };

  return (
    <div className="wrapper">
      <Steps current={current} items={items} />
      <div style={contentStyle}>
        <span>{steps[current].content}</span>
        <div className="inputWrapper">{ current === 0 ? <FirstStep></FirstStep> : null}</div>
        <div className="inputWrapper">{ current === 1 ? <SecondStep></SecondStep> : null}</div>
        <div className="inputWrapper">{ current === 2 ? <ThirdStep></ThirdStep> : null}</div>
        <div className="inputWrapper">{ current === 3 ? <FourthStep></FourthStep> : null}</div>

        
      </div>
      
      <div style={{ marginTop: 24 }}>
        {current < steps.length - 1 && (
          <Button type="primary" onClick={() => next()}>
            确认&下一步
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button type="primary" onClick={() => message.success('Processing complete!')}>
            确认&提交
          </Button>
        )}
        {current > 0 && (
          <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
            上一步
          </Button>
        )}
      </div>
    </div>
  );
};
