import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import accountManager from '../account/accountManager';
import { useNavigate } from 'react-router-dom';
import { AccountModel } from '../../types/account';
import {
  Button,
  Checkbox,
  Form,
  Input,
  message,
  Radio,
  Steps,
  Tabs,
  TabsProps,
  Typography,
  Upload,
  UploadProps,
  Image,
} from 'antd';
import {
  apiFformCreateForm,
  apiFformSubmitAudit,
  apiFformUploadToken,
  apiFformUpsertForm
} from '../../apis/fform';
import { Header } from '../../components/header';
import { UploadChangeParam } from 'antd/es/upload/interface';
import "./index.css"
import { FormFileOut, FormValueIn, FormValueOut } from '../../types/fform';


export const FormPage = () => {
  const [form] = Form.useForm()
  const [isSubmit, setIsSubmit] = React.useState(false)
  const [formValues, setFormValues] = React.useState<Record<string, FormValueIn>>({})
  const [fileUrls, setFileUrls] = React.useState<Record<string, string>>({})
  const [files, setFiles] = React.useState<Record<string, FormFileOut>>({})
  const [fformId, setFformId] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const navigate = useNavigate()

  useEffect(() => {
    let account: AccountModel | null = accountManager.getAccount();
    accountManager.listenAccountChange(v => account = v);
    (async function () {
    })()
  }, [])
  const getUserInfoFunc = async (question: string = '', tag: string = '') => {
    await navigate(`/qa/qa?question=${question}&tag=${tag}`)
  }

  const [current, setCurrent] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const onNext = async () => {
    let validateResult = true
    if (current >= maxStep) {
      try {
        validateResult = await form.validateFields();
      } catch (e) {
        console.error(e)
        validateResult = false
      }
    }
    // 确保表单数据都填写了，才能切到写一步
    // Object.keys(values).map(item => {
    //   if (!values[item]) {
    //     validateResult = false
    //   }
    // });
    if (validateResult) {
      setCurrent(current + 1);
      setMaxStep(Math.max(maxStep, current + 1))
    } else {
      message.error(`请填写内容以后再点击`)
    }
    await onSyncForm()
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const onUpsertForm = async (needCreate: boolean) => {
    let formId = fformId, values: Record<string, FormValueOut>
    if (needCreate) {
      // 姓名填完后，请求并创建fform
      ({ formId, values } = await apiFformCreateForm('1', 'seller_id_card_number', form.getFieldValue('seller_id_card_number')))
      const newValues: Record<string, FormValueIn> = {}
      const newFiles: Record<string, FormFileOut> = {}
      for (let key in values) {
        if (typeof values[key] === 'object' && values[key] != null) {
          // @ts-ignore
          newValues[key] =  values[key].id
          // @ts-ignore
          newFiles[key] = values[key]
        } else {
          // @ts-ignore
          newValues[key] =  values[key]
        }
      }
      setFormValues(newValues)
      setFiles(newFiles)
      form.setFieldsValue(newValues)
      setFformId(formId)
    }
    // 后面的步骤，更新fform
    await apiFformUpsertForm(formId, form.getFieldsValue())
  }

  const onSyncForm = async () => {
    setFormValues(v => ({ ...v, ...form.getFieldsValue() }))
    await onUpsertForm(!fformId)
  }

  const onFinish = async (values: Record<string, FormValueIn>) => {
    for (let fileInfo of fileInfos) {
      if (!formValues[fileInfo.name]) {
        message.error(`${fileInfo.title} 文件尚未上传！`)
        return
      }
    }
    setIsSubmit(true)
    await onUpsertForm(!fformId)
    form.resetFields()
    setIsSubmit(false)
    navigate(`/complete?fformId=${fformId}`)
  }

  useEffect(() => {
    (async () => {
      if (fformId) {
        // const response = await apiFformUploadToken(fformId)
        // setToken(response.token)
      }
    })()
  }, [fformId])

  const props: UploadProps = {
    name: 'file',
    // action: 'https://upload.qiniup.com/',
    action: `/api/fform/upload-direct?form_id=${fformId}`,
    data: { token, },
    headers: {
      authorization: 'authorization-text',
    },
    showUploadList: false,
    accept: ".jpg, .jpeg, .png"
  };
  const onChangeHoc = (formName: string) => {
    return (info: UploadChangeParam) => {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`)
        form.setFieldValue(formName, info.file.response.form_file_id)
        fileUrls[formName] = info.file.response.private_url;
        setFileUrls(fileUrls);
        onSyncForm()
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`)
      }
    }
  };

  const steps = ['卖方登录', '卖方信息补充', '买方信息补充', '材料清单上传',];
  const stepItems = steps.map((v) => ({ key: v, title: v }));

  const fileInfos = useMemo(() => {
    const files = [
      { name: 'file1', title: '广州市不动产登记申请表', },
      { name: 'file2', title: '广州市不动不动产权属证明:《不动产权证书》，或《房地产权证》，或《共有权证》,或《房地产权属证明书》产登记申请表', },
      { name: 'file3', title: '身份证明（卖方）', },
      { name: 'file4', title: '身份证明（买方）', },
      { name: 'file5', title: '买卖合同', },
      { name: 'file6', title: '《家庭成员情况申报表》', },
      { name: 'file7', title: '家庭成员户口簿（原件）', },
      { name: 'file8', title: '婚姻情况证明（结婚证、离婚证等）', },
    ]
    if (formValues['bq1'] === false) {
      files.push(...[
        { name: 'file9', title: '在本市缴交个人所得税或社会保险的缴纳证明', },
      ])
    }
    if (formValues['sq6'] === true) {
      files.push(...[
        { name: 'file10', title: '卖方个人名下查询', },
        { name: 'file11', title: '家庭成员（卖方夫妻双方）户口簿、身份证明、婚姻证明(结婚证、离婚证)', },
      ])
    }
    if (formValues['sq2'] === false) {
      files.push(...[
        { name: 'file12', title: '购房发票、契税完税证明等房产原值、合理费用凭证', },
      ])
    }
    if (formValues['bq4'] === true) {
      files.push(...[
        { name: 'file13', title: '关系材料(如结婚证、户口簿、出生证、人民法院判决书、人民法院调解书或者其他有资质的机构部门出具的能够说明双方关系的材料）', },
      ])
    }
    return files
  }, [formValues])

  const tabItems: TabsProps['items'] = [
    {
      key: '0',
      label: '',
      children: <div className="inputWrapper whole-line">
        <Typography.Title level={1}>卖方登录</Typography.Title>
        <Form.Item name="seller_id_card_name" label="卖方姓名"
          rules={[{ required: true, message: '请输入卖方姓名' }]} required>
          <Input />
        </Form.Item>
        <Form.Item name="seller_id_card_number" label="卖方身份证号"
          rules={[{ required: true, message: '请输入卖方姓名' }]} required>
          {/* fformId是否已经获取过了，如果是，那么主键就不再允许修改了 */}
          <Input maxLength={18} disabled={!!fformId}/>
        </Form.Item>
        <Form.Item name="seller_id_phone_number" label="卖方联系方式"
          rules={[{ required: true, message: '请输入卖方联系方式' }]} required>
          <Input maxLength={11}/>
        </Form.Item>
        <Form.Item name="contract_number" label="网签合同号"
          rules={[{ required: true, message: '请输入网签合同号' }]} required>
          <Input />
        </Form.Item>
      </div>,
    },
    {
      key: '1',
      label: '',
      children: <div className="inputWrapper">
        <Typography.Title level={1}>卖方信息补充</Typography.Title>
        <div className="question">1. 本次出售房屋是否为普通商品房住宅？</div>
        <Form.Item name="sq1"
          rules={[{ required: true, message: '请选择' }]} required>
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
        <div className="question">2. 是否提供购房发票扣减？</div>
        <Form.Item name="sq2"
          rules={[{ required: true, message: '请选择' }]} required>
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
        <div className="question">3. 本次出售房屋面积面积为多少？</div>
        <Form.Item name="sq3"
          rules={[{ required: true, message: '请选择' }]} required>
          <Radio.Group>
            <Radio value={'≤90平方米'}>≤90平方米</Radio>
            <Radio value={'>90平方米'}>{'>90平方米'}</Radio>
          </Radio.Group>
        </Form.Item>
        <div className="question">4. 本次出售房屋持有时间（自购房之日起）？</div>
        <Form.Item name="sq4"
          rules={[{ required: true, message: '请选择' }]} required>
          <Radio.Group>
            <Radio value={'<2年'}>{'<2年'}</Radio>
            <Radio value={'≧2年'}>≧2年</Radio>
            <Radio value={'≧5年'}>≧5年</Radio>
          </Radio.Group>
        </Form.Item>
        <div className="question">5. 出售方婚姻状况？</div>
        <Form.Item name="sq51"
          rules={[{ required: true, message: '请选择' }]} required>
          <Radio.Group>
            <Radio value={'未婚'}>未婚</Radio>
            <Radio value={'已婚'}>已婚</Radio>
            <Radio value={'离异'}>离异</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item dependencies={['sq51']} noStyle>
          {() => ['已婚', '离异'].includes(form.getFieldValue('sq51')) &&
            // <>
            //   <div className="question">是否存在未成年子女？</div>
            //   <Form.Item name="sq52"
            //     rules={[{ required: true, message: '请选择' }]}>
            //     <Radio.Group>
            //       <Radio value={true} defaultChecked>有</Radio>
            //       <Radio value={false}>没有</Radio>
            //     </Radio.Group>
            //   </Form.Item>
            // </>
            <div className="whole-line">
              <Typography.Title level={2}>家属信息</Typography.Title>
              <div className="flex-box">
                <Form.Item name="seller_partner_name" label="卖方配偶姓名"
                  rules={[{ required: true, message: '请输入卖方配偶姓名' }]} required>
                  <Input />
                </Form.Item>
                <Form.Item name="seller_partner_id_card_number" label="卖方配偶身份证号码"
                  rules={[{ required: true, message: '请输入卖方配偶身份证号码' }]} required>
                  <Input maxLength={18}/>
                </Form.Item>
              </div>
              <div className="form-mention">注：如有未成年子女，请填写以下信息</div>
              <div className="flex-box">
                <Form.Item name="seller_child_name" label="卖方子女姓名"
                  rules={[{ required: false, message: '请输入卖方子女姓名' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="seller_child_id_card_number" label="卖方子女身份证号码"
                  rules={[{ required: false, message: '请输入卖方子女身份证号码' }]}>
                  <Input maxLength={18}/>
                </Form.Item>
              </div>
            </div>
          }
        </Form.Item>
        <div className="question">6. 本次出售的房屋是否为出售方家庭唯一住房？</div>
        <Form.Item name="sq6"
          rules={[{ required: true, message: '请选择' }]} required>
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
      </div>,
    },
    {
      key: '2',
      label: '',
      children: <div className="inputWrapper">
        <Typography.Title level={1}>买方信息补充</Typography.Title>
        <div className="question">1.	买方是否广州市户籍？</div>
        <Form.Item name="bq1"
          rules={[{ required: true, message: '请选择' }]} required>
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
        <div className="question">2.	买方婚姻状况？</div>
        <Form.Item name="bq21"
          rules={[{ required: true, message: '请选择' }]} required>
          <Radio.Group>
            <Radio value={'未婚'}>未婚</Radio>
            <Radio value={'已婚'}>已婚</Radio>
            <Radio value={'离异'}>离异</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item dependencies={['bq21']} noStyle>
          {() => ['已婚', '离异'].includes(form.getFieldValue('bq21')) &&
            // <>
            //   <div className="question">是否存在未成年子女？</div>
            //   <Form.Item name="bq22" label="是否存在未成年子女？"
            //     rules={[{ required: true, message: '请选择' }]}>
            //     <Radio.Group>
            //       <Radio value={true} defaultChecked>有</Radio>
            //       <Radio value={false}>没有</Radio>
            //     </Radio.Group>
            //   </Form.Item>
            // </>
            <div className="whole-line">
              <Typography.Title level={2}>家属信息</Typography.Title>
              <div className="flex-box">
                <Form.Item name="receiver_partner_name" label="买方配偶姓名"
                  rules={[{ required: true, message: '请输入买方配偶姓名' }]} required>
                  <Input />
                </Form.Item>
                <Form.Item name="receiver_partner_id_card_number" label="买方配偶身份证号码"
                  rules={[{ required: true, message: '请输入买方配偶身份证号码' }]} required>
                  <Input maxLength={18}/>
                </Form.Item>
              </div>
              <div className="form-mention">注：如有未成年子女，请填写以下信息</div>
              <div className="flex-box">
                <Form.Item name="receiver_child_name" label="买方子女姓名"
                  rules={[{ required: false, message: '请输入买方子女姓名' }]}>
                  <Input />
                </Form.Item>
                <Form.Item name="receiver_child_id_card_number" label="买方子女身份证号码"
                  rules={[{ required: false, message: '请输入买方子女身份证号码' }]}>
                  <Input maxLength={18}/>
                </Form.Item>
              </div>
            </div>
          }
        </Form.Item>
        <div className="question">3. 本次出售的房屋是否为购买方家庭唯一住房？</div>
        <Form.Item name="bq3"
          rules={[{ required: true, message: '请选择' }]} required>
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
        <div className="question">4.	本次交易是否属于近亲交易？</div>
        <Form.Item name="bq4"
          rules={[{ required: true, message: '请选择' }]} required>
          <Radio.Group>
            <Radio value={true}>是（近亲交易范围包括配偶、父母、子女、祖父母、外祖父母、孙子女、外孙子女、兄弟姐妹等）</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
        <div className="question">5.	是否同时办理银行抵押权登记？</div>
        {/* <Form.Item name="bq5" valuePropName="checked"> */}
        <Form.Item name="bq5">
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item dependencies={['bq5']} noStyle>
          {() => {
            return(
              <div className="whole-line">
                <Typography.Title level={2}>领证人信息</Typography.Title>
                <Form.Item name="receiverName" label="姓名"
                  rules={[{ required: true, message: '请输入领证人姓名' }]} required>
                  <Input />
                </Form.Item>
                <Form.Item name="receiverIdCardNumber" label="身份证号码"
                  rules={[{ required: true, message: '请输入领证人身份证号码' }]} required>
                  <Input />
                </Form.Item>
                <Form.Item name="receiverTel" label="手机联系方式"
                  rules={[{ required: true, message: '请输入领证人手机联系方式' }]} required>
                  <Input />
                </Form.Item>
              </div>
            );
          }}
        </Form.Item>
      </div>,
    },
    {
      key: '3',
      label: '',
      children: <div className="inputWrapper">
        <Typography.Title level={1}>材料清单</Typography.Title>
        <table>
          <tbody>
          <tr style={{ fontSize: 20, marginBottom: 38 }}>
            <th style={{ width: 100 }}>序号</th>
            <th>材料</th>
            <th>状态</th>
            <th style={{ width: 200 }}>操作</th>
          </tr>
          {fileInfos && fileInfos.map((fileInfo, index) => (
            <Form.Item shouldUpdate noStyle>
              {() => <tr key={index}>
                <th>{index + 1}</th>
                <td>{fileInfo.title}</td>
                <td style={{ width: 100 }}>{formValues[fileInfo.name] ? '已上传' : '未上传'}</td>
                <td style={{ width: 200 }}>
                  <div className="volumnFour">
                    <Form.Item name={fileInfo.name} noStyle><></></Form.Item>
                    <Button style={{ margin: '0 8px' }} onClick={() => alert('敬请期待')}>要求与示例</Button>
                    {formValues[fileInfo.name] ? null : <Upload {...props} onChange={onChangeHoc(fileInfo.name)}>
                      <Button style={{ margin: '0 8px' }} type="primary">上传</Button>
                    </Upload>}
                    {formValues[fileInfo.name] &&
                      <Button style={{ margin: '0 8px' }} danger onClick={() => {
                        form.setFieldValue(fileInfo.name, null)
                        onSyncForm()
                        const newfileUrls = JSON.parse(JSON.stringify(fileUrls));
                        delete newfileUrls[fileInfo.name];
                        setFileUrls(newfileUrls);
                      }}>删除</Button>}
                      {fileUrls[fileInfo.name] && <Image
                        width={50}
                        style={{maxHeight: '30px', marginLeft: '20px'}}
                        src={fileUrls[fileInfo.name]}
                      />}
                  </div>
                </td>
              </tr>}
            </Form.Item>
            ))}
          </tbody>
        </table>
      </div>,
    },
  ];

  return (
    <>
      <Header />
      <div className="background"></div>
      <div className="wrapper">
        <Form
          form={form}
          onFinish={onFinish}
          onFinishFailed={() => navigate('../complete')}
        >
          <Steps current={current} items={stepItems} />
          <Tabs activeKey={`${current}`} items={tabItems} renderTabBar={() => <></>} />
          <div style={{ marginTop: 24 }}>
            {current > 0 && (
              <Button style={{ margin: '0 8px' }} onClick={() => prev()}>
                上一步
              </Button>
            )}
            {current < steps.length - 1 && (
              <Button type="primary" onClick={onNext}>
                确认 & 下一步
              </Button>
            )}
            {current === steps.length - 1 && (
              <Button htmlType="submit" size="middle" loading={isSubmit} type="primary">提交</Button>
            )}
          </div>
        </Form>

      </div>
    </>);
};
