import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { Button, Modal, message, Checkbox, Card, Skeleton, Tabs } from 'antd';
import Frame from '../../utils/frame';
import logoPng from '../../assets/logo.png';
import { useNavigate } from 'react-router-dom';


export const IntroPage = () => {
  const [checked, setChecked] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate()


  return (
    <div style={{ overflow: 'hidden', maxHeight: '100vh', marginTop: '20%' }}>

      <div className="bnerbghome_tbox">
        <span className="bnerbghome_subtitle">
          语音驱动·语义分析·大模型
        </span>
        <span className="bnerbghome_title">
          二手房转移登记智能申报系统
        </span>

        <span className="bnerbghome_titleen">
          Intelligent OA Platform
        </span>
        <span className="bnerbghome_desc">
          泛微助力组织的数字化转型
        </span>
        {/* <span className="bnerbghome_btn">
            <a href="javascript:void(0);" onclick="jumpHref('https://xiaoe.ai')">
                了解更多
            </a>
        </span> */}
      </div>

      {
        showModal ? <Modal
          title='风险须知'
          open={showModal}
          onCancel={() => setShowModal(false)}
          onOk={() => {
            if (!checked) {
              messageApi.info('请先勾选协议!');
              return
            }
            setShowModal(false)
            window.location.href = './'
          }}
        >
          <>
            <div>XXX</div>
            <Checkbox checked={checked} onChange={() => {
              setChecked(!checked)
            }}>
              我已了解以上风险内容
            </Checkbox>
          </>
        </Modal> : null
      }

      {contextHolder}

      <div className="buttons_wrapper">
        <Button type="primary"
          onClick={() => {
            setShowModal(true)
          }}
          className="button_primary"
          style={{ width: '20.5%', margin: '3.5%', height: '120px', fontSize: 24 }}
        >二手房转移登记
        </Button>

        <Button type="primary"
          onClick={() => {
            messageApi.info('暂未开放!');
          }}
          className="button_primary"
          style={{ width: '20.5%', margin: '3.5%', height: '120px', fontSize: 24 }}
        >
          <div>二手房转移登记</div>
          <div>（带押过户）</div>
        </Button>
      </div>
    </div>
  );
};
