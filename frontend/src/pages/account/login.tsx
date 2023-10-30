import * as React from 'react';
import { Button } from 'annar';
import Frame from '../../utils/frame';
import { getUserProfile, login, request } from 'remax/wechat';

export default () => {
  return (
    <Frame grayBg padding style={{ overflow: 'hidden' }}>
      <Button onTap={() => {
        getUserProfile({
          desc: '展示用户信息', // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
          success: (res) => {
            console.log(res)
          }
        })
        login({
          success (res) {
            if (res.code) {
              //发起网络请求
              request({
                url: 'https://example.com/onLogin',
                data: {
                  code: res.code
                }
              })
            } else {
              console.log('登录失败！' + res.errMsg)
            }
          }
        })
      }} type="primary" shape="square" hairline>Week. 123</Button>

    </Frame>
  );
};
