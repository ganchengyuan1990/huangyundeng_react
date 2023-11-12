import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import { Button, Card, Col, Input, Row, Skeleton } from 'antd';
import Frame from '../../utils/frame';
import Block from '../../utils/block';
import { getHotQuestions, qa } from '../../apis/qa';
import robotPng from '../../assets/robot.png';
import userDefault from '../../assets/user_default.png';
import questionPng from '../../assets/question.png';
import accountManager from '../account/accountManager';
import useQuery from '../../utils/query';
import { AppContext } from '../../App';


export const QaPage = () => {
  const { title } = useContext(AppContext)
  let account = accountManager.getAccount();
  const [questionText, questionTextSetter] = useState('');

  const [guessTagShow, guessTagShowSetter] = React.useState(false);
  const [chooseTag, chooseTagSetter] = React.useState('');
  const [tagLoading, tagLoadingSetter] = useState(true);
  const [questions, setQuestions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [startDate, setStartDate] = useState<Date>(new Date());

  const [qas, qasSetter] = React.useState<{ type: 'ai' | 'user', message: string, time: Date }[]>([]);
  const [qaAnswerLoading, qaAnswerLoadingSetter] = React.useState(false);

  // 请求热门tags、及参数中tag或者问题的答案
  const { question, tag } = useQuery<{ question: string, tag: string, }>()
  useEffect(() => {
    (async () => {
      const { questions, tags } = await getHotQuestions()
      setQuestions(questions)
      setTags(tags)
      if (tag) {
        requestRelatedQuestion(tag)
      }
      if (question) {
        requestQA(question)
      }
    })();
  }, [question, tag]);

  const requestRelatedQuestion = async(tag: string) => {
    questionTextSetter('')
    tagLoadingSetter(true)
    guessTagShowSetter(true)
    chooseTagSetter(tag)
    const { questions, tags } = await getHotQuestions(tag)
    setQuestions(questions)
    setTags(tags)
    tagLoadingSetter(false)
  }
  const requestQA = async(question: string) => {
    questionTextSetter('')
    qasSetter(qas => [...qas, { type: 'user', message: question, time: new Date() }])

    guessTagShowSetter(false)
    qaAnswerLoadingSetter(true)
    try {
      const { answer } = await qa(question)
      qasSetter(qas => [...qas, { type: 'ai', message: answer, time: new Date() }])
    } catch (e) {
      qasSetter(qas => [...qas, { type: 'ai', message: '服务器连接失败，请稍后再试', time: new Date() }])
    } finally {
      qaAnswerLoadingSetter(false)
    }
  }

  return (
    <Frame grayBg style={{ overflow: 'hidden', minHeight: '100.0rem' }}>
      <Block padding style={{ paddingTop: '2.0rem', paddingBottom: 0 }}>
        <Row>
          <Col span={4}>
            <img src={robotPng} style={{ width: '80%', height: 'auto' }} alt="robot" />
          </Col>
          <Col span={17}>
            <div style={{ padding: '2.0rem', lineHeight: '3.0rem', fontSize: '2.5rem', textAlign: 'left', color: '#666', }}>
              <div>{title || '小Ai'}</div>
              <div>{startDate.toLocaleString()}</div>
            </div>
          </Col>
          <Col span={3}>
            <img src={questionPng} onClick={() => guessTagShowSetter(true)}
                 style={{ width: '80%', height: 'auto' }} alt="guess tag" />
          </Col>
        </Row>
      </Block>
      <Block padding style={{ padding: '1.0rem', paddingBottom: '1.0rem', textAlign: 'left' }}>
        <Card>
          <span>亲，我是您的在线助手，请问你想咨询什么问题?</span>
        </Card>
      </Block>

      {!guessTagShow && qas.map((qa, index) => <>
        {qa.type === 'user' && <>
          <Block padding style={{ paddingTop: '2.0rem', paddingBottom: 0 }} key={index}>
            <Row>
              <Col span={17} offset={3}>
                <div style={{ padding: '2.0rem', lineHeight: '3.0rem', fontSize: '2.5rem', textAlign: 'right', color: '#666', }}>
                  <div>{account.nickname || '我'}</div>
                  <div>{new Date().toLocaleString()}</div>
                </div>
              </Col>
              <Col span={4}>
                <img src={account.avatar_url || userDefault} style={{ width: '80%', height: 'auto' }} alt="my avatar" />
              </Col>
            </Row>
          </Block>
          <Block padding style={{ padding: '1.0rem', paddingBottom: '1.0rem' }}>
            <Card style={{ backgroundColor: '#5b83fd', color: 'white' }}>
              <div>{qa.message}</div>
            </Card>
          </Block>
        </>}
        {qa.type === 'ai' && <>
          <Block padding style={{ padding: '2.0rem 1.0rem 0 1.0rem' }} key={index}>
            <Row>
              <Col span={4}>
                <img src={robotPng} style={{ width: '80%', height: 'auto' }} alt="robot avatar" />
              </Col>
              <Col span={20}>
                <div style={{ padding: '2.0rem', lineHeight: '3.0rem', fontSize: '2.5rem', textAlign: 'left', color: '#666', }}>
                  <div>{title || '小Ai'}</div>
                  <div>{new Date().toLocaleString()}</div>
                </div>
              </Col>
            </Row>
          </Block>
          <Block padding style={{ padding: '1.0rem', paddingBottom: '1.0rem', textAlign: 'left' }}>
            <Card>
              {qa.message.split('\n').map((v, i) => <div key={i}>{v}</div>)}
            </Card>
          </Block>
        </>}
      </>)}

      {!guessTagShow && qaAnswerLoading && <Block padding><Skeleton /></Block>}

      {guessTagShow && <Block padding contentStyle={{ padding: '0 1.0rem', textAlign: 'left' }}>
        <Card title="猜你想问" bodyStyle={{ padding: '2%'}}>
          {tags.slice(0, 9).map((q, i) =>
            <Button key={i} type={chooseTag === q ? 'primary' : 'default'}
                 onClick={async() => await requestRelatedQuestion(q)}
                 style={{ width: '29.5%', margin: '1.5%' }}>{q}</Button>)}
        </Card>
      </Block>}
      {guessTagShow && chooseTag && (
        tagLoading
          ? <Block padding><Skeleton /></Block>
          : <Block padding contentStyle={{ padding: '0 1.0rem', marginTop: '1.0rem' }}>
            <Card bodyStyle={{ paddingTop: 10, paddingBottom: 0 }}>
              {questions.slice(0, 6).map((q, i) =>
                <div key={i} style={{ padding: '1.0rem', borderBottom: 'solid thin #ddd' }}
                      onClick={async() => requestQA(q)}>
                  <span style={{ color: i <= 2 ? 'red' : (i <= 3 ? 'orange' : 'gray') }}>{i+1}</span>. {q}
                </div>)}
            </Card>
          </Block>)}

      <Block padding contentStyle={{ padding: '0 1.0rem', marginTop: '1.0rem' }}>
      <Card>
        <Input.Search
          placeholder="请输入你想问的问题"
          enterButton="确认"
          value={questionText}
          onChange={e => questionTextSetter(e.target.value)}
          size="large"
          style={{
            width: '65.0rem', backgroundColor: '#fff'
          }}
          onSearch={async () => requestQA(questionText)}
        />
      </Card>
      </Block>
    </Frame>
  );
};
