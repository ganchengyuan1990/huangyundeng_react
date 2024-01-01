import * as React from 'react';
import { Button, Card, Icon, Ling, Skeleton, Tabs, Tag } from 'annar';
import { getUserProfile, Image, login as wxLogin, redirectTo, showShareMenu, showShareImageMenu } from 'remax/wechat';
import { useEffect, useRef, useState } from 'react';
import { View, Text } from 'remax/one';
import "./index.css";
import { getAccountInfoSync, setNavigationBarTitle } from '@remax/wechat/esm/api';

export default (props) => {
  const {
    files = [],
    saveFile = false,
  } = props;
  // const [questions, setQuestions] = useState<string[]>([]);
  // const [tags, setTags] = useState<string[]>([]);
  // const [isLoading, isLoadingSetter] = useState(true);
  // const [isInfoLoading, isInfoLoadingSetter] = useState(false);
  // const [errorMessage, errorMessageSetter] = useState('');
  // const ling = useRef<any>();

  // useEffect(() => {


  //   (async function() {

  //   })()
  // }, [])

  const openFile = async (q) => {
    wx?.downloadFile({
      // 示例 url，并非真实存在
      url: q.url,
      success: function (res) {
        const filePath = res.tempFilePath
        wx?.openDocument({
          filePath: filePath,
          success: function (res) {
            console.log('打开文档成功')
          }
        })
        saveFile && wx.saveFile({
          tempFilePath: res.tempFilePath
        }).then(console.log)
      },
      fail: (e) => {
      }
    })
  }

  return (
    <Card>
      {files.slice(0, 10).map((q, i) =>
        <View key={i}
              onTap={async() => openFile(q)}
              style={{ padding: '10rpx', borderBottom: 'solid thin rgba(221,221,221,0.5)' }}>
        {/* <Text style={{ color: i <= 2 ? 'red' : (i <= 3 ? 'orange' : 'gray') }}>{i+1}</Text>.  */}
        <Image src="https://cdn.coffeebeats.cn/nn.png" style={{ width: '36px', height: '30px', marginRight: 10, position: "relative", top: "5px"}}/>
        {q?.name}
      </View>)}
    </Card>
  );
};
