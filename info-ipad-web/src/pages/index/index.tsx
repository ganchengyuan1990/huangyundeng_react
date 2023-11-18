import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { Button, Modal, message, Checkbox, Card, Skeleton, Tabs } from 'antd';
import Frame from '../../utils/frame';
import Block from '../../utils/block';
import logoPng from '../../assets/logo.png';
import titlePng from '../../assets/title.png';
// import title1Png from '../../assets/title1.png';
import { postWebLogin } from '../../apis/account';
import accountManager from '../account/accountManager';
import { getHotQuestions } from '../../apis/qa';
import { useNavigate } from 'react-router-dom';
import { AccountModel } from '../../types/account';
import { TeamOutlined, } from '@ant-design/icons';
import { AppContext } from '../../App';


export const IndexPage = () => {
  const { title, showLogo } = useContext(AppContext)
  const [questions, setQuestions] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const [showModal, setShowModal] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, isLoadingSetter] = useState(true);
  const [errorMessage, errorMessageSetter] = useState('');
  const navigate = useNavigate()

  useEffect(() => {
    let account: AccountModel | null = accountManager.getAccount();
    accountManager.listenAccountChange(v => account = v);
    // (async function() {
    //   const { questions, tags } = await getHotQuestions()
    //   setQuestions(questions)
    //   setTags(tags)

    //   if (account) {
    //     isLoadingSetter(false)
    //     return;
    //   }
    //   try {
    //     let sessionid;
    //     ({ sessionid, account } = await postWebLogin('1234567890'));
    //     accountManager.setAccount(account, sessionid)
    //     isLoadingSetter(false)
    //   } catch (e) {
    //     // @ts-ignore
    //     errorMessageSetter('服务器连接失败，请稍后再试： '+e?.message)
    //   }
    // })()
  }, [])

  const getUserInfoFunc = async (question: string = '', tag: string = '') => {
    await navigate(`/qa/qa?question=${question}&tag=${tag}`)
  }

  const handleOk = () => {
    // setOpen(false);
  };

  const handleCancel = () => {
    // setOpen(false);
  };

  return (
    <Frame grayBg style={{ overflow: 'hidden', minHeight: '150.0rem' }}>
      <div style={{ position: 'relative', width: '75.0rem', height: '25.0rem' }}>
        {showLogo && <img src={logoPng} alt="logo" style={{ position: 'absolute', top: '3.0rem', right: '3.0rem', width: '10.0rem', height: '10.0rem', zIndex: 1 }} />}
        {title && <span style={{ position: 'absolute', top: '2.3rem', left: '22.4rem', width: '60.0rem', textAlign: 'center', color: '#353535', fontSize: '5.4rem', zIndex: 1, textShadow: '.5rem .5rem .5rem #ddd' }}>{title}</span>}
        {/* <img src={title1Png} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '75.0rem', height: '25.0rem' }} /> */}
      </div>

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
          onOk={() => setShowModal(false)}
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
    </Frame>
  );
};
