import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { Button, Modal, message, Checkbox, Card, Skeleton, Tabs } from 'antd';
import { useNavigate } from 'react-router-dom';
import "./index.css"



export const IntroPage = () => {
  const [checked, setChecked] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate()


  return (
    <>
      <div className="background"></div>
      <div style={{ overflow: 'hidden', maxHeight: '100vh', marginTop: '20%' }}>

        <div className="bnerbghome_tbox">
          {/* <span className="bnerbghome_subtitle">
            语音驱动·语义分析·大模型
        </span> */}
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
            title='办理须知'
            open={showModal}
            okText={"开始申报"}
            cancelText={"取消"}
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
              <div style={{ marginBottom: 30, marginTop: 20 }}> 
                <div>1、自助办理流程：提交申请——后台审核，审核通过后全部申请人携带纸质申请材料原件到大厅窗口现场核验、当场缴纳税费、领证。</div>
                <div>2、申请人应是权利人或权利人依法授权的代理人，并具备完全民事能力，应符合法律法规和政策规定的主体条件。</div>
                <div>3、申请人应认真如实填写有关信息，所申请事项及上传的影像材料应真实、合法、有效。如提供虚假材料、虚假信息的，将列入诚信黑名单，并应承担相应法律责任。</div>
                <div>4、申请为预申请，申请人提交资料后，在核验前若有任意一方申请人提出撤回预申请，可通过系统自行撤回该预申请。</div>
                <div>5、预申请审核通过后，请及时到窗口提交纸质材料核验，申请人超出核验时间30天未到现场核验的，系统将自动注销该申请。</div>
              </div>
              <Checkbox checked={checked} onChange={() => {
                setChecked(!checked)
              }}>
                我已了解以上办理须知
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
    </>
  );
};
