import React, { useState } from 'react';
import { Row, Col, Modal, Button, Table, Tooltip } from 'antd';
import { getLocaleDesc} from '@/utils/common';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';

export default function Confirm({ visible, onCancel, title, list, onConfirm }) {
  const columns = [
    {
      title: getLocaleDesc('file_search'),
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: getLocaleDesc('status'),
      dataIndex: 'status',
      key: 'status',
      render(v,record){
        if(v==='done'){
          return <Tooltip title={getLocaleDesc('success')} color="#52c41a"><CheckCircleTwoTone style={{fontSize:'20px'}} twoToneColor="#52c41a" /></Tooltip>
        }else{
          return <Tooltip title={record.msg} color="#ff982a"><CloseCircleTwoTone style={{fontSize:'20px'}}  twoToneColor="#ff982a"/></Tooltip>
        }
      },
      width:60
    },
  ];
  return (
    <Modal title={title} visible={visible} footer={null} onCancel={onCancel}>
      <div className="pt-10 text-center pb-20">
        <Table dataSource={list} columns={columns} rowKey="id" />
      </div>
      <div className=" text-right"><Button type="primary" onClick={onConfirm} >
        {getLocaleDesc('confirm')}</Button>
      </div>

    </Modal>
  );
}
