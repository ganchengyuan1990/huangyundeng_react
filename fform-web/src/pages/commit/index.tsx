import * as React from 'react';
import { useEffect, useState } from 'react';
import {
  Button, Form, Image, Input, message, Modal, Skeleton, Upload, UploadProps,
} from 'antd';
// import title1Png from '../../assets/title1.png';
import accountManager from '../account/accountManager';
import { useNavigate } from 'react-router-dom';
import { AccountModel } from '../../types/account';
import useQuery from '../../utils/query';
import { FformModel, FormFileOut, FormValueIn } from '../../types/fform';
import { UploadChangeParam } from 'antd/es/upload/interface';
import { apiFformGetForm, apiFformSubmitAudit, apiFformUploadToken, apiFformUpsertForm } from '../../apis/fform';
import camelCase from 'camelcase';

// 意愿确认
export const CommitPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [isSubmit, setIsSubmit] = React.useState(false)
  const [token, setToken] = useState<string>('')
  const navigate = useNavigate()

  const { fformId } = useQuery<{ fformId: string, }>()

  const [openForm, setOpenForm] = React.useState<FformModel | null>(null)

  useEffect(() => {
    (async() => {
      if (fformId) {
        const response = await apiFformUploadToken(fformId)
        setToken(response.token)
        setOpenForm(null)
        const { fform } = await apiFformGetForm(fformId)
        for (const column of fform.formInterface.columns) {
          column.key = camelCase(column.key)
        }
        setOpenForm(fform)
      }
    })()
  }, [fformId])


  const props: UploadProps = {
    name: 'file',
    action: 'https://upload.qiniup.com/',
    data: { token },
    listType: 'picture-card',
    headers: {
      authorization: 'authorization-text',
    },
    showUploadList: false,
    accept: ".jpg, .jpeg, .png"
  };

  // 上传问询材料
  const onChangeHoc = () => {
    return (info: UploadChangeParam) => {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 上传成功`)
        openForm?.formInterface.columns.push({ 
          key: 'file15', 
          name: '问询材料',
          valueType: 'file'
        })
        // @ts-ignore
        openForm.values['file15'] = {
          url: info.file.response.private_url,
          id: info.file.response.form_file_id
        }
        setOpenForm(JSON.parse(JSON.stringify(openForm)))
        apiFformUpsertForm(fformId, getFieldsValue(openForm?.values))
      } else if (info.file.status === 'error') {
        console.log(info)
      }
    }
  };

  const getFieldsValue = (values: any) => {
    console.log(values)
    const result = JSON.parse(JSON.stringify(values));
    Object.keys(result).forEach(key => {
      if (result[key]?.id) {
        result[key] = Number(result[key]?.id);
      }
    })
    return result;
  }

  const onFinish = async () => {
    setIsSubmit(true)
    await apiFformSubmitAudit(fformId)
    setIsSubmit(false)
    message.success('提交成功')
    navigate(`/`)
  }

  return (
    <div style={{ overflow: 'hidden', minHeight: '150.0rem', marginTop: '5%' }}>
      {contextHolder}

      <div className="bnerbghome_tbox">
        <span className="bnerbghome_subtitle">
          意愿确认
        </span>
      </div>

      <div style={{ margin: '0 auto', marginTop: 60, marginBottom: 60, padding: "0 100px" }}>
        {openForm
          ? <>
            <table style={{ width: '100%' }}>
              <tbody>
              <tr style={{ fontSize: 21, height: 50 }}>
                <th style={{ width: 100 }}>序号</th>
                <th>材料</th>
                <th>填写内容</th>
              </tr>
              {openForm.formInterface.columns.map((column, index) => (
                <tr key={index} style={{ height: 30 }}>
                  <th>{index + 1}</th>
                  <td>{column.name}</td>
                  <td style={{ width: 100 }}>
                    <>
                      {column.valueType == 'primary_string' && openForm.values[column.key]}
                      {column.valueType == 'string' && openForm.values[column.key]}
                      {column.valueType == 'boolean' && (openForm.values[column.key] === true ? '是' : (openForm.values[column.key] === false ? '否' : '-'))}
                      {column.valueType == 'file' && (openForm.values[column.key]
                        ? <Image
                          width={25}
                          src={(openForm.values[column.key] as FormFileOut).url}
                        />
                        : '未上传')}
                    </>
                  </td>
                </tr>))}
              </tbody>
            </table>
          </>
          : <Skeleton/>}
      </div>

      <Upload {...props} onChange={onChangeHoc()} style={{ marginTop: 50 }}>
        {!openForm?.values['file15'] ? <span>问询材料上传</span>
         : <img
          width={60}
          src={(openForm.values['file15'] as FormFileOut).url}
        />}
      </Upload>

      <Button style={{ marginTop: 80, marginRight: 100}} onClick={() => {
        navigate('/form')
      }}>
        取消提交
      </Button>

      <Button type="primary" style={{ marginTop: 80}} loading={isSubmit} onClick={onFinish}>
        确认&提交
      </Button>
    </div>
  );
};
