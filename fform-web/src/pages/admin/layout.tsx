import * as React from 'react';
import { useContext, useEffect, useState } from 'react';
import {
  Button,
  Modal,
  message,
  Checkbox,
  Card,
  Skeleton,
  Tabs,
  Table,
  Space,
  Tag,
  Breadcrumb,
  Layout,
  Menu
} from 'antd';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';



export const AdminLayout = () => {
  return (
    <div className="App">

      <Layout className="layout">
        <Layout.Header style={{ display: 'flex', alignItems: 'center' }}>
          <Menu
            theme="dark"
            mode="horizontal"
            defaultSelectedKeys={['2']}
            items={[
              { key: 1, label: <Link to="/admin/fform">填表管理</Link> },
            ]}
          />
        </Layout.Header>
        <Layout.Content style={{ padding: '0 50px' }}>
          <Breadcrumb style={{ margin: '16px 0' }}>
            <Breadcrumb.Item>主页</Breadcrumb.Item>
            <Breadcrumb.Item>填表管理</Breadcrumb.Item>
          </Breadcrumb>
          <div className="site-layout-content">
            <Outlet />
          </div>
        </Layout.Content>
        {/*<Layout.Footer style={{ textAlign: 'center' }}>XXX ©2023 Created by LikyhStudio</Layout.Footer>*/}
      </Layout>
    </div>
  );
};
