import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Button, Card, Cell, Col, Form, Ling, Popup, Row, SearchBar, Skeleton, Space, Tabs, Tag } from 'annar';
import Frame from '../../utils/frame';
import Block from '../../utils/block';
import { usePageEvent } from 'remax/macro';
import { Text, View } from 'remax/one';
import { getHotQuestions, qa } from '../../apis/qa';
import robot from '../../../public/robot.png';
import question from '../../../public/question.png';
import { Image } from 'remax/wechat';
import accountManager from '../account/accountManager';

export default () => {
  let account = accountManager.getAccount();
  const ling = useRef<any>();
  const [questionText, questionTextSetter] = useState('');

  const [guessTagShow, guessTagShowSetter] = React.useState(false);
  const [chooseTag, chooseTagSetter] = React.useState('');
  const [tagLoading, tagLoadingSetter] = useState(true);
  const [questions, setQuestions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);

  const [qaQuestion, qaQuestionSetter] = React.useState('');
  const [qaAnswer, qaAnswerSetter] = React.useState('');
  const [qaAnswerLoading, qaAnswerLoadingSetter] = React.useState(false);


  // const [purposeShow, purposeShowSetter] = React.useState(false);

  // 请求可选的时间、我的预约信息、所有预约
  useEffect(() => {
    (async () => {
      // let [{ all_available_datetimes }, { book: myBook }, { books: bookTimes }] = await Promise.all([
      //   getAllAvailableDatetimes(), getMyBookTime(), listBookTime(),
      // ]);
      // allAvailableDatetimeListSetter(all_available_datetimes);
      // myBookTimeSetter(myBook);
      // bookTimesSetter(bookTimes);
      // isLoadingSetter(false);

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
    <Frame grayBg style={{ overflow: 'hidden', minHeight: '1500rpx' }}>
      <Ling ref={ling} />
      {/*<Popup*/}
      {/*  position="bottom"*/}
      {/*  title="请输入需要帮助的学习困惑"*/}
      {/*  open={purposeShow}*/}
      {/*  onClose={() => purposeShowSetter(false)}*/}
      {/*>*/}
      {/*  <Card contentStyle={{ padding: '20px 0 20px' }}>*/}
      {/*    <Form form={form}>*/}
      {/*      <Form.Item noStyle name="date">*/}
      {/*        <Cell.Input label="预约日期" border={false} disabled />*/}
      {/*      </Form.Item>*/}
      {/*      <Form.Item noStyle name="time">*/}
      {/*        <Cell.Input label="预约时间" border={false} disabled />*/}
      {/*      </Form.Item>*/}
      {/*      <Form.Item noStyle name="purpose" rules={[{ required: true }]}>*/}
      {/*        <Cell.Input label="学习困惑" placeholder="Please enter" border={false} />*/}
      {/*      </Form.Item>*/}
      {/*      <Form.Item noStyle style={{ marginTop: 10, padding: '0 20px' }}>*/}
      {/*        <Button type="primary" size="large" shape="square" block nativeType="submit">确认</Button>*/}
      {/*      </Form.Item>*/}
      {/*    </Form>*/}
      {/*  </Card>*/}
      {/*</Popup>*/}

      <Block padding style={{ paddingTop: '20rpx', paddingBottom: 0 }}>
        <Row>
          <Col span={3}>
            <Image src={robot} mode="widthFix" style={{ width: '80%', height: 'auto' }} />
          </Col>
          <Col span={18}>
            <Text style={{ lineHeight: '100rpx' }}>小Ai</Text>
          </Col>
          <Col span={3}>
            <Image src={question} mode="widthFix"
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

      {!guessTagShow && qaQuestion && <>
        <Block padding style={{ paddingTop: '20rpx', paddingBottom: 0 }}>
          <Row>
            <Col span={18} offset={3} style={{ textAlign: 'right' }}>
              <Text style={{ lineHeight: '100rpx' }}>{account.nickname || '我'}</Text>
            </Col>
            <Col span={3}>
              <Image src={account.avatar_url} mode="widthFix" style={{ width: '80%', height: 'auto' }} />
            </Col>
          </Row>
        </Block>
        <Block padding style={{ paddingTop: '10rpx', paddingBottom: '10rpx' }}>
          <Card style={{ backgroundColor: '#5b83fd', color: 'white' }}>
            <View>{qaQuestion}</View>
          </Card>
        </Block>
      </>}

      {!guessTagShow && qaQuestion && (qaAnswerLoading
        ? <Block padding><Skeleton /></Block>
        : <>
          <Block padding style={{ paddingTop: '20rpx', paddingBottom: 0 }}>
            <Row>
              <Col span={3}>
                <Image src={robot} mode="widthFix" style={{ width: '80%', height: 'auto' }} />
              </Col>
              <Col span={21}>
                <Text style={{ lineHeight: '100rpx' }}>小Ai</Text>
              </Col>
            </Row>
          </Block>
          <Block padding style={{ paddingTop: '10rpx', paddingBottom: '10rpx' }}>
            <Card>
              {qaAnswer.split('\n').map((v, i) => <View key={i}>{v}</View>)}
            </Card>
          </Block>
        </>)}

      {guessTagShow && <Block padding title="猜你想问">
        <Card>
          {tags.slice(0, 9).map((q, i) =>
            <Tag key={i} plain size="large" color={chooseTag === q ? 'blue' : ''}
                 onTap={async() => await requestRelatedQuestion(q)}
                 style={{ width: '200rpx', margin: '10rpx' }}>{q}</Tag>)}
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
                     margin: '0 30rpx'
                   }}
                   inputStyle={{ backgroundColor: '#fff' }}
                   onSubmit={async() => requestQA(questionText)}
                   onActionClick={async() => requestQA(questionText)}
        />
      </View>
    </Frame>
  );
};
