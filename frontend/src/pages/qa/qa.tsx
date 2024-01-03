import * as React from 'react';
import { useEffect, useRef, useState } from 'react';
import { Card, Col, Icon, Ling, Row, SearchBar, Skeleton, Tag, Popup } from 'annar';
import Frame from '../../utils/frame';
import Block from '../../utils/block';
import { usePageEvent } from 'remax/macro';
import { Text, View } from 'remax/one';
import { feedback, getHotQuestions, qa } from '../../apis/qa';
import { Image } from 'remax/wechat';
import accountManager from '../account/accountManager';
import { getAccountInfoSync, setNavigationBarTitle } from '@remax/wechat/esm/api';
import { getBase } from '../../apis/account';
import SpeechRecognizer from '../index/components/speechRecognizer';

export default () => {
  let account = accountManager.getAccount();
  const ling = useRef<any>();
  const [questionText, questionTextSetter] = useState('');
  const [keyboradHeight, setKeyboradHeight] = useState(0);
  const [showTextArea, setShowTextArea] = useState(false);


  const [title, titleSetter] = useState('');

  const [guessTagShow, guessTagShowSetter] = React.useState(false);
  const [chooseTag, chooseTagSetter] = React.useState('');
  const [tagLoading, tagLoadingSetter] = useState(true);
  const [questions, setQuestions] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [collapse, setCollapse] = useState(true);

  const [qas, qasSetter] = React.useState<{ type: 'ai' | 'user', recordId: string, message: string, collapse?: boolean }[]>([]);
  const [qaAnswerLoading, qaAnswerLoadingSetter] = React.useState(false);

  // 请求热门tags、及参数中tag或者问题的答案
  useEffect(() => {
    // wx?.onKeyboardHeightChange(res => {
    //   console.log(res.height)
    //   setKeyboradHeight(res.height)
    // })
    (async () => {
      const res2 = getAccountInfoSync()
      const appid = res2.miniProgram.appId;
      const { title } = await getBase(appid)
      titleSetter(title)
      await setNavigationBarTitle({ title })

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


  const requestRelatedQuestion = async (tag: string) => {
    questionTextSetter('')
    tagLoadingSetter(true)
    guessTagShowSetter(true)
    chooseTagSetter(tag)
    const { questions, tags } = await getHotQuestions(tag)
    setQuestions(questions)
    setTags(tags)
    tagLoadingSetter(false)
  }
  const requestQA = async (question: string) => {
    questionTextSetter('')
    qasSetter(qas => [...qas, { type: 'user', recordId: '', message: question, collapse: question?.length < 80, initCollapse: question?.length > 80 }])

    guessTagShowSetter(false)
    qaAnswerLoadingSetter(true)
    try {
      const { answer, record_id } = await qa(question)
      qasSetter(qas => [...qas, { type: 'ai', recordId: record_id, message: answer, collapse: answer?.length < 80, initCollapse: question?.length > 80 }])
    } catch (e) {
      qasSetter(qas => [...qas, { type: 'ai', recordId: '', message: '服务器连接失败，请稍后再试' }])
    } finally {
      qaAnswerLoadingSetter(false)
    }
  }
  const requestFeedback = async (qa: { type: 'ai' | 'user', recordId: string }, attitude: string, message: string) => {
    await feedback(qa.recordId, attitude, message)
    qasSetter(oldV => {
      const newV = [...oldV]
      const item = newV.filter(v => v.recordId === qa.recordId)
      if (item.length > 0) {
        item[0].recordId = ''
      }
      return newV
    })
    ling.current.info('感谢您的反馈')
  }


  return (
    <Frame grayBg style={{ overflow: 'hidden', minHeight: '100vh', paddingBottom: '200rpx' }}>
      <View style={{ height: '100vh', background: 'url(https://cdn.coffeebeats.cn/beijing.png)', backgroundSize: '100% 100%', position: 'fixed', left: 0, right: 0 }}></View>
      <Ling ref={ling} />

      <Block padding style={{ paddingTop: '20rpx', paddingBottom: 0 }}>
        <Row>
          <Col span={4}>
            <Image src="https://fangxt-object.oss-rg-china-mainland.aliyuncs.com/robot.png" mode="widthFix" style={{ width: '80%', height: 'auto' }} />
          </Col>
          <Col span={17}>
            <Text style={{ lineHeight: '100rpx' }}>{title || '房小通'}</Text>
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

      {!guessTagShow && qas.map((qa, idx) => <>
        {qa.type === 'user' && <>
          <Block padding style={{ paddingTop: '20rpx', paddingBottom: 0 }}>
            <Row>
              <Col span={17} offset={3} style={{ textAlign: 'right' }}>
                <Text style={{ lineHeight: '100rpx' }}>{account.nickname || '我'}</Text>
              </Col>
              <Col span={4}>
                <Image src={account.avatar_url || "https://cdn.coffeebeats.cn/user_default.png"} mode="widthFix" style={{ width: '80%', height: 'auto', marginLeft: 12 }} />
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
                <Image src="https://fangxt-object.oss-rg-china-mainland.aliyuncs.com/robot.png" mode="widthFix" style={{ width: '80%', height: 'auto' }} />
              </Col>
              <Col span={20}>
                <Text style={{ lineHeight: '100rpx' }}>{title || '房小通'}</Text>
              </Col>
            </Row>
          </Block>
          {/* <Block className="answerWrapper" padding style={{ paddingTop: '10rpx', paddingBottom: '10rpx' }}>
            <Card>
              <View className={!qa?.collapse ? "contentWrapper" : "contentWrapperNo"}> */}
          <Block padding style={{ paddingTop: '10rpx', paddingBottom: '10rpx' }}>
            <Card
              foot={qa.recordId ? <Row>
                <Col span={8} key="good" style={{ lineHeight: '50rpx', padding: '10rpx', textAlign: 'center' }}>
                  <View style={{ width: '100%', fontSize: 24 }}
                    onTap={() => requestFeedback(qa, 'good', '')}>
                    <Icon type="appreciate" size="50px" /> 有用
                  </View>
                </Col>
                <Col span={8} key="bad" style={{ lineHeight: '50rpx', padding: '10rpx', textAlign: 'center' }}>
                  <View style={{ width: '100%', fontSize: 24 }}
                    onTap={() => requestFeedback(qa, 'bad', '')}>
                    <Icon type="oppose_light" size="50px" /> 无效
                  </View>
                </Col>
                <Col span={8} key="fix" style={{ lineHeight: '50rpx', padding: '10rpx', textAlign: 'center' }}>
                  <View style={{ width: '100%', fontSize: 24 }}
                    onTap={() => setShowTextArea(!showTextArea)}>
                    <Icon type="repair" size="50px" /> 纠错
                  </View>
                </Col>
              </Row> : ''}
            >
              <View className={!qa?.collapse ? "contentWrapper" : "contentWrapperNo"}>
                {qa.message.split('\n').map((v, i) => <View key={i}>{v}</View>)}
              </View>
              {!qa?.collapse ? <View className="collIcon" onTap={() => {
                setCollapse(!collapse)
                const newQas = JSON.parse(JSON.stringify(qas));
                newQas[idx].collapse = !newQas[idx].collapse;
                newQas[idx].initCollapse = newQas[idx].message?.length > 80;
                console.log(newQas[idx], '==newQas==')
                qasSetter(newQas)
              }}>展开<Text className="collIconRight">▽</Text></View> : qa?.collapse && qa?.initCollapse ? <View className="collIcon" onTap={() => {
                setCollapse(!collapse)
                const newQas = JSON.parse(JSON.stringify(qas));
                newQas[idx].collapse = !newQas[idx].collapse
                qasSetter(newQas)
              }}>收起<Text className="collIconRight upsideDown">Δ</Text></View> : null}

              <Popup open={showTextArea} closeable={true} onClose={() => {
                setShowTextArea(false)
              }}>
                {showTextArea ? <form bindsubmit={async (e) => {
                  const res = await requestFeedback(qa, 'fix', e.detail.value.textarea)
                  setShowTextArea(false);
                }}>
                  <textarea style="margin: 10px 0; padding: 12px; background: #eee; border-radius: 8px; width: calc(100% - 24px);" placeholder="请输入" name="textarea" />
                  <button style="height: 38px; line-height: 38px; border: 1px solid rgb(9, 191, 255); background: rgba(0, 191, 255, 0.5); color: #fff" form-type="submit"> 提交 </button>
                </form> : null}
              </Popup>

              {/* {showTextArea ? <form bindsubmit={async (e) => {
                const res = await requestFeedback(qa, 'fix', e.detail.value.textarea)
                setShowTextArea(false);
                console.log(res, 123)
              }}>

                <textarea style="margin: 10px 0; padding: 12px; background: #eee; border-radius: 8px; width: calc(100% - 24px);" placeholder="请输入" name="textarea"/>
                <button style="height: 38px; line-height: 38px; border: 1px solid blue" form-type="submit"> 提交 </button>
              </form> : null} */}

            </Card>
          </Block>
        </>}
      </>)}

      {guessTagShow && <Block padding title="猜你想问">
        <Card>
          {tags.slice(0, 9).map((q, i) =>
            <Tag key={i} plain size="large" color={chooseTag === q ? 'blue' : ''}
              onTap={async () => await requestRelatedQuestion(q)}
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
                  onTap={async () => requestQA(q)}>
                  <Text style={{ color: i <= 2 ? 'red' : (i <= 3 ? 'orange' : 'gray') }}>{i + 1}</Text>. {q}
                </View>)}
            </Card>
          </Block>)}

      <View style={{
        backgroundColor: '#fff', width: '750rpx', position: 'fixed', bottom: 0, left: 0, padding: '10rpx',
        borderTop: 'solid #eee thin'
      }}>
        {/* <input
          bindfocus={(e) => {
            // ling.current.info(e?.detail.height)
            setKeyboradHeight(550)
          }}
          bindblur={() => {setKeyboradHeight(0)}}
          style={{backgroundColor: '#fff', height: '84px', textAlign: 'center', marginBottom: 30, position: 'relative', bottom: keyboradHeight }}
          maxlength="100"
          adjust-position={false}
          value={questionText}
          placeholder="请输入你想问的问题"
          bindinput={(e) => {
              questionTextSetter(e.detail.value)
            }
          }
          bindconfirm={async (e) => {
            requestQA(e.detail.value)
          }}
        /> */}
        <SearchBar shape="square" placeholder="请输入你想问的问题"
          actionName="确认"
          confirmType="send"
          value={questionText}
          onInput={v => questionTextSetter(v)}
          style={{
            margin: '0 30rpx 40rpx 30rpx'
          }}
          inputStyle={{ backgroundColor: '#fff', height: '84px' }}
          onSubmit={async () => requestQA(questionText)}
          onActionClick={async () => requestQA(questionText)}
        />
        <SpeechRecognizer onFinish={v => questionTextSetter(v)} />
      </View>
    </Frame>
  );
};
