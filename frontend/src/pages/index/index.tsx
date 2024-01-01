import * as React from 'react';
import { Button, Card, Icon, Ling, Skeleton, Tabs, Tag } from 'annar';
import FileList from "./components/file/index";
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
  const [uploadToken, uploadTokenSetter] = useState('');
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
        <View className="indexButton" onTap={() => {
          redirectTo({
            url: `/pages/info/info`
          })
        }}><Image className="buttonImage" src="https://cdn.coffeebeats.cn/ll.png"/>在线办理</View>
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
            <Tabs.TabContent key="quesionKind" tab="问题类别导航">
              <Card>
                {[
                  '抵押',
                  '转移登记',
                  '办理资料清单',
                  '新房办证',
                  '法律法规',
                  '联系方式',
                  '名词解释',
                  '收费标准',
                  '便民服务',
                  '跨区/异地办理',
                ].slice(0, 10).map((t, i) =>
                  <Tag key={i} plain size="large"
                      //  onTap={async() => getUserInfoFunc('', t)}
                       style={{ width: '195rpx', margin: '10rpx' }}>{t}</Tag>)}
              </Card>
            </Tabs.TabContent>
            <Tabs.TabContent key="policy" tab="热点政策">
              <View>
                <FileList files={[{
                  name: "关于做好不动产登记办理时限“再提速”的通知（公开）",
                  url: `http://oss-open.aichan.info/pdfs/%E6%AD%A6%E8%87%AA%E7%84%B6%E8%B5%84%E8%A7%84%E5%8F%91%5B2020%5D48%E5%8F%B7%20%E5%85%B3%E4%BA%8E%E5%81%9A%E5%A5%BD%E4%B8%8D%E5%8A%A8%E4%BA%A7%E7%99%BB%E8%AE%B0%E5%8A%9E%E7%90%86%E6%97%B6%E9%99%90%E2%80%9C%E5%86%8D%E6%8F%90%E9%80%9F%E2%80%9D%E7%9A%84%E9%80%9A%E7%9F%A5%EF%BC%88%E5%85%AC%E5%BC%80%EF%BC%89.pdf`
                },{
                  name: "推行不动产电子证书（公开）",
                  url: `http://oss-open.aichan.info/pdfs/%E6%AD%A6%E8%87%AA%E7%84%B6%E8%B5%84%E8%A7%84%E5%8F%91%5B2020%5D50%E5%8F%B7%20%E6%8E%A8%E8%A1%8C%E4%B8%8D%E5%8A%A8%E4%BA%A7%E7%94%B5%E5%AD%90%E8%AF%81%E4%B9%A6%EF%BC%88%E5%85%AC%E5%BC%80%EF%BC%89.pdf`
                },{
                  name: "不审核婚姻--公开",
                  url: `http://oss-open.aichan.info/pdfs/%E6%AD%A6%E8%87%AA%E7%84%B6%E8%B5%84%E8%A7%84%E5%8F%91%5B2020%5D125%E5%8F%B7%20%E4%B8%8D%E5%AE%A1%E6%A0%B8%E5%A9%9A%E5%A7%BB--%E5%85%AC%E5%BC%80.pdf`
                },{
                  name: "关于进一步优化离婚析产类不动产转移登记工作（公开）",
                  url: `http://oss-open.aichan.info/pdfs/%E6%AD%A6%E8%87%AA%E7%84%B6%E8%B5%84%E8%A7%84%E5%8F%91%5B2021%5D11%E5%8F%B7%20%E5%85%B3%E4%BA%8E%E8%BF%9B%E4%B8%80%E6%AD%A5%E4%BC%98%E5%8C%96%E7%A6%BB%E5%A9%9A%E6%9E%90%E4%BA%A7%E7%B1%BB%E4%B8%8D%E5%8A%A8%E4%BA%A7%E8%BD%AC%E7%A7%BB%E7%99%BB%E8%AE%B0%E5%B7%A5%E4%BD%9C%EF%BC%88%E5%85%AC%E5%BC%80%EF%BC%89.pdf`
                },{
                  name: "推行不动产登记证明事项告知承诺制（公开）",
                  url: `http://oss-open.aichan.info/pdfs/%E6%AD%A6%E8%87%AA%E7%84%B6%E8%B5%84%E8%A7%84%E5%8F%91%5B2021%5D62%E5%8F%B7%20%E6%8E%A8%E8%A1%8C%E4%B8%8D%E5%8A%A8%E4%BA%A7%E7%99%BB%E8%AE%B0%E8%AF%81%E6%98%8E%E4%BA%8B%E9%A1%B9%E5%91%8A%E7%9F%A5%E6%89%BF%E8%AF%BA%E5%88%B6%28%E5%85%AC%E5%BC%80%EF%BC%89.pdf`
                },{
                  name: "关于优化企业间存量非住宅交易税收登记工作的通知",
                  url: `http://oss-open.aichan.info/pdfs/%E6%AD%A6%E8%87%AA%E7%84%B6%E8%B5%84%E8%A7%84%E5%8F%91%5B2021%5D68%E5%8F%B7%E5%85%B3%E4%BA%8E%E4%BC%98%E5%8C%96%E4%BC%81%E4%B8%9A%E9%97%B4%E5%AD%98%E9%87%8F%E9%9D%9E%E4%BD%8F%E5%AE%85%E4%BA%A4%E6%98%93%E7%A8%8E%E6%94%B6%E7%99%BB%E8%AE%B0%E5%B7%A5%E4%BD%9C%E7%9A%84%E9%80%9A%E7%9F%A5.pdf`
                },{
                  name: "关于推行“不动产登记水电气过户（变更）一体化”联办业务的通知（公开）",
                  url: `http://oss-open.aichan.info/pdfs/%E6%AD%A6%E8%87%AA%E7%84%B6%E8%B5%84%E8%A7%84%E5%8F%91%5B2021%5D80%E5%8F%B7%20%E5%85%B3%E4%BA%8E%E6%8E%A8%E8%A1%8C%E2%80%9C%E4%B8%8D%E5%8A%A8%E4%BA%A7%E7%99%BB%E8%AE%B0%E6%B0%B4%E7%94%B5%E6%B0%94%E8%BF%87%E6%88%B7%EF%BC%88%E5%8F%98%E6%9B%B4%EF%BC%89%E4%B8%80%E4%BD%93%E5%8C%96%E2%80%9D%E8%81%94%E5%8A%9E%E4%B8%9A%E5%8A%A1%E7%9A%84%E9%80%9A%E7%9F%A5%EF%BC%88%E5%85%AC%E5%BC%80%EF%BC%89.pdf`
                },{
                  name: "关于进一步加强银行业金融机构不动产抵押权注销登记业务“全程网办”风险防范工作的通知（公开）",
                  url: `http://oss-open.aichan.info/pdfs/%E6%AD%A6%E8%87%AA%E7%84%B6%E8%B5%84%E8%A7%84%E5%8F%91%5B2022%5D2%E5%8F%B7%20%E5%85%B3%E4%BA%8E%E8%BF%9B%E4%B8%80%E6%AD%A5%E5%8A%A0%E5%BC%BA%E9%93%B6%E8%A1%8C%E4%B8%9A%E9%87%91%E8%9E%8D%E6%9C%BA%E6%9E%84%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%B5%E6%8A%BC%E6%9D%83%E6%B3%A8%E9%94%80%E7%99%BB%E8%AE%B0%E4%B8%9A%E5%8A%A1%E2%80%9C%E5%85%A8%E7%A8%8B%E7%BD%91%E5%8A%9E%E2%80%9D%E9%A3%8E%E9%99%A9%E9%98%B2%E8%8C%83%E5%B7%A5%E4%BD%9C%E7%9A%84%E9%80%9A%E7%9F%A5%EF%BC%88%E5%85%AC%E5%BC%80%EF%BC%89.doc`
                },{
                  name: "关于开展遗产管理人协助办理不动产非公证继承（受遗赠）登记工作（公开）",
                  url: `http://oss-open.aichan.info/pdfs/%E6%AD%A6%E8%87%AA%E7%84%B6%E8%B5%84%E8%A7%84%E5%8F%91%5B2022%5D48%E5%8F%B7%20%E5%85%B3%E4%BA%8E%E5%BC%80%E5%B1%95%E9%81%97%E4%BA%A7%E7%AE%A1%E7%90%86%E4%BA%BA%E5%8D%8F%E5%8A%A9%E5%8A%9E%E7%90%86%E4%B8%8D%E5%8A%A8%E4%BA%A7%E9%9D%9E%E5%85%AC%E8%AF%81%E7%BB%A7%E6%89%BF%EF%BC%88%E5%8F%97%E9%81%97%E8%B5%A0%EF%BC%89%E7%99%BB%E8%AE%B0%E5%B7%A5%E4%BD%9C%EF%BC%88%E5%85%AC%E5%BC%80%EF%BC%89.pdf`
                },{
                  name: "关于开展银行业金融机构不动产抵押权登记业务“全程网办”的通知（公开）",
                  url: `http://oss-open.aichan.info/pdfs/%E6%AD%A6%E8%87%AA%E7%84%B6%E8%B5%84%E8%A7%84%E5%8F%91%E3%80%942020%E3%80%95%E5%B9%B438%E5%8F%B7%20%E5%85%B3%E4%BA%8E%E5%BC%80%E5%B1%95%E9%93%B6%E8%A1%8C%E4%B8%9A%E9%87%91%E8%9E%8D%E6%9C%BA%E6%9E%84%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%B5%E6%8A%BC%E6%9D%83%E7%99%BB%E8%AE%B0%E4%B8%9A%E5%8A%A1%E2%80%9C%E5%85%A8%E7%A8%8B%E7%BD%91%E5%8A%9E%E2%80%9D%E7%9A%84%E9%80%9A%E7%9F%A5%EF%BC%88%E5%85%AC%E5%BC%80%EF%BC%89.pdf`
                }]}/>
              </View>
            </Tabs.TabContent>
          </Tabs>
        </Block>}


      {/* <View className="indexBottombuttonsWrapper">
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
      </View> */}

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
