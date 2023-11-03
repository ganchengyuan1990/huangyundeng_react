import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { Button, Card, Skeleton, Tabs } from 'antd';
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
    <Frame grayBg style={{ overflow: 'hidden', minHeight: '150.0rem' }}>
      <div style={{ position: 'relative', width: '75.0rem', height: '25.0rem' }}>
        {showLogo && <img src={logoPng} style={{ position: 'absolute', top: '3.0rem', right: '3.0rem', width: '10.0rem', height: '10.0rem', zIndex: 1 }} />}
        {title && <span style={{ position: 'absolute', top: '2.3rem', left: '22.4rem', width: '60.0rem', textAlign: 'center', color: '#353535', fontSize: '5.4rem', zIndex: 1, textShadow: '.5rem .5rem .5rem #ddd' }}>{title}</span>}
        <img src={title1Png} style={{ position: 'absolute', top: 0, left: 0, width: '75.0rem', height: '25.0rem' }} />
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
                         style={{ padding: '1.0rem', borderBottom: 'solid thin #ddd' }}>
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
                         style={{ width: '18.0rem', margin: '1.0rem' }}>{t}</Button>)}
                </Card>,
              }
            ]}
          >
          </Tabs>
        </Block>}

      <Block contentStyle={{ width: '45.0rem', margin: '5.0rem 15.0rem' }}>
        <Button onClick={async() => getUserInfoFunc()} loading={isLoading} block size="large" type="primary" style={{ fontSize:"2.0rem" }}>
          <TeamOutlined />
          在线咨询
        </Button>
        <span style={{ padding: '1.2rem', fontSize: '3.2rem', color: '#666' }}>
          {errorMessage}
        </span>
        <Button onClick={() => alert('敬请期待')} block size="large" type="default" style={{ fontSize:"2.0rem", marginTop: '3.0rem' }}>
          更多服务
        </Button>
      </Block>
    </Frame>
  );
};
