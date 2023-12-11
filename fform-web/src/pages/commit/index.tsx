import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button, Form, Input, message, Modal } from 'antd';
// import title1Png from '../../assets/title1.png';
import accountManager from '../account/accountManager';
import { useNavigate } from 'react-router-dom';
import { AccountModel } from '../../types/account';

// 意愿确认
export const CommitPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate()

  useEffect(() => {
    let account: AccountModel | null = accountManager.getAccount();
    accountManager.listenAccountChange(v => account = v);
  }, [])

  return (
    <div style={{ overflow: 'hidden', minHeight: '150.0rem', marginTop: '15%' }}>

      <div className="bnerbghome_tbox">
        <span className="bnerbghome_subtitle">
          意愿确认
        </span>
      </div>

      <Button htmlType="submit" style={{ marginTop: 180, marginRight: 100}} onClick={() => {
        window.location.href = './form'
      }}>
        取消提交
      </Button>

      <Button type="primary" htmlType="submit" style={{ marginTop: 180}}>
        确认&提交
      </Button>

      {contextHolder}

    </div>
  );
};
