import * as React from 'react';
import { Card } from 'annar';
import { downloadFile, openDocument, saveFile } from 'remax/wechat';
import { View, Image } from 'remax/one';
import './index.css';

export default (props) => {
  const {
    files = [],
    saveFile: needSaveFile = false,
  } = props;

  const openFile = async (q) => {
    downloadFile({
      // 示例 url，并非真实存在
      url: q.url,
      success: function (res) {
        const filePath = res.tempFilePath
        openDocument({
          filePath: filePath,
          success: function (res) {
            console.log('打开文档成功')
          }
        })
        needSaveFile && saveFile({
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
