import * as React from 'react';
import { Button, Card, Icon, Ling, Skeleton, Tabs, Tag } from 'annar';
import Frame from '../../utils/frame';
import Block from '../../utils/block';
import { getUserProfile, Image, login as wxLogin, redirectTo, showShareMenu, showShareImageMenu } from 'remax/wechat';
import { useEffect, useRef, useState } from 'react';
import { getBase, postLogin, postMyInfo } from '../../apis/account';
import accountManager from '../account/accountManager';
import { getHotQuestions } from '../../apis/qa';
import { View, Text } from 'remax/one';
import { getAccountInfoSync, setNavigationBarTitle } from '@remax/wechat/esm/api';

export default () => {
  let account = accountManager.getAccount();
  accountManager.listenAccountChange(v => account=v);
  const [showLogo, showLogoSetter] = useState(false);
  const [title, titleSetter] = useState([]);
  const [needUpdateInfo, needUpdateInfoSetter] = useState(false);

  const [stateKey, setStateKey] = useState('question');
  const [questions, setQuestions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, isLoadingSetter] = useState(true);
  const [isInfoLoading, isInfoLoadingSetter] = useState(false);
  const [errorMessage, errorMessageSetter] = useState('');
  const ling = useRef<any>();

  useEffect(() => {
    (async function() {
      const res2 = getAccountInfoSync()
      const appid = res2.miniProgram.appId;
      const { title, showLogo } = await getBase(appid)
      showLogoSetter(showLogo)
      titleSetter(["您好~", "我是不动产智能客服", title])
      await setNavigationBarTitle({ title })

      const { questions, tags } = await getHotQuestions()
      setQuestions(questions)
      setTags(tags)

      if (account) {
        needUpdateInfoSetter(!account.avatar_url)
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
        ({ sessionid, account, need_update_info } = await postLogin(appid, res.code));
        needUpdateInfoSetter(need_update_info)
        accountManager.setAccount(account, sessionid)
        isLoadingSetter(false)
      } catch (e) {
        errorMessageSetter('服务器连接失败，请稍后再试： '+e.message)
      }
    })()
    showShareMenu({
      menus: ["shareAppMessage", "shareTimeline"]
    })
    showShareImageMenu();
  }, [])
  const getUserInfoFunc = async (question: string = '', tag: string = '') => {
    isInfoLoadingSetter(true)
    // if (needUpdateInfo) {
    //   const { userInfo } = await getUserProfile({ desc: '获取头像昵称以便展示' });
    //   console.log(userInfo)
    //   await postMyInfo(['nickname', 'sex', 'avatar_url'],
    //     userInfo.avatarUrl, userInfo.nickName, ['OTHER',  'MALE', 'FEMALE'][userInfo.gender], null, null, null)
    //   account.nickname = userInfo.nickName
    //   account.avatar_url = userInfo.avatarUrl
    //   account.sex = ['OTHER',  'MALE', 'FEMALE'][userInfo.gender]
    //   accountManager.setAccount(account)
    // }
    isInfoLoadingSetter(false)
    await redirectTo({
      url: `/pages/qa/qa?question=${question}&tag=${tag}`
    })
  }
  const onGetPhoneNumber = async (userInfo) => {
    console.log(userInfo)
  }
  return (
    <Frame grayBg style={{ overflow: 'hidden', background: 'url(https://cdn.coffeebeats.cn/beijing.png)', backgroundSize: '100% 100%', minHeight: '100vh' }}>
      <Ling ref={ling} />
      <View style={{ position: 'relative', zIndex: 0, overflow: 'hidden', width: '750rpx', height: '330rpx' }}>
        <Image className="chuchuIcon" src="https://cdn.coffeebeats.cn/%E5%8D%A1%E9%80%9A%E5%BD%A2%E8%B1%A1_%E6%A5%9A%E6%A5%9A%E6%83%A0%E6%83%A0.png" />
        {showLogo && <Image src="https://fangxt-object.oss-rg-china-mainland.aliyuncs.com/logo.png" mode="widthFix" style={{ position: 'absolute', top: '30rpx', left: '30rpx', width: '190rpx', height: '190rpx', zIndex: 1 }} />}
        {/*{title && <Text style={{ position: 'absolute', top: '30rpx', left: 0, width: '750rpx', textAlign: 'center', color: 'white', fontSize: '70rpx', zIndex: 1 }}>{title}</Text>}*/}
        {/* {title && <View>
          <span style={{ position: 'absolute', top: '18rpx', left: '254rpx', width: '600rpx', textAlign: 'center', color: '#353535', fontSize: '33rpx', zIndex: 1, textShadow: '5rpx 5rpx 5prx #ddd' }}>{title[0]}</span>
          <span style={{ position: 'absolute', top: '66rpx', left: '254rpx', width: '600rpx', textAlign: 'center', color: '#353535', fontSize: '28rpx', zIndex: 1, textShadow: '5rpx 5rpx 5prx #ddd' }}>{title[1]}</span>
          <span style={{ position: 'absolute', top: '111rpx', left: '254rpx', width: '600rpx', textAlign: 'center', color: '#353535', fontSize: '30rpx', zIndex: 1, textShadow: '5rpx 5rpx 5prx #ddd' }}>{title[2]}</span>
        </View>} */}
        <Image src="https://cdn.coffeebeats.cn/%E5%9B%BE%E7%89%871.png" mode="widthFix" style={{ position: 'absolute', top: 0, left: 0, width: '750rpx', height: '250rpx' }} />
      </View>

      <View className="buttonsWrapper">
        <View className="indexButton" onTap={async() => getUserInfoFunc()}><Image className="buttonImage" src="https://cdn.coffeebeats.cn/jj.png"/>在线咨询</View>
        <View className="indexButton" onTap={() => ling.current.info('敬请期待')}><Image className="buttonImage" src="https://cdn.coffeebeats.cn/ll.png"/>办事网点</View>
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
            <Tabs.TabContent key="question" tab="常见问题">
              <Card>
                {questions.slice(0, 6).map((q, i) =>
                  <View key={i}
                        onTap={async() => getUserInfoFunc(q)}
                        style={{ padding: '10rpx', borderBottom: 'solid thin rgba(221,221,221,0.5)' }}>
                  {/* <Text style={{ color: i <= 2 ? 'red' : (i <= 3 ? 'orange' : 'gray') }}>{i+1}</Text>.  */}
                  <Image src="https://cdn.coffeebeats.cn/nn.png" style={{ width: '36px', height: '30px', marginRight: 10, position: "relative", top: "5px"}}/>
                  {q}
                </View>)}
              </Card>
            </Tabs.TabContent>
            <Tabs.TabContent key="tag" tab="热门标签">
              <Card>
                {tags.slice(0, 9).map((t, i) =>
                  <Tag key={i} plain size="large"
                       onTap={async() => getUserInfoFunc('', t)}
                       style={{ width: '195rpx', margin: '10rpx' }}>{t}</Tag>)}
              </Card>
            </Tabs.TabContent>
          </Tabs>
        </Block>}


      <View className="indexBottombuttonsWrapper">
        <View className="bottomButton" onTap={() => ling.current.info('敬请期待')}>
          <Image className="buttonImageV2" src="https://cdn.coffeebeats.cn/999.png"/>
          <View>EMS查询</View>
        </View>
        <View className="bottomButton" onTap={() => ling.current.info('敬请期待')}>
          <Image className="buttonImageV2_1" src="https://cdn.coffeebeats.cn/nnnasd.png"/>
          <View>改进建议</View>
        </View>
        <View className="bottomButton" onTap={() => ling.current.info('敬请期待')}>
          <Image className="buttonImageV2_2" src="https://cdn.coffeebeats.cn/lskdm.png"/>
          <View>更多服务</View>
        </View>
      </View>

      <Block contentStyle={{ width: '650rpx', margin: '100rpx 50rpx' }}>
        {/* <Button onTap={async() => getUserInfoFunc()} loading={isLoading || isInfoLoading} block shape="square" size="superlarge" type="primary" style={{ fontSize:"40rpx" }}>
          <Icon type="friend" size="50rpx" color="white" />
          在线咨询
        </Button> */}
        {/*<Button open-type="getPhoneNumber" bindgetphonenumber={onGetPhoneNumber} loading={isLoading} block size="superlarge" look="secure" style={{ fontSize:"40rpx" }}>*/}
        {/*  <Icon type="friend" size="50rpx" color="white" />*/}
        {/*  获取手机号*/}
        {/*</Button>*/}
        <text style={{ padding: '12rpx', fontSize: '32rpx', color: '#666' }}>
          {errorMessage}
        </text>
        {/* <Button onTap={() => ling.current.info('敬请期待')} block shape="square" size="superlarge" type="default" style={{ fontSize:"40rpx", marginTop: '30rpx' }}>
          更多服务
        </Button> */}
      </Block>
    </Frame>
  );
};
