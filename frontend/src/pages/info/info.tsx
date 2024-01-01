import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Card, Col, Icon, Ling, Row, SearchBar, Skeleton, Tag, Popup } from 'annar';
import Frame from '../../utils/frame';
import Block from '../../utils/block';
import { usePageEvent } from 'remax/macro';
import { Text, View } from 'remax/one';
import { feedback, getHotQuestions, qa } from '../../apis/qa';
import { Image, redirectTo } from 'remax/wechat';
import "./index.css";
import accountManager from '../account/accountManager';
import { getAccountInfoSync, setNavigationBarTitle } from '@remax/wechat/esm/api';
import { getBase } from '../../apis/account';

// 在线办理页面
export default () => {
  let account = accountManager.getAccount();
  const ling = useRef<any>();
  const [questionText, questionTextSetter] = useState('');
  const [keyboradHeight, setKeyboradHeight] = useState(0);
  const [showTextArea, setShowTextArea] = useState(false);


  const [title, titleSetter] = useState('');

  const [guessTagShow, guessTagShowSetter] = React.useState(false);
  const [chooseTag, chooseTagSetter] = React.useState('');
  const [tagLoading, tagLoadingSetter] = useState(true);
  const [questions, setQuestions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [collapse, setCollapse] = useState(true);

  const [qas, qasSetter] = React.useState<{ type: 'ai' | 'user', recordId: string, message: string, collapse?: boolean }[]>([]);
  const [qaAnswerLoading, qaAnswerLoadingSetter] = React.useState(false);

  useEffect(() => {
    (async () => {
    })();
  }, []);

  usePageEvent('onLoad', options => {
  });


  return (
    <Frame grayBg style={{ overflow: 'hidden', minHeight: '100vh', paddingBottom: '200rpx' }}>
      <Ling ref={ling} />

      <View style={{ height: '100vh', background: 'url(https://cdn.coffeebeats.cn/beijing.png)', backgroundSize: '100% 100%', position: 'fixed', left: 0, right: 0 }}></View>

      <View style={{ position: 'relative', zIndex: 0, overflow: 'hidden', width: '750rpx', height: '330rpx' }}>
        <Image className="chuchuIcon" src="https://cdn.coffeebeats.cn/%E5%8D%A1%E9%80%9A%E5%BD%A2%E8%B1%A1_%E6%A5%9A%E6%A5%9A%E6%83%A0%E6%83%A0.png" />
        {/*{title && <Text style={{ position: 'absolute', top: '30rpx', left: 0, width: '750rpx', textAlign: 'center', color: 'white', fontSize: '70rpx', zIndex: 1 }}>{title}</Text>}*/}
        {/* {title && <View>
          <span style={{ position: 'absolute', top: '18rpx', left: '254rpx', width: '600rpx', textAlign: 'center', color: '#353535', fontSize: '33rpx', zIndex: 1, textShadow: '5rpx 5rpx 5prx #ddd' }}>{title[0]}</span>
          <span style={{ position: 'absolute', top: '66rpx', left: '254rpx', width: '600rpx', textAlign: 'center', color: '#353535', fontSize: '28rpx', zIndex: 1, textShadow: '5rpx 5rpx 5prx #ddd' }}>{title[1]}</span>
          <span style={{ position: 'absolute', top: '111rpx', left: '254rpx', width: '600rpx', textAlign: 'center', color: '#353535', fontSize: '30rpx', zIndex: 1, textShadow: '5rpx 5rpx 5prx #ddd' }}>{title[2]}</span>
        </View>} */}
        <Image src="https://cdn.coffeebeats.cn/%E5%9B%BE%E7%89%871.png" mode="widthFix" style={{ position: 'absolute', top: 0, left: 0, width: '750rpx', height: '250rpx' }} />
      </View>


      <View className="indexBottombuttonsWrapper">
        <View className="bottomButton" onTap={() =>  redirectTo({
            url: `/pages/spot/index`
          })}>
          <Image className="buttonImageV2" src="https://cdn.coffeebeats.cn/999.png"/>
          <View>办事网点</View>
        </View>
        <View className="bottomButton" onTap={() => ling.current.info('敬请期待')}>
          <Image className="buttonImageV2" src="https://cdn.coffeebeats.cn/999.png"/>
          <View>下载文件</View>
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

    </Frame>
  );
};
