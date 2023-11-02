import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Card, Col, Row, Input, Skeleton, Tag, Button, Affix } from 'antd';
import Frame from '../../utils/frame';
import Block from '../../utils/block';
import { getHotQuestions, qa } from '../../apis/qa';
import robotPng from '../../assets/robot.png';
import questionPng from '../../assets/question.png';
import accountManager from '../account/accountManager';
import useQuery from '../../utils/query';

export const QaPage = () => {

  let account = accountManager.getAccount();
  const [questionText, questionTextSetter] = useState('');

  const [guessTagShow, guessTagShowSetter] = React.useState(false);
  const [chooseTag, chooseTagSetter] = React.useState('');
  const [tagLoading, tagLoadingSetter] = useState(true);
  const [questions, setQuestions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const [qaQuestion, qaQuestionSetter] = React.useState('');
  const [qaAnswer, qaAnswerSetter] = React.useState('');
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
  }, []);

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
    qaQuestionSetter(question)

    guessTagShowSetter(false)
    qaAnswerLoadingSetter(true)
    try {
      const { answer } = await qa(question)
      qaAnswerSetter(answer)
    } catch (e) {
      qaAnswerSetter('服务器连接失败，请稍后再试')
    } finally {
      qaAnswerLoadingSetter(false)
    }
  }

  return (
    <Frame grayBg style={{ overflow: 'hidden', minHeight: '1000px' }}>
      <Block padding style={{ paddingTop: '20px', paddingBottom: 0 }}>
        <Row>
          <Col span={3}>
            <img src={robotPng} style={{ width: '80%', height: 'auto' }} />
          </Col>
          <Col span={18} style={{ lineHeight: '100px', fontSize: '40px', textAlign: 'left', }}>
            <span>小Ai</span>
          </Col>
          <Col span={3}>
            <img src={questionPng}
                   onClick={() => guessTagShowSetter(true)}
                   style={{ width: '80%', height: 'auto' }} />
          </Col>
        </Row>
      </Block>
      <Block padding style={{ padding: '10px', paddingBottom: '10px', textAlign: 'left' }}>
        <Card>
          <span>亲，我是您的在线助手，请问你想咨询什么问题?</span>
        </Card>
      </Block>

      {!guessTagShow && qaQuestion && <>
        <Block padding style={{ paddingTop: '20px', paddingBottom: 0 }}>
          <Row>
            <Col span={18} offset={3} style={{ lineHeight: '100px', fontSize: '40px', textAlign: 'right' }}>
              <span style={{ lineHeight: '100px' }}>{account.nickname || '我'}</span>
            </Col>
            <Col span={3}>
              <img src={account.avatar_url} style={{ width: '80%', height: 'auto' }} />
            </Col>
          </Row>
        </Block>
        <Block padding style={{ padding: '10px', paddingBottom: '10px' }}>
          <Card style={{ backgroundColor: '#5b83fd', color: 'white' }}>
            <div>{qaQuestion}</div>
          </Card>
        </Block>
      </>}

      {!guessTagShow && qaQuestion && (qaAnswerLoading
        ? <Block padding><Skeleton /></Block>
        : <>
          <Block padding style={{ padding: '20px 10px 0 10px' }}>
            <Row>
              <Col span={3}>
                <img src={robotPng} style={{ width: '80%', height: 'auto' }} />
              </Col>
              <Col span={21} style={{ lineHeight: '100px', fontSize: '40px', textAlign: 'left', }}>
                <span>小Ai</span>
              </Col>
            </Row>
          </Block>
          <Block padding style={{ padding: '10px', paddingBottom: '10px', textAlign: 'left' }}>
            <Card>
              {qaAnswer.split('\n').map((v, i) => <div key={i}>{v}</div>)}
            </Card>
          </Block>
        </>)}

      {guessTagShow && <Block padding contentStyle={{ padding: '0 10px', textAlign: 'left' }}>
        <Card title="猜你想问">
          {tags.slice(0, 9).map((q, i) =>
            <Button key={i} type={chooseTag === q ? 'primary' : 'default'}
                 onClick={async() => await requestRelatedQuestion(q)}
                 style={{ width: '200px', margin: '10px' }}>{q}</Button>)}
        </Card>
      </Block>}
      {guessTagShow && chooseTag && (
        tagLoading
          ? <Block padding><Skeleton /></Block>
          : <Block padding contentStyle={{ padding: '0 10px', marginTop: '10px' }}>
            <Card bodyStyle={{ paddingTop: 10, paddingBottom: 0 }}>
              {questions.slice(0, 6).map((q, i) =>
                <div key={i} style={{ padding: '10px', borderBottom: 'solid thin #ddd' }}
                      onClick={async() => requestQA(q)}>
                  <span style={{ color: i <= 2 ? 'red' : (i <= 3 ? 'orange' : 'gray') }}>{i+1}</span>. {q}
                </div>)}
            </Card>
          </Block>)}

      <Block padding contentStyle={{ padding: '0 10px', marginTop: '10px' }}>
      <Card>
        <Input.Search
          placeholder="请输入你想问的问题"
          enterButton="确认"
          value={questionText}
          onChange={e => questionTextSetter(e.target.value)}
          size="large"
          style={{
            width: '650px', backgroundColor: '#fff'
          }}
          onSearch={async () => requestQA(questionText)}
        />
      </Card>
      </Block>
    </Frame>
  );
};
