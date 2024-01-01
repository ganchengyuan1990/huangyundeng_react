import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Card, Col, Icon, Ling, Row, SearchBar, Skeleton, Tag, Popup } from 'annar';
import Frame from '../../utils/frame';
import Block from '../../utils/block';
import { usePageEvent } from 'remax/macro';
import { Text, View } from 'remax/one';
import { feedback, getHotQuestions, qa } from '../../apis/qa';
import { Image } from 'remax/wechat';
import "./index.css";
import accountManager from '../account/accountManager';
import { getAccountInfoSync, setNavigationBarTitle } from '@remax/wechat/esm/api';
import { getBase } from '../../apis/account';

// 办事网点页面
export default () => {
  let account = accountManager.getAccount();
  const ling = useRef<any>();

  const spots = [{
    name: "洪山政务服务中心",
    address: "洪山区文秀街9号",
    contact: "027-65397104",
    workTime: "周一至周五9:00-17:00（8:30可取号）；周六：9：00-16：00；所有假日与国家法定节假日同步。（若需要办理继承询问笔录业务，律师工作时间为周一至周五，早上9点至12点，下午1点30至5点）"
  },{
    name: "洪山政务服务中心",
    address: "洪山区文秀街9号",
    contact: "027-65397104",
    workTime: "周一至周五9:00-17:00（8:30可取号）；周六：9：00-16：00；所有假日与国家法定节假日同步。（若需要办理继承询问笔录业务，律师工作时间为周一至周五，早上9点至12点，下午1点30至5点）"
  }]

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

      <View className="indexButton" style={{ position: 'relative', zIndex: 1, background: "unset" }}>
        <Image className="buttonImage" src="https://cdn.coffeebeats.cn/ll.png"/>
        <Text style={{ color: '#333' }}>办事网点</Text>
      </View>


      <View className="indexBottombuttonsWrapper">
          {/* <Image className="imgScene" mode="widthFill" src="http://oss-open.aichan.info/imgs/hhhhhhh.png"/> */}
          <Card>
            {spots.slice(0, 6).map((q, i) =>
              <View key={i}
                style={{  display: "flex", padding: '24rpx 12rpx', borderBottom: 'solid thin rgba(221,221,221,0.5)' }}>
                {/* <Text style={{ color: i <= 2 ? 'red' : (i <= 3 ? 'orange' : 'gray') }}>{i+1}</Text>.  */}
                <View style={{ flex: 2 }}>
                  <View style={{ fontSize: '28px', marginBottom: "12px" }}>{q.name}</View>
                  <View style={{ fontSize: '22px', color: "#888" }}>{q.address}</View>
                </View>
                <View style={{ flex: 3 }}>
                  <View style={{ fontSize: '28px', marginBottom: "12px" }} onTap={() => {
                    wx.makePhoneCall({
                      phoneNumber: q.contact //仅为示例，并非真实的电话号码
                    })
                  }}>{q.contact}</View>
                  <View style={{ fontSize: '22px', color: "#888" }}>{q.workTime}</View>
                </View>
              </View>)
            }
          </Card>
      </View>

    </Frame>
  );
};
