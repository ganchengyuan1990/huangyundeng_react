import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button, Card, Cell, Col, Form, Ling, Popup, Row, SearchBar, Skeleton, Space, Tabs, Tag } from 'annar';
import Frame from '../../utils/frame';
import Block from '../../utils/block';
import { usePageEvent } from 'remax/macro';
import { Text, View } from 'remax/one';
import { getHotQuestions, qa } from '../../apis/qa';
import { Image } from 'remax/wechat';
import accountManager from '../account/accountManager';

export default () => {
  const title = ''
  let account = accountManager.getAccount();
  const ling = useRef<any>();
  const [questionText, questionTextSetter] = useState('');

  const [guessTagShow, guessTagShowSetter] = React.useState(false);
  const [chooseTag, chooseTagSetter] = React.useState('');
  const [tagLoading, tagLoadingSetter] = useState(true);
  const [questions, setQuestions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const [qas, qasSetter] = React.useState<{ type: 'ai' | 'user', message: string }[]>([]);
  const [qaAnswerLoading, qaAnswerLoadingSetter] = React.useState(false);

  // 请求热门tags、及参数中tag或者问题的答案
  useEffect(() => {
    (async () => {
      const { questions, tags } = await getHotQuestions()
      setQuestions(questions)
      setTags(tags)
    })();
  }, []);
  usePageEvent('onLoad', options => {
    if (options.tag) {
      requestRelatedQuestion(options.tag)
    }
    if (options.question) {
      requestQA(options.question)
    }
  });


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
    qasSetter(qas => [...qas, { type: 'user', message: question }])

    guessTagShowSetter(false)
    qaAnswerLoadingSetter(true)
    try {
      const { answer } = await qa(question)
      qasSetter(qas => [...qas, { type: 'ai', message: answer }])
    } catch (e) {
      qasSetter(qas => [...qas, { type: 'ai', message: '服务器连接失败，请稍后再试' }])
    } finally {
      qaAnswerLoadingSetter(false)
    }
  }

  return (
    <Frame grayBg style={{ overflow: 'hidden', minHeight: '1800rpx', paddingBottom: '200rpx' }}>
      <Ling ref={ling} />

      <Block padding style={{ paddingTop: '20rpx', paddingBottom: 0 }}>
        <Row>
          <Col span={4}>
            <Image src="https://fangxt-object.oss-rg-china-mainland.aliyuncs.com/robot.jpeg" mode="widthFix" style={{ width: '80%', height: 'auto' }} />
          </Col>
          <Col span={17}>
            <Text style={{ lineHeight: '100rpx' }}>{title || '小Ai'}</Text>
          </Col>
          <Col span={3}>
            <Image src="https://fangxt-object.oss-rg-china-mainland.aliyuncs.com/question.png" mode="widthFix"
                   onTap={() => guessTagShowSetter(true)}
                   style={{ width: '80%', height: 'auto' }} />
          </Col>
        </Row>
      </Block>
      <Block padding style={{ paddingTop: '10rpx', paddingBottom: '10rpx' }}>
        <Card>
          <View>亲，我是您的在线助手，请问你想咨询什么问题?</View>
        </Card>
      </Block>

      {!guessTagShow && qas.map((qa) => <>
        {qa.type === 'user' && <>
          <Block padding style={{ paddingTop: '20rpx', paddingBottom: 0 }}>
            <Row>
              <Col span={17} offset={3} style={{ textAlign: 'right' }}>
                <Text style={{ lineHeight: '100rpx' }}>{account.nickname || '我'}</Text>
              </Col>
              <Col span={4}>
                <Image src={account.avatar_url} mode="widthFix" style={{ width: '80%', height: 'auto' }} />
              </Col>
            </Row>
          </Block>
          <Block padding style={{ paddingTop: '10rpx', paddingBottom: '10rpx' }}>
            <Card style={{ backgroundColor: '#5b83fd', color: 'white' }}>
              <View>{qa.message}</View>
            </Card>
          </Block>
        </>}
        {qa.type === 'ai' && <>
          <Block padding style={{ paddingTop: '20rpx', paddingBottom: 0 }}>
            <Row>
              <Col span={4}>
                <Image src="https://fangxt-object.oss-rg-china-mainland.aliyuncs.com/robot.jpeg" mode="widthFix" style={{ width: '80%', height: 'auto' }} />
              </Col>
              <Col span={20}>
                <Text style={{ lineHeight: '100rpx' }}>小Ai</Text>
              </Col>
            </Row>
          </Block>
          <Block padding style={{ paddingTop: '10rpx', paddingBottom: '10rpx' }}>
            <Card>
              {qa.message.split('\n').map((v, i) => <View key={i}>{v}</View>)}
            </Card>
          </Block>
        </>}
      </>)}

      {guessTagShow && <Block padding title="猜你想问">
        <Card>
          {tags.slice(0, 9).map((q, i) =>
            <Tag key={i} plain size="large" color={chooseTag === q ? 'blue' : ''}
                 onTap={async() => await requestRelatedQuestion(q)}
                 style={{ width: '195rpx', margin: '10rpx' }}>{q}</Tag>)}
        </Card>
      </Block>}
      {guessTagShow && chooseTag && (
        tagLoading
          ? <Block padding><Skeleton /></Block>
          : <Block padding>
            <Card>
              {questions.slice(0, 6).map((q, i) =>
                <View key={i} style={{ padding: '10rpx', borderBottom: 'solid thin #ddd' }}
                      onTap={async() => requestQA(q)}>
                  <Text style={{ color: i <= 2 ? 'red' : (i <= 3 ? 'orange' : 'gray') }}>{i+1}</Text>. {q}
                </View>)}
            </Card>
          </Block>)}

      <View style={{
        backgroundColor: '#fff', width: '750rpx', position: 'fixed', bottom: 0, left: 0, padding: '10rpx',
        borderTop: 'solid #eee thin' }}>
        <SearchBar shape="square" placeholder="请输入你想问的问题"
                   actionName="确认"
                   confirmType="send"
                   value={questionText}
                   onInput={v => questionTextSetter(v)}
                   style={{
                     margin: '0 30rpx 40rpx 30rpx'
                   }}
                   inputStyle={{ backgroundColor: '#fff' }}
                   onSubmit={async() => requestQA(questionText)}
                   onActionClick={async() => requestQA(questionText)}
        />
      </View>
    </Frame>
  );
};
