import React, { useState } from 'react';
import { Button, Switch, Form, Input, Radio } from 'antd';
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

const App: React.FC = () => {
  const [showExtra, setShowExtra] = useState(false);
  return (
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
      <div className="question">1. 本次出售房屋是否为普通商品房住宅？</div>
      <Form.Item name="radio-group">
        <Radio.Group>
          <Radio value="a">item 1</Radio>
          <Radio value="b">item 2</Radio>
          <Radio value="c">item 3</Radio>
        </Radio.Group>
      </Form.Item>


      <div className="question">2.是否提供购房发票扣减?</div>
      <Form.Item name="radio-group">
        <Radio.Group>
          <Radio value="a">item 1</Radio>
          <Radio value="b">item 2</Radio>
          <Radio value="c">item 3</Radio>
        </Radio.Group>
      </Form.Item>

      <div className="question">2.是否提供购房发票扣减?</div>
      <Form.Item name="radio-group">
        <Radio.Group>
          <Radio value="a">item 1</Radio>
          <Radio value="b">item 2</Radio>
          <Radio value="c">item 3</Radio>
        </Radio.Group>
      </Form.Item>

      <div className="question">2.是否提供购房发票扣减?</div>
      <Form.Item name="radio-group">
        <Radio.Group>
          <Radio value="a">item 1</Radio>
          <Radio value="b">item 2</Radio>
          <Radio value="c">item 3</Radio>
        </Radio.Group>
      </Form.Item>

      <div className="question">2.是否提供购房发票扣减?</div>
      <Form.Item name="radio-group">
        <Radio.Group>
          <Radio value="a">item 1</Radio>
          <Radio value="b">item 2</Radio>
          <Radio value="c">item 3</Radio>
        </Radio.Group>
      </Form.Item>


      <div className="extraPart">
        <div className="switch">
          <Form.Item name="switch" label="是否同时办理银行抵押权登记" valuePropName="checked">
            <Switch onChange={() => { setShowExtra(!showExtra) }} />
          </Form.Item>
        </div>

        {showExtra ? <>
          <Form.Item
            style={{ marginBottom: 60 }}
            label="姓名"
            name="username"
            rules={[{ required: true, message: '请输入姓名！' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            style={{ marginBottom: 60 }}
            label="身份证号码"
            name="password"
            rules={[{ required: true, message: '请输入身份证号码！' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            style={{ marginBottom: 60 }}
            label="联系方式"
            name="signNumber"
            rules={[{ required: true, message: '请输入联系方式！' }]}
          >
            <Input />
          </Form.Item>
        </> : null}
      </div>

      <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
        <Button type="primary" htmlType="submit">
          Submit
      </Button>
      </Form.Item>
    </Form>
  )
}

export default App;
