import React, { useState, useEffect } from 'react';
import { Row, Col, Modal, Button, Table, Tooltip, Spin } from 'antd';
import { getLocaleDesc} from '@/utils/common';
import { CheckCircleTwoTone, CloseCircleTwoTone } from '@ant-design/icons';
import { request } from 'ice'

export default function Confirm({ visible, onCancel, title, list, prefix, onConfirm }) {
  const [uploadList, setUploadList] = useState([])
  const [selData, setSelData] = useState([])
  const [uploadIndex, setUploadIndex] = useState(-1)
  const [loading, setLoading] = useState(false)

  useEffect(()=>{
    // console.log('useEffect',list)
    setUploadList(list)
  },[list])

  useEffect(()=>{
    // console.log('useEffect',uploadList)
    // setUploadList(list)
  },[uploadList])

  const columns = [
    {
      title: `${getLocaleDesc('file_search')}(${getLocaleDesc('count_all')}:${uploadList.length})`,
      dataIndex: 'webkitRelativePath',
      key: 'webkitRelativePath',
    },
    {
      title: getLocaleDesc('status'),
      dataIndex: 'status',
      key: 'status',
      render(v,record){
        if(v==='done'){
          return <Tooltip title={getLocaleDesc('success')} color="#52c41a"><CheckCircleTwoTone style={{fontSize:'20px'}} twoToneColor="#52c41a" /></Tooltip>
        }else if(v==='error'){
          return <Tooltip title={getLocaleDesc(record.msg)} color="#ff982a"><CloseCircleTwoTone style={{fontSize:'20px'}} twoToneColor="#ff982a"/></Tooltip>
        }
      },
      width:60
    },
  ];

  useEffect(()=>{
    if(uploadIndex > -1){
      upload(uploadList[uploadIndex],uploadIndex)
    }
  },[uploadIndex])

  const upload = async (file,nextIndex) =>{
    let prefixDir = ''
    if(prefix.length>0){
      prefixDir = prefix[0].substring(5)
    }
    const formData = new FormData();
    formData.append('file',file)
    formData.append('path',file.webkitRelativePath || file.name)
    formData.append('prefix_dir',prefixDir)
    const neWFile = {
      webkitRelativePath: file.webkitRelativePath,
      name: file.name,
      uid: file.uid,
      size: file.size
    }
    // const params = {
    //   path: file.webkitRelativePath || file.name,
    //   prefix_dir: prefixDir,
    //   file
    // }
    let res = ''
    try{
      res = await request({
        url:'/file',
        method:'post',
        data: formData
      })
    }catch(e){
      res = e
    }

    if(res.errors){
      neWFile.status = 'error'
      neWFile.msg = res.errors[0].msg
    }else{
      neWFile.status = 'done'
    }
    const newData = [...uploadList];
    const index = newData.findIndex((f) => neWFile.uid === f.uid);
    console.log('upload',res,neWFile,newData, index)
    if (index > -1) {
      const item = newData[index];
      newData.splice(index, 1, {...item,...neWFile });
      setUploadList(newData);
    }
    onStart(nextIndex+1)
  }

  const onStart = (index)=>{
    console.log('onStart')
    // 找到没有上传过的文件
    while(uploadList.length > index){
      const file = uploadList[index]
      if(file.status){
        index += 1
      }else{
        break
      }
    }
    if(index < uploadList.length){
      setLoading(true)
      setUploadIndex(index)
    }else{
      setLoading(false)
    }
  }

  const onDel = ()=>{
    const newData = [...uploadList];
    const tmp = newData.filter(item=>selData.findIndex((v=>v===item.uid))<0)
    setUploadList(tmp);
  }

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      // console.log(selectedRowKeys,selectedRows)
      setSelData(selectedRowKeys)
    },
    selectedRowKeys:[...selData]
  };

  return (

    <Modal title={title} visible={visible} footer={null} onCancel={onCancel}>
      <div className="pt-10 text-center pb-20" style={{'maxHeight':'800px',overflowY:'auto'}}>
        <Table
          rowSelection={{
            type: 'checkbox',
            ...rowSelection,
          }}
          dataSource={uploadList}
          pagination={{
            hideOnSinglePage:true,
            defaultPageSize:10,
            total:uploadList.length}}
          columns={columns}
          rowKey="uid" />
      </div>
      <Spin spinning={loading}>
        <div className=" text-right">
          <Button type="primary" onClick={onDel} >
            {getLocaleDesc('button_delete')}</Button>&nbsp;&nbsp;
          <Button type="primary" onClick={()=>onStart(0)} >
            {getLocaleDesc('start')}</Button>&nbsp;&nbsp;

          <Button type="primary" onClick={onConfirm} >
            {getLocaleDesc('close')}</Button>
        </div>
      </Spin>

    </Modal>
  );
}
