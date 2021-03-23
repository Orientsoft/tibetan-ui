import React from 'react';
import { request } from 'ice';
import moment from 'moment';
import {
  Row,
  Col,
  Table, Space, message, Typography
} from 'antd';
import { useAntdTable } from 'ahooks';
import { getLocaleDesc} from '@/utils/common';
import AddUser from './addUser';
import ResetButton from './resetPwd';
import EditMenu from './editMenu'


const roleCfg = { 0: getLocaleDesc('user_role_1'), 1: getLocaleDesc('user_role_2') };
const getTableData = ({ current, pageSize }) => {
  return request({ url: '/user_list', params: { page: current, limit: pageSize } })
    .then((res) => {
      const list = res.data.map(v => ({
        ...v,
        password: '******',
        createdAt: moment(v.createdAt).format('YYYY-MM-DD HH:mm:ss'),
      }));
      return { total: res.total, list }
    });
};
export default function UserManage() {
  const { Title } = Typography;
  const { tableProps, loading, search } = useAntdTable(getTableData, {
    defaultPageSize: 10,
  });
  const onSave = ()=>{
    search.reset()
  }
  const baseClumn = [
    {
      title: getLocaleDesc('user_name'),
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: getLocaleDesc('user_password'),
      dataIndex: 'password',
      key: 'password',
      render: () => '******',
    },
    {
      title: getLocaleDesc('time'),
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    // {
    //   title: getLocaleDesc('user_role'),
    //   dataIndex: 'role',
    //   key: 'role',
    //   render:(value)=>{
    //     return value.indexOf(0)>-1?roleCfg[0]:roleCfg[1]
    //   }
    // },
    {
      title: getLocaleDesc('user_menu'),
      dataIndex: 'role',
      key: 'role',
      render:(value,record)=>{
        // if(value.indexOf(0)>-1){
        //   return getLocaleDesc('calc_all_button')
        // }
        return <EditMenu record={record} onSave={onSave} />
      }
    },
  ];
  const onAdd = (v, closeModal) => {
    request({ url: '/user', data: {...v}, method: 'post', })
      .then((r) => {
        message.success(getLocaleDesc('success'));
        closeModal();
        search.reset();
      });
  };
  const columns = [
    ...baseClumn,
    {
      title: getLocaleDesc('action'),
      dataIndex: 'name4',
      key: 'name4',
      render: (text, record) => {
        return (
          <Space>
            <ResetButton uid={record.id} />
          </Space>
        );
      },
    },
  ];
  return (
    <>
      <Row>
        <Col span={18}>
          <Typography >
            <Title level={5}>{getLocaleDesc('console_tab_user')}</Title>
          </Typography>
        </Col>
        <Col span={6} className="text-right">
          <AddUser onAdd={onAdd} />
        </Col>
      </Row>
      <Table columns={columns} { ...tableProps} rowKey="id" loading={loading} />
    </>
  );
}
