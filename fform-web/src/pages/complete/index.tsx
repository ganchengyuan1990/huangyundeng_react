import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button, Form, Input, message, Modal } from 'antd';
// import title1Png from '../../assets/title1.png';
import accountManager from '../account/accountManager';
import { useNavigate } from 'react-router-dom';
import { AccountModel } from '../../types/account';
import useQuery from '../../utils/query';


export const CompletePage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate()

  const { fformId } = useQuery<{ fformId: string, }>()

  useEffect(() => {
    setInterval(() => {
      setShowModal(true);
    }, 10000);
  }, [])

  const onFinish = (values: any) => {
    if (values['password'] == '123456') {
      navigate(`/commit?fformId=${fformId}`)
    } else {
      messageApi.error('密码错误')
    }
  }

  return (
    <div style={{ overflow: 'hidden', marginTop: '25%', position: 'fixed', top: 0, bottom: 0, right: 0, left: 0 }}>
      {contextHolder}

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
              onFinish={onFinish}
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
                  提交
                </Button>
              </Form.Item>
            </Form>
          </>
        </Modal> : null
      }
    </div>
  );
};
