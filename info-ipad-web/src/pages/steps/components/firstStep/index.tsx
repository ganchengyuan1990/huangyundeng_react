import React from 'react';
import { Button, Checkbox, Form, Input } from 'antd';
import "./index.css";


const onFinish = (values: any) => {
  console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
  console.log('Failed:', errorInfo);
};

type FieldType = {
  username?: string;
  password?: string;
  remember?: string;
  signNumber?: string;
};

const App: React.FC = () => (
  <Form
    name="basic"
    labelCol={{ span: 8 }}
    wrapperCol={{ span: 16 }}
    style={{ maxWidth: 1000 }}
    initialValues={{ remember: true }}
    onFinish={onFinish}
    onFinishFailed={onFinishFailed}
    autoComplete="off"
  >
    <Form.Item<FieldType>
      style={{marginBottom: 60}}
      label="卖方姓名"
      name="username"
      rules={[{ required: true, message: '请输入卖方姓名！' }]}
    >
      <Input />
    </Form.Item>

    <Form.Item<FieldType>
      style={{marginBottom: 60}}
      label="卖方身份证号码"
      name="password"
      rules={[{ required: true, message: '请输入卖方身份证号码！' }]}
    >
      <Input />
    </Form.Item>

    <Form.Item<FieldType>
      style={{marginBottom: 60}}
      label="网签合同号"
      name="signNumber"
      rules={[{ required: true, message: '请输入网签合同号！' }]}
    >
      <Input />
    </Form.Item>


    <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
      <Button type="primary" htmlType="submit">
        Submit
      </Button>
    </Form.Item>
  </Form>
);

export default App;
