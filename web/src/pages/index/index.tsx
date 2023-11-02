import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button, Card, Skeleton, Tabs, Tag } from 'antd';
import Frame from '../../utils/frame';
import Block from '../../utils/block';
import logoPng from '../../assets/logo.png';
import titlePng from '../../assets/title.png';
import title1Png from '../../assets/title1.png';
import { getBase, postLogin, postWebLogin } from '../../apis/account';
import accountManager from '../account/accountManager';
import { getHotQuestions } from '../../apis/qa';
import { useNavigate } from 'react-router-dom';
import { AccountModel } from '../../types/account';
import { TeamOutlined, } from '@ant-design/icons';


export const IndexPage = () => {
  const [showLogo, showLogoSetter] = useState(false);
  const [title, titleSetter] = useState('');

  const [questions, setQuestions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [isLoading, isLoadingSetter] = useState(true);
  const [errorMessage, errorMessageSetter] = useState('');
  const navigate = useNavigate()

  useEffect(() => {
    let account: AccountModel | null = accountManager.getAccount();
    accountManager.listenAccountChange(v => account=v);
    (async function() {
      const { title, showLogo } = await getBase('wx07755a85c868c35d')
      showLogoSetter(showLogo)
      titleSetter(title)
      document.title = title

      const { questions, tags } = await getHotQuestions()
      setQuestions(questions)
      setTags(tags)

      if (account) {
        isLoadingSetter(false)
        return;
      }
      try {
        let sessionid;
        ({ sessionid, account } = await postWebLogin('1234567890'));
        accountManager.setAccount(account, sessionid)
        isLoadingSetter(false)
      } catch (e) {
        // @ts-ignore
        errorMessageSetter('服务器连接失败，请稍后再试： '+e?.message)
      }
    })()
  }, [])
  const getUserInfoFunc = async (question: string = '', tag: string = '') => {
    await navigate(`/qa/qa?question=${question}&tag=${tag}`)
  }
  return (
    <Frame grayBg style={{ overflow: 'hidden', minHeight: '1000px' }}>
      <div style={{ position: 'relative', width: '750px', height: '250px' }}>
        {showLogo && <img src={logoPng} style={{ position: 'absolute', top: '30px', right: '30px', width: '100px', height: '100px', zIndex: 1 }} />}
        {title && <span style={{ position: 'absolute', top: '50px', left: '150px', width: '600px', textAlign: 'center', color: '#353535', fontSize: '96px', zIndex: 1, textShadow: '5px 5px 5px #ddd' }}>{title}</span>}
        <img src={title1Png} style={{ position: 'absolute', top: 0, left: 0, width: '750px', height: '250px' }} />
      </div>

      {isLoading
        ? <Block padding title={<>热门问题</>}><Skeleton /></Block>
        : <Block padding contentStyle={{ padding: '0 10px' }}>
          <Tabs
            type="card"
            animated
            centered
            tabBarStyle={{ margin: 0, marginTop: '10px' }}
            items={[
              {
                label: `热门问题`,
                key: 'question',

                children: <Card bodyStyle={{ paddingTop: 10, paddingBottom: 10 }}>
                  {questions.slice(0, 6).map((q, i) =>
                    <div key={i}
                         onClick={async() => getUserInfoFunc(q)}
                         style={{ padding: '10px', borderBottom: 'solid thin #ddd' }}>
                      <span style={{ color: i <= 2 ? 'red' : (i <= 3 ? 'orange' : 'gray') }}>{i+1}</span>. {q}
                    </div>)}
                </Card>,
              },
              {
                label: `热门标签`,
                key: 'tag',
                children: <Card>
                  {tags.slice(0, 9).map((t, i) =>
                    <Button key={i}
                         onClick={async() => getUserInfoFunc('', t)}
                         style={{ width: '200px', margin: '10px' }}>{t}</Button>)}
                </Card>,
              }
            ]}
          >
          </Tabs>
        </Block>}

      <Block contentStyle={{ width: '450px', margin: '50px 150px' }}>
        <Button onClick={async() => getUserInfoFunc()} loading={isLoading} block size="large" type="primary" style={{ fontSize:"20px" }}>
          <TeamOutlined />
          在线咨询
        </Button>
        <span style={{ padding: '12px', fontSize: '32px', color: '#666' }}>
          {errorMessage}
        </span>
        <Button onClick={() => alert('敬请期待')} block size="large" type="default" style={{ fontSize:"20px", marginTop: '30px' }}>
          更多服务
        </Button>
      </Block>
    </Frame>
  );
};
