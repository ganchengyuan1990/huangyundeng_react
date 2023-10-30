import * as React from 'react';
import { Button, Card, Cell, Form, Icon } from 'annar';
import Frame from '../../utils/frame';
import Block from '../../utils/block';
import { getUserInfo, Image, navigateTo, redirectTo } from 'remax/wechat';
import { useEffect, useState } from 'react';
import { usePageEvent } from 'remax/macro';
import accountManager from '../account/accountManager';
import { postMyInfo } from '../../apis/account';

export default () => {
  const [form] = Form.useForm();
  const account = accountManager.getAccount()
  let formInit = {};
  usePageEvent('onLoad', options => {
    console.log(options)
    account.sex = ['OTHER',  'MALE', 'FEMALE'][options.sex] as 'MALE' | 'FEMALE' | 'OTHER';
    account.avatar_url = options.avatar_url;
    formInit = {
      nickname: account.nickname || options.nickname,
      // class_name: account.class_name || '',
      // email: account.email || '',
    };
  });
  useEffect(() => {
    form.setFieldsValue(formInit);
  }, [])

  const handleFinish = async (values: { nickname: string, class_name: string, email: string }) => {
    account.nickname = values.nickname;
    // account.class_name = values.class_name;
    // account.email = values.email;
    accountManager.setAccount(account)
    // await postMyInfo(['nickname', 'class_name', 'email', 'sex', 'avatar_url'],
    //   account.avatar_url, account.nickname, account.sex, account.email, account.class_name, null)
    await redirectTo({
      url: `/pages/lesson/book`
    })
  };
  const handleFinishFailed = (values: any, errorFields: any) => {
    console.log('errorFields', errorFields);
  };
  return (
    <Frame grayBg padding style={{ overflow: 'hidden', minHeight: '1500rpx' }}>
      <Block title="填写你期望在预约时使用的信息" noTitlePadding>
        <Card contentStyle={{ padding: '20px 0 20px' }}>
          <Form form={form} onFinish={handleFinish} onFinishFailed={handleFinishFailed}>
            <Form.Item noStyle name="nickname" rules={[{ required: true }]}>
              <Cell.Input icon="people" label="nickname" placeholder="请输入该如何称呼你" border={false}/>
            </Form.Item>
            <Form.Item noStyle name="class_name" rules={[{ required: true }]}>
              <Cell.Input icon="people" label="class_name" placeholder="请告诉你所的班级，如国贸1班" border={false}/>
            </Form.Item>
            <Form.Item noStyle name="email" rules={[{ required: true }, { pattern: /^(\w+((-\w+)|(\.\w+))*)*\w+((-\w+)|(\.\w+))*@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/, message: '请输入合理的邮箱' }]}>
              <Cell.Input icon="people" label="email" placeholder="请填写你的邮箱，以便有变化时联系" border={false}/>
            </Form.Item>
            <Form.Item noStyle style={{ marginTop: 10, padding: '0 20px' }}>
              <Button
                type="primary"
                size="large"
                shape="square"
                look="secondary"
                block
                nativeType="submit"
              >
                Confirm
              </Button>
            </Form.Item>
          </Form>
        </Card>
      </Block>
    </Frame>
  );
};
