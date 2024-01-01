import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Card, Col, Icon, Ling, Row, SearchBar, Skeleton, Tag, Popup } from 'annar';
import Frame from '../../utils/frame';
import Block from '../../utils/block';
import { usePageEvent } from 'remax/macro';
import { Text, View } from 'remax/one';
import FileList from "../index/components/file/index";
import { feedback, getHotQuestions, qa } from '../../apis/qa';
import { Image } from 'remax/wechat';
import "./index.css";
import accountManager from '../account/accountManager';
import { getAccountInfoSync, setNavigationBarTitle } from '@remax/wechat/esm/api';
import { getBase } from '../../apis/account';

// 文件下载页面
export default () => {
  let account = accountManager.getAccount();
  const ling = useRef<any>();

  useEffect(() => {
    (async () => {
    })();
  }, []);

  usePageEvent('onLoad', options => {
  });


  return (
    <Frame grayBg style={{ overflow: 'hidden', minHeight: '100vh', paddingBottom: '200rpx' }}>


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
      <View>
        <FileList 
          saveFile={true}
          files={[{
            name: "关于做好不动产登记办理时限“再提速”的通知（公开）",
            url: `http://oss-open.aichan.info/pdfs/%E6%AD%A6%E8%87%AA%E7%84%B6%E8%B5%84%E8%A7%84%E5%8F%91%5B2020%5D48%E5%8F%B7%20%E5%85%B3%E4%BA%8E%E5%81%9A%E5%A5%BD%E4%B8%8D%E5%8A%A8%E4%BA%A7%E7%99%BB%E8%AE%B0%E5%8A%9E%E7%90%86%E6%97%B6%E9%99%90%E2%80%9C%E5%86%8D%E6%8F%90%E9%80%9F%E2%80%9D%E7%9A%84%E9%80%9A%E7%9F%A5%EF%BC%88%E5%85%AC%E5%BC%80%EF%BC%89.pdf`
          }, {
            name: "推行不动产电子证书（公开）",
            url: `http://oss-open.aichan.info/pdfs/%E6%AD%A6%E8%87%AA%E7%84%B6%E8%B5%84%E8%A7%84%E5%8F%91%5B2020%5D50%E5%8F%B7%20%E6%8E%A8%E8%A1%8C%E4%B8%8D%E5%8A%A8%E4%BA%A7%E7%94%B5%E5%AD%90%E8%AF%81%E4%B9%A6%EF%BC%88%E5%85%AC%E5%BC%80%EF%BC%89.pdf`
          }, {
            name: "不审核婚姻--公开",
            url: `http://oss-open.aichan.info/pdfs/%E6%AD%A6%E8%87%AA%E7%84%B6%E8%B5%84%E8%A7%84%E5%8F%91%5B2020%5D125%E5%8F%B7%20%E4%B8%8D%E5%AE%A1%E6%A0%B8%E5%A9%9A%E5%A7%BB--%E5%85%AC%E5%BC%80.pdf`
          }, {
            name: "关于进一步优化离婚析产类不动产转移登记工作（公开）",
            url: `http://oss-open.aichan.info/pdfs/%E6%AD%A6%E8%87%AA%E7%84%B6%E8%B5%84%E8%A7%84%E5%8F%91%5B2021%5D11%E5%8F%B7%20%E5%85%B3%E4%BA%8E%E8%BF%9B%E4%B8%80%E6%AD%A5%E4%BC%98%E5%8C%96%E7%A6%BB%E5%A9%9A%E6%9E%90%E4%BA%A7%E7%B1%BB%E4%B8%8D%E5%8A%A8%E4%BA%A7%E8%BD%AC%E7%A7%BB%E7%99%BB%E8%AE%B0%E5%B7%A5%E4%BD%9C%EF%BC%88%E5%85%AC%E5%BC%80%EF%BC%89.pdf`
          }, {
            name: "推行不动产登记证明事项告知承诺制（公开）",
            url: `http://oss-open.aichan.info/pdfs/%E6%AD%A6%E8%87%AA%E7%84%B6%E8%B5%84%E8%A7%84%E5%8F%91%5B2021%5D62%E5%8F%B7%20%E6%8E%A8%E8%A1%8C%E4%B8%8D%E5%8A%A8%E4%BA%A7%E7%99%BB%E8%AE%B0%E8%AF%81%E6%98%8E%E4%BA%8B%E9%A1%B9%E5%91%8A%E7%9F%A5%E6%89%BF%E8%AF%BA%E5%88%B6%28%E5%85%AC%E5%BC%80%EF%BC%89.pdf`
          }, {
            name: "关于优化企业间存量非住宅交易税收登记工作的通知",
            url: `http://oss-open.aichan.info/pdfs/%E6%AD%A6%E8%87%AA%E7%84%B6%E8%B5%84%E8%A7%84%E5%8F%91%5B2021%5D68%E5%8F%B7%E5%85%B3%E4%BA%8E%E4%BC%98%E5%8C%96%E4%BC%81%E4%B8%9A%E9%97%B4%E5%AD%98%E9%87%8F%E9%9D%9E%E4%BD%8F%E5%AE%85%E4%BA%A4%E6%98%93%E7%A8%8E%E6%94%B6%E7%99%BB%E8%AE%B0%E5%B7%A5%E4%BD%9C%E7%9A%84%E9%80%9A%E7%9F%A5.pdf`
          }, {
            name: "关于推行“不动产登记水电气过户（变更）一体化”联办业务的通知（公开）",
            url: `http://oss-open.aichan.info/pdfs/%E6%AD%A6%E8%87%AA%E7%84%B6%E8%B5%84%E8%A7%84%E5%8F%91%5B2021%5D80%E5%8F%B7%20%E5%85%B3%E4%BA%8E%E6%8E%A8%E8%A1%8C%E2%80%9C%E4%B8%8D%E5%8A%A8%E4%BA%A7%E7%99%BB%E8%AE%B0%E6%B0%B4%E7%94%B5%E6%B0%94%E8%BF%87%E6%88%B7%EF%BC%88%E5%8F%98%E6%9B%B4%EF%BC%89%E4%B8%80%E4%BD%93%E5%8C%96%E2%80%9D%E8%81%94%E5%8A%9E%E4%B8%9A%E5%8A%A1%E7%9A%84%E9%80%9A%E7%9F%A5%EF%BC%88%E5%85%AC%E5%BC%80%EF%BC%89.pdf`
          }, {
            name: "关于进一步加强银行业金融机构不动产抵押权注销登记业务“全程网办”风险防范工作的通知（公开）",
            url: `http://oss-open.aichan.info/pdfs/%E6%AD%A6%E8%87%AA%E7%84%B6%E8%B5%84%E8%A7%84%E5%8F%91%5B2022%5D2%E5%8F%B7%20%E5%85%B3%E4%BA%8E%E8%BF%9B%E4%B8%80%E6%AD%A5%E5%8A%A0%E5%BC%BA%E9%93%B6%E8%A1%8C%E4%B8%9A%E9%87%91%E8%9E%8D%E6%9C%BA%E6%9E%84%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%B5%E6%8A%BC%E6%9D%83%E6%B3%A8%E9%94%80%E7%99%BB%E8%AE%B0%E4%B8%9A%E5%8A%A1%E2%80%9C%E5%85%A8%E7%A8%8B%E7%BD%91%E5%8A%9E%E2%80%9D%E9%A3%8E%E9%99%A9%E9%98%B2%E8%8C%83%E5%B7%A5%E4%BD%9C%E7%9A%84%E9%80%9A%E7%9F%A5%EF%BC%88%E5%85%AC%E5%BC%80%EF%BC%89.doc`
          }, {
            name: "关于开展遗产管理人协助办理不动产非公证继承（受遗赠）登记工作（公开）",
            url: `http://oss-open.aichan.info/pdfs/%E6%AD%A6%E8%87%AA%E7%84%B6%E8%B5%84%E8%A7%84%E5%8F%91%5B2022%5D48%E5%8F%B7%20%E5%85%B3%E4%BA%8E%E5%BC%80%E5%B1%95%E9%81%97%E4%BA%A7%E7%AE%A1%E7%90%86%E4%BA%BA%E5%8D%8F%E5%8A%A9%E5%8A%9E%E7%90%86%E4%B8%8D%E5%8A%A8%E4%BA%A7%E9%9D%9E%E5%85%AC%E8%AF%81%E7%BB%A7%E6%89%BF%EF%BC%88%E5%8F%97%E9%81%97%E8%B5%A0%EF%BC%89%E7%99%BB%E8%AE%B0%E5%B7%A5%E4%BD%9C%EF%BC%88%E5%85%AC%E5%BC%80%EF%BC%89.pdf`
          }, {
            name: "关于开展银行业金融机构不动产抵押权登记业务“全程网办”的通知（公开）",
            url: `http://oss-open.aichan.info/pdfs/%E6%AD%A6%E8%87%AA%E7%84%B6%E8%B5%84%E8%A7%84%E5%8F%91%E3%80%942020%E3%80%95%E5%B9%B438%E5%8F%B7%20%E5%85%B3%E4%BA%8E%E5%BC%80%E5%B1%95%E9%93%B6%E8%A1%8C%E4%B8%9A%E9%87%91%E8%9E%8D%E6%9C%BA%E6%9E%84%E4%B8%8D%E5%8A%A8%E4%BA%A7%E6%8A%B5%E6%8A%BC%E6%9D%83%E7%99%BB%E8%AE%B0%E4%B8%9A%E5%8A%A1%E2%80%9C%E5%85%A8%E7%A8%8B%E7%BD%91%E5%8A%9E%E2%80%9D%E7%9A%84%E9%80%9A%E7%9F%A5%EF%BC%88%E5%85%AC%E5%BC%80%EF%BC%89.pdf`
          }]} 
        />
      </View>
    </Frame>
  );
};
