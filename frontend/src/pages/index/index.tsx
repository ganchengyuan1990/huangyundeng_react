import * as React from 'react';
import { Button, Card, Icon, Ling, Skeleton, Tabs, Tag } from 'annar';
import Frame from '../../utils/frame';
import Block from '../../utils/block';
import { getUserProfile, Image, login as wxLogin, redirectTo } from 'remax/wechat';
import logoPng from '../../../public/logo.png';
import titlePng from '../../../public/title.png';
import { useEffect, useRef, useState } from 'react';
import { getBase, postLogin, postMyInfo } from '../../apis/account';
import accountManager from '../account/accountManager';
import { getHotQuestions } from '../../apis/qa';
import { View, Text } from 'remax/one';
import { setNavigationBarTitle } from '@remax/wechat/esm/api';

export default () => {
  const [showLogo, showLogoSetter] = useState(false);
  const [title, titleSetter] = useState('');
  const [needUpdateInfo, needUpdateInfoSetter] = useState(false);

  const [stateKey, setStateKey] = useState('question');
  const [questions, setQuestions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, isLoadingSetter] = useState(true);
  const [isInfoLoading, isInfoLoadingSetter] = useState(false);
  const [errorMessage, errorMessageSetter] = useState('');
  const ling = useRef<any>();

  useEffect(() => {
    let account = accountManager.getAccount();
    accountManager.listenAccountChange(v => account=v);
    (async function() {
      const { title, showLogo } = await getBase(1)
      showLogoSetter(showLogo)
      titleSetter(title)
      await setNavigationBarTitle({ title })

      const { questions, tags } = await getHotQuestions()
      setQuestions(questions)
      setTags(tags)

      if (account) {
        isLoadingSetter(false)
        return;
      }
      const res = await wxLogin()
      if (!res.code) {
        console.log()
        errorMessageSetter('登录失败！' + res.errMsg)
        return
      }
      try {
        let sessionid, need_update_info;
        ({ sessionid, account, need_update_info } = await postLogin(res.code));
        needUpdateInfoSetter(need_update_info)
        accountManager.setAccount(account, sessionid)
        isLoadingSetter(false)
      } catch (e) {
        errorMessageSetter('服务器连接失败，请稍后再试： '+e.message)
      }
    })()
  }, [])
  const getUserInfoFunc = async (question: string = '', tag: string = '') => {
    isInfoLoadingSetter(true)
    if (needUpdateInfo) {
      const { userInfo } = await getUserProfile({ desc: '获取头像昵称以便展示' });
      console.log(userInfo)
      await postMyInfo(['nickname', 'sex', 'avatar_url'],
        userInfo.avatarUrl, userInfo.nickName, ['OTHER',  'MALE', 'FEMALE'][userInfo.gender], null, null, null)
    }
    isInfoLoadingSetter(false)
    await redirectTo({
      url: `/pages/qa/qa?question=${question}&tag=${tag}`
    })
  }
  const onGetPhoneNumber = async (userInfo) => {
    console.log(userInfo)
  }
  return (
    <Frame grayBg style={{ overflow: 'hidden', minHeight: '1500rpx' }}>
      <Ling ref={ling} />
      <View style={{ position: 'relative', width: '750rpx', height: '250rpx' }}>
        {showLogo && <Image src={logoPng} mode="widthFix" style={{ position: 'absolute', top: '30rpx', left: '30rpx', width: '190rpx', height: '190rpx', zIndex: 1 }} />}
        {title && <Text style={{ position: 'absolute', top: '30rpx', left: 0, width: '750rpx', textAlign: 'center', color: 'white', fontSize: '70rpx', zIndex: 1 }}>{title}</Text>}
        <Image src={titlePng} mode="widthFix" style={{ position: 'absolute', top: 0, left: 0, width: '750rpx', height: '250rpx' }} />
      </View>

      {isLoading
        ? <Block padding title={<>热门问题</>}><Skeleton /></Block>
        : <Block padding>
          <Tabs
            onTabClick={({ key }) => setStateKey(key)}
            activeKey={stateKey}
            type="card"
            animated
          >
            <Tabs.TabContent key="question" tab="热门问题">
              <Card>
                {questions.slice(0, 6).map((q, i) =>
                  <View key={i}
                        onTap={async() => getUserInfoFunc(q)}
                        style={{ padding: '10rpx', borderBottom: 'solid thin #ddd' }}>
                  <Text style={{ color: i <= 2 ? 'red' : (i <= 3 ? 'orange' : 'gray') }}>{i+1}</Text>. {q}
                </View>)}
              </Card>
            </Tabs.TabContent>
            <Tabs.TabContent key="tag" tab="热门标签">
              <Card>
                {tags.slice(0, 9).map((t, i) =>
                  <Tag key={i} plain size="large"
                       onTap={async() => getUserInfoFunc('', t)}
                       style={{ width: '200rpx', margin: '10rpx' }}>{t}</Tag>)}
              </Card>
            </Tabs.TabContent>
          </Tabs>
        </Block>}

      <Block contentStyle={{ width: '650rpx', margin: '100rpx 50rpx' }}>
        <Button onTap={async() => getUserInfoFunc()} loading={isLoading || isInfoLoading} block shape="square" size="superlarge" type="primary" style={{ fontSize:"40rpx" }}>
          <Icon type="friend" size="50rpx" color="white" />
          在线咨询
        </Button>
        {/*<Button open-type="getPhoneNumber" bindgetphonenumber={onGetPhoneNumber} loading={isLoading} block size="superlarge" look="secure" style={{ fontSize:"40rpx" }}>*/}
        {/*  <Icon type="friend" size="50rpx" color="white" />*/}
        {/*  获取手机号*/}
        {/*</Button>*/}
        <text style={{ padding: '12rpx', fontSize: '32rpx', color: '#666' }}>
          {errorMessage}
        </text>
        <Button onTap={() => ling.current.info('敬请期待')} block shape="square" size="superlarge" type="default" style={{ fontSize:"40rpx", marginTop: '30rpx' }}>
          更多服务
        </Button>
      </Block>
    </Frame>
  );
};
