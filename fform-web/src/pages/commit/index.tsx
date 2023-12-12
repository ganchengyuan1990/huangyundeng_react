import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button, Form, Image, Input, message, Modal, Skeleton } from 'antd';
// import title1Png from '../../assets/title1.png';
import accountManager from '../account/accountManager';
import { useNavigate } from 'react-router-dom';
import { AccountModel } from '../../types/account';
import useQuery from '../../utils/query';
import { FformModel, FormFileOut, FormValueIn } from '../../types/fform';
import { apiFformGetForm, apiFformSubmitAudit } from '../../apis/fform';
import camelCase from 'camelcase';

// 意愿确认
export const CommitPage = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const [isSubmit, setIsSubmit] = React.useState(false)
  const navigate = useNavigate()

  const { fformId } = useQuery<{ fformId: string, }>()

  const [openForm, setOpenForm] = React.useState<FformModel | null>(null)

  useEffect(() => {
    (async() => {
      if (fformId) {
        setOpenForm(null)
        const { fform } = await apiFformGetForm(fformId)
        for (const column of fform.formInterface.columns) {
          column.key = camelCase(column.key)
        }
        setOpenForm(fform)
      }
    })()
  }, [fformId])

  const onFinish = async () => {
    setIsSubmit(true)
    await apiFformSubmitAudit(fformId)
    setIsSubmit(false)
    message.success('提交成功')
    navigate(`/`)
  }

  return (
    <div style={{ overflow: 'hidden', minHeight: '150.0rem', marginTop: '15%' }}>
      {contextHolder}

      <div className="bnerbghome_tbox">
        <span className="bnerbghome_subtitle">
          意愿确认
        </span>
      </div>

      <div style={{ margin: '0 auto', width: 600 }}>
        {openForm
          ? <>
            <table>
              <tbody>
              <tr style={{ fontSize: 20, marginBottom: 38 }}>
                <th style={{ width: 100 }}>序号</th>
                <th>材料</th>
                <th>填写内容</th>
              </tr>
              {openForm.formInterface.columns.map((column, index) => (
                <tr key={index}>
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

      <Button style={{ marginTop: 180, marginRight: 100}} onClick={() => {
        navigate('/form')
      }}>
        取消提交
      </Button>

      <Button type="primary" style={{ marginTop: 180}} loading={isSubmit} onClick={onFinish}>
        确认&提交
      </Button>
    </div>
  );
};
