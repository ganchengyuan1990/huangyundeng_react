import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import Frame from '../../../../utils/frame';
import { authorize, getSetting, showToast, vibrateShort } from 'remax/wechat';
import { View } from 'remax/one';
import { getRecorderSpeechRecognizer } from '../../../../apis/asr.min';
import { Button } from 'annar';
import { getTencentInfo } from '../../../../apis/account';
import { getAccountInfoSync } from '@remax/wechat/esm/api';

export default ({ onFinish }: {
  onFinish: (text: string) => void
}) => {
  const [recording, setRecording] = useState(false);
  const [tencentInfo, setTencentInfo] = useState<{ appid: string, secretid: string, secretkey: string } | null>(null);
  const [result, setResult] = useState('');
  const [speechRecognizerManager, setSpeechRecognizerManager] = useState(() => getRecorderSpeechRecognizer());

  useEffect(() => {
    (async () => {
      const res2 = getAccountInfoSync()
      const appid = res2.miniProgram.appId;
      const tencentInfo = await getTencentInfo(appid)
      setTencentInfo(tencentInfo)
    })()
  }, [])
  useEffect(() => {
    // 开始识别
    speechRecognizerManager.OnRecognitionStart = (res) => {
      // console.log('开始识别', res);
      setRecording(true)
      setResult('')
    }
    // 一句话开始
    speechRecognizerManager.OnSentenceBegin = (res) => {
      // console.log('一句话开始', res);
    }
    // 识别变化时
    speechRecognizerManager.OnRecognitionResultChange = (res) => {
      console.log('识别变化时', res);
      setResult(res.result.voice_text_str)
    }
    // 一句话结束
    speechRecognizerManager.OnSentenceEnd = (res) => {
      console.log('一句话结束', res);
      setResult(res.result.voice_text_str)
    }
    // 识别错误
    speechRecognizerManager.OnError = (res) => {
      console.log(res);
      setRecording(false)
    }
    speechRecognizerManager.OnRecorderStop = () => {
      console.log('录音结束或超过录音时长');
    }
  }, [])
  useEffect(() => {
    // 识别结束
    speechRecognizerManager.OnRecognitionComplete = (res) => {
      console.log('识别结束', res, result);
      onFinish(result)
      setRecording(false)
    }
  }, [result])

  const startLy = async function(e){
    await getSetting({
      success(res) {
        if (!res.authSetting['scope.record']) {
          authorize({
            scope: 'scope.record',
            success() {
              // 用户已经同意小程序使用录音功能，后续调用 record 接口不会弹窗询问
              startAsr();
            }, fail() {
              showToast({ title: '未获取录音权限', icon: 'none' });
              // console.log("fail auth")
            }
          });
        } else {
          startAsr();
          console.log("record has been authed")
        }
      }, fail(res) {
        console.log("fail",res)
      }
    });
  }
  const startAsr = async function() {
    await showToast({
      title: '建立连接中',
      icon: 'none'
    });
    setResult('')
    const params = {
      // 用户参数
      appid: tencentInfo.appid,
      secretid:  tencentInfo.secretid,
      secretkey: tencentInfo.secretkey,
      // 录音参数
      // duration: 100000,
      // frameSize: 1.28,  //单位:k

      // 实时识别接口参数
      engine_model_type : '16k_zh',
      // 以下为非必填参数，可跟据业务自行修改
      // hotword_id : '08003a00000000000000000000000000',
      needvad: 0,
      filter_dirty: 1,
      filter_modal: 1,
      filter_punc: 0,
      // convert_num_mode : 1,
      word_info: 2,
      vad_silence_time: 200
    };
    speechRecognizerManager.start(params);

    await vibrateShort();
  }
  const endLy = function(e){
    setRecording(false)
    speechRecognizerManager.stop();
  }
  return (
    <View>
      <Button onTap={!recording ? startLy : endLy} className="btn btn-start">
        {!recording ? '开始识别' : '停止识别'}
      </Button>
    </View>
  );
};
