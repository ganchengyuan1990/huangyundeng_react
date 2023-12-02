import * as React from 'react';
import { useEffect, useMemo, useState } from 'react';
import accountManager from '../account/accountManager';
import { useNavigate } from 'react-router-dom';
import { AccountModel } from '../../types/account';
import {
  Button,
  Checkbox,
  Col,
  Form,
  Input,
  message,
  Radio,
  Row,
  Steps,
  Tabs,
  TabsProps,
  Typography,
  Upload, UploadProps
} from 'antd';
import {
  apiFformCreateForm,
  apiFformSubmitAudit,
  apiFformUploadToken,
  apiFformUpsertForm,
  FormValueIn,
  FormValueOut
} from '../../apis/fform';
import { UploadChangeParam, UploadFile } from 'antd/es/upload/interface';


export const IndexPage = () => {
  const [form] = Form.useForm()
  const [isSubmit, setIsSubmit] = React.useState(false)
  const [formValues, setFormValues] = React.useState<Record<string, FormValueIn>>({})
  const [fformId, setFformId] = useState<string>('')
  const [token, setToken] = useState<string>('')
  const navigate = useNavigate()

  useEffect(() => {
    let account: AccountModel | null = accountManager.getAccount();
    accountManager.listenAccountChange(v => account=v);
    (async function() {
    })()
  }, [])
  const getUserInfoFunc = async (question: string = '', tag: string = '') => {
    await navigate(`/qa/qa?question=${question}&tag=${tag}`)
  }

  const [current, setCurrent] = useState(0);

  const next = () => {
    setCurrent(current + 1);
  };

  const prev = () => {
    setCurrent(current - 1);
  };

  const onUpsertForm = async(needCreate: boolean) => {
    let formId = fformId, values
    if (needCreate) {
      // 姓名填完后，请求并创建fform
      ({ formId, values } = await apiFformCreateForm('1', 'seller_id_card_number', form.getFieldValue('seller_id_card_number')))
      form.setFieldsValue(values)
      // setFormValues(values)
      setFformId(formId)
    }
    // 后面的步骤，更新fform
    await apiFformUpsertForm(formId, form.getFieldsValue())
  }

  const onSyncForm = async() => {
    setFormValues(form.getFieldsValue())
    await onUpsertForm(!fformId)
  }

  const onFinish = async(values: Record<string, FormValueIn>) => {
    setIsSubmit(true)
    await onUpsertForm(!fformId)
    await apiFformSubmitAudit(fformId)
    form.resetFields()
    setIsSubmit(false)
  }

  useEffect(() => {
    (async() => {
      if (fformId) {
        const response = await apiFformUploadToken(fformId)
        setToken(response.token)
      }
    })()
  }, [fformId])

  const props: UploadProps = {
    name: 'file',
    action: 'https://upload.qiniup.com/',
    data: { token },
    headers: {
      authorization: 'authorization-text',
    },
  };
  const onChangeHoc = (formName: string) => {
    return (info: UploadChangeParam) => {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`)
        console.log(formName)
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 上传失败`)
      }
    }
  };

  const steps = ['卖方登录', '卖方信息补充', '买方信息补充', '材料清单上传', ];
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
    if (formValues['']) {
      files.push(...[
        { name: 'file9', title: '在本市缴交个人所得税或社会保险的缴纳证明', },
        { name: 'file10', title: '卖方个人名下查询', },
        { name: 'file11', title: '家庭成员（卖方夫妻双方）户口簿、身份证明、婚姻证明(结婚证、离婚证)', },
        { name: 'file12', title: '购房发票、契税完税证明等房产原值、合理费用凭证', },
        { name: 'file13', title: '关系材料(如结婚证、户口簿、出生证、人民法院判决书、人民法院调解书或者其他有资质的机构部门出具的能够说明双方关系的材料）', },
        { name: 'file14', title: '若选择同时办理银行抵押权登记的，要额外提供广州市不动产登记申请表，按揭抵押合同等材料', },
      ])
    }
    return files
  }, [formValues])

  const tabItems: TabsProps['items'] = [
    {
      key: '0',
      label: '',
      children: <>
        <Form.Item name="seller_id_card_name" label="卖方姓名"
                   rules={[{ required: true, message: '请输入卖方姓名' }]} required>
          <Input/>
        </Form.Item>
        <Form.Item name="seller_id_card_number" label="卖方身份证号"
                   rules={[{ required: true, message: '请输入卖方姓名' }]} required>
          <Input/>
        </Form.Item>
        <Form.Item name="contract_number" label="网签合同号"
                   rules={[{ required: true, message: '请输入网签合同号' }]} required>
          <Input/>
        </Form.Item>
      </>,
    },
    {
      key: '1',
      label: '',
      children: <>
        <Typography.Title level={1}>卖方信息补充</Typography.Title>
        <Form.Item name="sq1" label="1. 本次出售房屋是否为普通商品房住宅？"
                   rules={[{ required: true, message: '请选择' }]} required>
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="sq2" label="2. 是否提供购房发票扣减?"
                   rules={[{ required: true, message: '请选择' }]} required>
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="sq3" label="3. 本次出售房屋面积面积为多少?"
                   rules={[{ required: true, message: '请选择' }]} required>
          <Radio.Group>
            <Radio value={'≤90平方米'}>≤90平方米</Radio>
            <Radio value={'>90平方米'}>{'>90平方米'}</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="sq4" label="4. 本次出售房屋持有时间（自购房之日起）？"
                   rules={[{ required: true, message: '请选择' }]} required>
          <Radio.Group>
            <Radio value={'<2年'}>{'<2年'}</Radio>
            <Radio value={'≧2年'}>≧2年</Radio>
            <Radio value={'≧5年'}>≧5年</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="sq5-1" label="5. 出售方婚姻状况？"
                   rules={[{ required: true, message: '请选择' }]} required>
          <Radio.Group>
            <Radio value={'未婚'}>未婚</Radio>
            <Radio value={'已婚'}>已婚</Radio>
            <Radio value={'离异'}>离异</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item dependencies={['sq5-1']} noStyle>
          {() => ['已婚', '离异'].includes(form.getFieldValue('sq5-1')) &&
            <Form.Item name="sq5-2" label="是否存在未成年子女？"
                       rules={[{ required: true, message: '请选择' }]}>
              <Radio.Group>
                <Radio value={true} defaultChecked>有</Radio>
                <Radio value={false}>没有</Radio>
              </Radio.Group>
            </Form.Item>}
        </Form.Item>
        <Form.Item name="sq6" label="6. 本次出售的房屋是否为出售方家庭唯一住房？"
                   rules={[{ required: true, message: '请选择' }]} required>
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
      </>,
    },
    {
      key: '2',
      label: '',
      children: <>
        <Typography.Title level={1}>买方信息补充</Typography.Title>
        <Form.Item name="bq1" label="1.	买方是否广州市户籍？"
                   rules={[{ required: true, message: '请选择' }]} required>
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="bq2-1" label="2.	买方婚姻状况？"
                   rules={[{ required: true, message: '请选择' }]} required>
          <Radio.Group>
            <Radio value={'未婚'}>未婚</Radio>
            <Radio value={'已婚'}>已婚</Radio>
            <Radio value={'离异'}>离异</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item dependencies={['bq2-1']} noStyle>
          {() => ['已婚', '离异'].includes(form.getFieldValue('sq5-1')) &&
            <Form.Item name="bq2-2" label="是否存在未成年子女？"
                       rules={[{ required: true, message: '请选择' }]}>
              <Radio.Group>
                <Radio value={true} defaultChecked>有</Radio>
                <Radio value={false}>没有</Radio>
              </Radio.Group>
            </Form.Item>}
        </Form.Item>
        <Form.Item name="bq3" label="3. 本次出售的房屋是否为购买方家庭唯一住房？"
                   rules={[{ required: true, message: '请选择' }]} required>
          <Radio.Group>
            <Radio value={true}>是</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="bq4" label="4.	本次交易是否属于近亲交易？"
                   rules={[{ required: true, message: '请选择' }]} required>
          <Radio.Group>
            <Radio value={true}>是（近亲交易范围包括配偶、父母、子女、祖父母、外祖父母、孙子女、外孙子女、兄弟姐妹等）</Radio>
            <Radio value={false}>否</Radio>
          </Radio.Group>
        </Form.Item>
        <Form.Item name="bq5" valuePropName="checked">
          <Checkbox>是否同时办理银行抵押权登记</Checkbox>
        </Form.Item>
        <Form.Item dependencies={['bq5']} noStyle>
          {() => form.getFieldValue('bq5') &&
            <>
              <Typography.Title level={2}>领证人信息</Typography.Title>
              <Form.Item name="receiver_name" label="姓名"
                         rules={[{ required: true, message: '请输入领证人姓名' }]} required>
                <Input/>
              </Form.Item>
              <Form.Item name="receiver_id_card_number" label="身份证号码"
                         rules={[{ required: true, message: '请输入领证人身份证号码' }]} required>
                <Input/>
              </Form.Item>
              <Form.Item name="receiver_tel" label="手机联系方式"
                         rules={[{ required: true, message: '请输入领证人手机联系方式' }]} required>
                <Input/>
              </Form.Item>
            </>}
        </Form.Item>
      </>,
    },
    {
      key: '3',
      label: '',
      children: <>
        <Typography.Title level={1}>材料清单</Typography.Title>
        <table>
          <tr>
            <th>序号</th>
            <th>材料</th>
            <th>状态</th>
            <th>操作</th>
          </tr>
          <tbody>
          {fileInfos && fileInfos.map((fileInfo, index) => (<tr key={index}>
            <th>{index+1}</th>
            <th>{fileInfo.title}</th>
            <th>{formValues[fileInfo.name] ? '已上传' : '未上传'}</th>
            <th>
              <Upload {...props} onChange={onChangeHoc(fileInfo.name)}>
                <Button style={{ margin: '0 8px' }} type="primary">上传</Button>
              </Upload>
              <Button style={{ margin: '0 8px' }} onClick={() => alert('敬请期待')}>要求与示例</Button>
              {formValues[fileInfo.name] && <Button style={{ margin: '0 8px' }} danger onClick={() => prev()}>删除</Button>}
            </th>
          </tr>))}
          </tbody>
        </table>
      </>,
    },
  ];

  return (<>
    <Form
      form={form}
      onFinish={onFinish}
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
          <Button type="primary" onClick={() => {
            next();
            onSyncForm()
          }}>
            确认 & 下一步
          </Button>
        )}
        {current === steps.length - 1 && (
          <Button htmlType="submit" size="middle" loading={isSubmit} type="primary">提交</Button>
        )}
      </div>
    </Form>

  </>);
};
