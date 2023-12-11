import * as React from 'react';
import { useEffect, useState } from 'react';
import { Button, DatePicker, Form, Image, Input, message, Modal, Select, Skeleton, Space, Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import { FformModel, FormFileOut } from '../../types/fform';
import { apiFformChangeAudit, apiFformGetForm, apiFformGetForms } from '../../apis/fform';
import dayjs from 'dayjs';
import camelCase from 'camelcase';

export const FformAdminPage = () => {
  const [searchForm] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate()

  const [fforms, setFforms] = useState<FformModel[]>([])
  const [filterValues, setFilterValues] = useState<Record<string, any>>({})
  const [page, setPages] = useState<number>(1)

  const [openForm, setOpenForm] = React.useState<FformModel | null>(null)

  const [fformId, setFformId] = useState<string | number | null>(null);

  useEffect(() => {
    (async() => {
      const { fforms } = await apiFformGetForms('1',
        filterValues['status'],
        filterValues['auditTimeStart'], filterValues['auditTimeEnd'],
        filterValues['submitTimeStart'], filterValues['submitTimeEnd'],
        filterValues['filterValues'],
      )
      setFforms(fforms)
    })()
  }, [filterValues, page])

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

  const onFinish = (values: any) => {
    setFilterValues({
      status: values['status'],
      auditTimeStart: values['audit_time_range'] ? dayjs(values['audit_time_range'][0]).format('YYYY-MM-DD HH:mm') : null,
      auditTimeEnd: values['audit_time_range'] ? dayjs(values['audit_time_range'][1]).format('YYYY-MM-DD HH:mm') : null,
      submitTimeStart: values['submit_time_range'] ? dayjs(values['submit_time_range'][0]).format('YYYY-MM-DD HH:mm') : null,
      submitTimeEnd: values['submit_time_range'] ? dayjs(values['submit_time_range'][1]).format('YYYY-MM-DD HH:mm') : null,
      filterValues: { 'seller_id_card_name' : values['seller_id_card_name'] },
    })
  };

  const handleAuditReject = async() => {
    if (fformId) {
      await apiFformChangeAudit(fformId, 'editing')
      setFformId(null)
      setFforms(fforms => {
        for (let fform of fforms) {
          if (fformId == fform.id) {
            fform.status = 'editing'
          }
        }
        return fforms
      })
    }
  }

  const handleAuditAccept = async() => {
    if (fformId) {
      await apiFformChangeAudit(fformId, 'confirmed')
      setFformId(null)
      setFforms(fforms => {
        for (let fform of fforms) {
          if (fformId == fform.id) {
            fform.status = 'confirmed'
          }
        }
        return fforms
      })
    }
  }


  const columns: ColumnsType<FformModel> = [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '申请人',
      dataIndex: ['values', 'sellerIdCardName'],
      key: 'sellerIdCardName',
    },
    {
      title: '申请时间',
      dataIndex: 'submitTime',
      key: 'submitTime',
    },
    {
      title: '审批状态',
      key: 'status',
      render: (_, record) => (record.status ? {'editing': '审批不通过/修改中', 'auditing': '等待审批',  'confirmed': '审批通过'}[record.status] : '未知'),
    },
    {
      title: '审批人',
      key: 'auditAccount',
      render: (_, record) => '管理员',
    },
    {
      title: '审批时间',
      dataIndex: 'auditTime',
      key: 'auditTime',
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => setFformId(record.id)}>查看材料</a>
        </Space>
      ),
    },
  ];


  return (
    <>
      {contextHolder}

      <Form form={searchForm} onFinish={onFinish} style={{ textAlign: 'left' }}>
        <Space>
          <Form.Item
            name="seller_id_card_name"
            label="申请人"
          >
            <Input/>
          </Form.Item>
          <Form.Item
            name="submit_time_range"
            label="申请时间"
          >
            <DatePicker.RangePicker
              placeholder={['开始时间', '结束时间']}
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>
        </Space>
        <Space>
          <Form.Item
            name="status"
            label="审批状态"
          >
            <Select
              style={{ width: 167 }}
              allowClear
              options={[
                { value: 'editing', label: '审批不通过/修改中' },
                { value: 'auditing', label: '审批中' },
                { value: 'confirmed', label: '已审批通过' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="audit_time_range"
            label="审批时间"
          >
            <DatePicker.RangePicker
              placeholder={['开始时间', '结束时间']}
              showTime={{ format: 'HH:mm' }}
              format="YYYY-MM-DD HH:mm"
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">查询</Button>
          </Form.Item>
        </Space>
      </Form>


      <Modal
        title="材料清单"
        centered
        open={!!fformId}
        width={1000}
        onCancel={() => {
          setFformId(null)
          setOpenForm(null)
        }}
        footer={openForm && openForm.status == 'auditing' ? [
          <Button key="reject" onClick={handleAuditReject}>审批驳回</Button>,
          <Button key="accept" type="primary" onClick={handleAuditAccept}>审批通过</Button>,
        ]: []}
      >
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
      </Modal>

      <Table columns={columns} dataSource={fforms} rowKey="id" />

    </>
  );
};
