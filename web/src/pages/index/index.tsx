import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { Button, Card, Skeleton, Tabs, message } from 'antd';
import Frame from '../../utils/frame';
import Block from '../../utils/block';
import logoPng from '../../assets/logo.png';
import titlePng from '../../assets/title.png';
import title1Png from '../../assets/title1.png';
import { postWebLogin } from '../../apis/account';
import accountManager from '../account/accountManager';
import { getHotQuestions } from '../../apis/qa';
import { useNavigate } from 'react-router-dom';
import { AccountModel } from '../../types/account';
import { TeamOutlined, } from '@ant-design/icons';
import { AppContext } from '../../App';


export const IndexPage = () => {
  const { title, showLogo } = useContext(AppContext)
  const [questions, setQuestions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, isLoadingSetter] = useState(true);
  const [errorMessage, errorMessageSetter] = useState('');
  const navigate = useNavigate()

  useEffect(() => {
    let account: AccountModel | null = accountManager.getAccount();
    accountManager.listenAccountChange(v => account=v);
    (async function() {
      const { questions, tags } = await getHotQuestions()
      setQuestions(questions)
      setTags(tags)

      if (account) {
        isLoadingSetter(false)
        return;
      }
      try {
        let sessionid;
        ({ sessionid, account } = await postWebLogin(window.location.host, '1234567890'));
        accountManager.setAccount(account, sessionid)
        isLoadingSetter(false)
      } catch (e) {
        // @ts-ignore
        errorMessageSetter('服务器连接失败，请稍后再试： '+e?.message)
      }
    })()


    // wx.downloadFile({
    //   // 示例 url，并非真实存在
    //   url: 'http://example.com/somefile.pdf',
    //   success: function (res) {
    //     const filePath = res.tempFilePath
    //     wx.openDocument({
    //       filePath: filePath,
    //       success: function (res) {
    //         console.log('打开文档成功')
    //       }
    //     })
    //   }
    // })
  }, [])
  const getUserInfoFunc = async (question: string = '', tag: string = '') => {
    await navigate(`/qa/qa?question=${question}&tag=${tag}`)
  }
  return (
    <Frame className="indexPage" grayBg style={{ overflow: 'hidden', background: 'url(https://cdn.coffeebeats.cn/beijing.png)', backgroundSize: '100% 100%', minHeight: '100vh' }}>
      <div style={{ position: 'relative', zIndex: 0, overflow: 'hidden', width: '75.0rem', height: '33.0rem' }}>
        <img className="chuchuIcon" src="https://cdn.coffeebeats.cn/%E5%8D%A1%E9%80%9A%E5%BD%A2%E8%B1%A1_%E6%A5%9A%E6%A5%9A%E6%83%A0%E6%83%A0.png" />
        {/* {showLogo && <img src={logoPng} alt="logo" style={{ position: 'absolute', top: '3.0rem', right: '3.0rem', width: '10.0rem', height: '10.0rem', zIndex: 1 }} />} */}
        {/* {title && <span style={{ position: 'absolute', top: '2.3rem', left: '22.4rem', width: '60.0rem', textAlign: 'center', color: '#353535', fontSize: '5.4rem', zIndex: 1, textShadow: '.5rem .5rem .5rem #ddd' }}>{title}</span>} */}
        {/* <img src={title1Png} alt="" style={{ position: 'absolute', top: 0, left: 0, width: '75.0rem', height: '25.0rem' }} /> */}
        <img src="https://cdn.coffeebeats.cn/%E5%9B%BE%E7%89%871.png" style={{ position: 'absolute', top: 0, left: 0, height: '33rem', width: '100%' }} />

      </div>

      <div className="buttonsWrapper">
        <div className="indexButton" onClick={async() => getUserInfoFunc()}><img className="buttonImage" src="https://cdn.coffeebeats.cn/jj.png"/>在线咨询</div>
        <div className="indexButton" onClick={() => {
          message.info('敬请期待');
        }}><img className="buttonImage" src="https://cdn.coffeebeats.cn/ll.png"/>办事网点</div>
      </div>

      {isLoading
        ? <Block padding title={<>热门问题</>}><Skeleton /></Block>
        : <Block padding contentStyle={{ padding: '0 1.0rem' }}>
          <Tabs
            type="card"
            animated
            centered
            tabBarStyle={{ margin: 0, marginTop: '1.0rem' }}
            items={[
              {
                label: `热门问题`,
                key: 'question',

                children: <Card bodyStyle={{ paddingTop: 10, paddingBottom: 10 }}>
                  {questions.slice(0, 6).map((q, i) =>
                    <div key={i}
                         onClick={async() => getUserInfoFunc(q)}
                         style={{ padding: '1.0rem', borderBottom: 'solid thin #ddd', textAlign: 'left' }}>
                      <img src="https://cdn.coffeebeats.cn/nn.png" style={{ width: '18px', height: '15px', marginRight: 5, position: "relative", top: "2px"}}/>
                      {q}
                    </div>)}
                </Card>,
              },
              {
                label: `热门标签`,
                key: 'tag',
                children: <Card bodyStyle={{ padding: '2%'}}>
                  {tags.slice(0, 9).map((t, i) =>
                    <Button key={i}
                         onClick={async() => getUserInfoFunc('', t)}
                         style={{ width: '29.5%', margin: '1.5%' }}>{t}</Button>)}
                </Card>,
              }
            ]}
          >
          </Tabs>
        </Block>}

      {/* <Block contentStyle={{ width: '45.0rem', margin: '5.0rem 15.0rem' }}>
        <Button onClick={async() => getUserInfoFunc()} loading={isLoading} block size="large" type="primary" style={{ fontSize:"2.0rem", lineHeight: '2.0rem' }}>
          <TeamOutlined />
          在线咨询
        </Button>
        <span style={{ padding: '1.2rem', fontSize: '3.2rem', color: '#666' }}>
          {errorMessage}
        </span>
        <Button onClick={() => alert('敬请期待')} block size="large" type="default" style={{ fontSize:"2.0rem", lineHeight: '2.0rem', marginTop: '3.0rem' }}>
          更多服务
        </Button>
      </Block> */}

      <div className="indexBottombuttonsWrapper">
        <div className="bottomButton" onClick={() => message.info('敬请期待')}>
          <img className="buttonImageV2" src="https://cdn.coffeebeats.cn/999.png"/>
          <div>EMS查询</div>
        </div>
        <div className="bottomButton" onClick={() => message.info('敬请期待')}>
          <img className="buttonImageV2_1" src="https://cdn.coffeebeats.cn/nnnasd.png"/>
          <div>改进建议</div>
        </div>
        <div className="bottomButton" onClick={() => message.info('敬请期待')}>
          <img className="buttonImageV2_2" src="https://cdn.coffeebeats.cn/lskdm.png"/>
          <div>更多服务</div>
        </div>
      </div>
    </Frame>
  );
};
