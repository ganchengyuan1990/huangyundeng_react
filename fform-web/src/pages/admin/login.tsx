import * as React from 'react';
import { Button, Checkbox, Form, Input, message } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { postUpLogin } from '../../apis/account';
import { UserException } from '../../utils/request';
import accountManager from '../account/accountManager';
import { useNavigate } from 'react-router-dom';
import "./index.css"

export const AdminLoginPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate()

  const onFinish = async (values: any) => {
    console.log('Received values of form: ', values);
    try {
      const { account, sessionid } = await postUpLogin(values['username'], values['password'])
      accountManager.setAccount(account, sessionid)
      navigate('/admin/fform', { replace: true })
    } catch (e) {
      console.error(e)
      if (e instanceof UserException) {
        messageApi.error(e.message)
      } else {
        messageApi.error('登录失败')
      }
      return
    }
  };
  return (
    <div>
      <div className="background"></div>
      <Form
        name="normal_login"
        className="login-form"
        initialValues={{ remember: true }}
        onFinish={onFinish}
      >
        {contextHolder}
        <div className="bnerbghome_tbox">
          <span className="bnerbghome_title">
            二手房转移登记智能申报系统
          </span>
        </div>
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input placeholder="管理员用户名" />
        </Form.Item>
        <Form.Item
          name="password"
          label="密　码"
          rules={[{ required: true, message: '请输入密码' }]}
        >
          <Input
            type="password"
            placeholder="管理员密码"
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" className="login-form-button">
            登录
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};
