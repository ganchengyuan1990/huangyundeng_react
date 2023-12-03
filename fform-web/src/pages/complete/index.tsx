import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { Button, Modal, message, Checkbox, Card, Input, Form } from 'antd';
// import title1Png from '../../assets/title1.png';
import accountManager from '../account/accountManager';
import { useNavigate } from 'react-router-dom';
import { AccountModel } from '../../types/account';


export const CompletePage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate()

  useEffect(() => {
    let account: AccountModel | null = accountManager.getAccount();
    accountManager.listenAccountChange(v => account = v);
    setTimeout(() => {
      setShowModal(true);
    }, 10000);
  }, [])

  return (
    <div style={{ overflow: 'hidden', minHeight: '150.0rem', marginTop: '25%' }}>

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
          okText={"提交"}
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

    </div>
  );
};
