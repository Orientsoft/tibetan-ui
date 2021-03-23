import React, { useEffect, useRef, useState } from "react";
import { Upload, Button, message, Modal, Table, Tooltip } from "antd";
import { CheckCircleTwoTone, CloseCircleOutlined } from '@ant-design/icons';
import { request } from 'ice'
import { getLocaleDesc} from '@/utils/common';

function upfile(v){
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(v)
    }, 1000);
  })
}

export default function OrderUpload({ prefix }) {
  const fileCount = useRef(0);
  const [visible, setVisible] = useState(false);
  const [upFileList, setUpFileList] = useState([]);
  const tmpList = useRef([]);

  const onCancel = () => {
    fileCount.current = 0;
    setVisible(false);
    setUpFileList([]);
  };

  const props = {
    directory: true,
    beforeUpload: (file, fileList) => {
      fileCount.current += 1;
      if (fileCount.current === fileList.length) {
        console.log(fileList);
        fileCount.current = 0;
        tmpList.current = fileList.map((v) => ({
          id: v.uid,
          name: v.name,
          path: v.webkitRelativePath ? v.webkitRelativePath : v.name,
          status: '上传中',
          orign: v,
        }));
        setUpFileList(tmpList.current);
        setVisible(true);
        let pros = Promise.resolve();
        tmpList.current.forEach((v) => {
          pros = pros.then(() => { 
            let prefixDir = ''
            if(prefix.length>0){
              prefixDir = prefix[0].substring(5)
            } 
            const formData = new FormData();
            formData.append('file',v.orign);
            formData.append('path',v.webkitRelativePath || v.name);
            formData.append('prefix_dir',prefixDir);
            return request({
              url:'/file',
              method:'post',
              data: formData
            });            
          }).then(() => {
            console.log(v, tmpList.current);
            tmpList.current = tmpList.current.map((l) => {
              if(v.id === l.id){
                return { ...l, status: 'done'};
              }
              return l;
            });
            setUpFileList(tmpList.current);  
          }).catch(() => {
            tmpList.current = tmpList.current.map((l) => {
              if(v.id === l.id){
                return { ...l, status: 'error'};
              }
              return l;
            });
            setUpFileList(tmpList.current); 
          });
        });              
      }
      return false;
    },
  };
  
  return (
    <>
      <Upload {...props} showUploadList={false}>
        <Button>上传</Button>
      </Upload>

      <Modal
        title="上传文件"
        visible={visible}
        footer={null}
        onCancel={onCancel}
      >        
        <Uplist list={upFileList} />
      </Modal>
    </>
  );
}

function Uplist({ list }){
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
      render(v){
        if(v==='done'){
          return <Tooltip title={getLocaleDesc('success')} color="#52c41a"><CheckCircleTwoTone style={{fontSize:'20px'}} twoToneColor="#52c41a" /></Tooltip>
        }else{
          return <Tooltip title={getLocaleDesc('failed')} color="#ff982a"><CloseCircleOutlined style={{fontSize:'20px'}}  twoToneColor="#ff982a"/></Tooltip>
        }
      },
      width:60
    },
  ];
  return (
    <div className="pt-10 text-center pb-20">
      <Table dataSource={list} columns={columns} rowKey="id" />
    </div>
  )
}