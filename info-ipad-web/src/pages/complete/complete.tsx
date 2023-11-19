import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { Button, Modal, message, Checkbox, Card, Input, Form } from 'antd';
import Frame from '../../utils/frame';
import Block from '../../utils/block';
import logoPng from '../../assets/logo.png';
import titlePng from '../../assets/title.png';
// import title1Png from '../../assets/title1.png';
import { postWebLogin } from '../../apis/account';
import accountManager from '../account/accountManager';
import { useNavigate } from 'react-router-dom';
import { AccountModel } from '../../types/account';
import { TeamOutlined, } from '@ant-design/icons';
import { AppContext } from '../../App';


export const CompletePage = () => {
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
    setTimeout(() => {
      setShowModal(true);
    }, 1000);
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
          申报完成！
        </span>

        <span className="bnerbghome_subtitle" style={{ marginTop: 60 }}>
          请联系现场管理员现场核实纸质材料原件
        </span>

        {/* <span className="bnerbghome_btn">
            <a href="javascript:void(0);" onclick="jumpHref('https://xiaoe.ai')">
                了解更多
            </a>
        </span> */}
      </div>

      {
        showModal ? <Modal
          title='确认操作'
          open={showModal}
          footer={null}
          onCancel={() => setShowModal(false)}
          onOk={() => setShowModal(false)}
        >
          <>
            <Form
              name="basic"
              labelCol={{ span: 8 }}
              wrapperCol={{ span: 16 }}
              style={{ maxWidth: 1000 }}
              initialValues={{ remember: true }}
              onFinish={() => { }}
              onFinishFailed={() => { }}
              autoComplete="off"
            >
              <Form.Item
                style={{ marginBottom: 60, marginTop: 80 }}
                label="解锁密码"
                name="password"
                rules={[{ required: true, message: '请输入解锁密码！' }]}
              >
                <Input.Password />
              </Form.Item>

              <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                <Button type="primary" htmlType="submit">
                  Submit
      </Button>
              </Form.Item>
            </Form>
          </>
        </Modal> : null
      }

      {contextHolder}

    </Frame>
  );
};
