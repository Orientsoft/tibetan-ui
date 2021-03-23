import React, { useState, useEffect } from 'react';
import { request } from 'ice';
import moment from 'moment';
// import { Table, Space, message, Typography } from "antd";
import {
  Row,
  Col,
  Menu,
  Button,
  Input,
  Upload,
  Form,
  Divider,
  Switch,
  Tooltip,
  Checkbox,
  Tree,
  Layout,
  Table, Space, message, Typography
} from 'antd';
import { DownOutlined, FormOutlined, DeleteOutlined, FolderOutlined, FolderOpenOutlined, FireOutlined } from '@ant-design/icons';
import { useAntdTable } from 'ahooks';
import Uploadbutton from '@/components/UploadFileButton';
import UploadMultibutton from '@/components/UploadMultiFileButton';
import Confirm from '@/components/Confirm';
import { getLocaleDesc } from '@/utils/common';
import AddTags from './addTags';
import InfoButton from './editInfo';

const { Sider, Content } = Layout;
const { DirectoryTree } = Tree;

export default function FileManage() {
  const { Title, Text, Paragraph } = Typography;
  const [tData, setTData] = useState([])
  const [loading, setLoading] = useState(false)
  const [loading2, setLoading2] = useState(false)

  const [form] = Form.useForm();
  const doSearch = (value) =>{
    // getHistory(value)
    const t = value ? value.trim(): '';
    getMyFiles(t)
  }
  const baseClumn = [
    {
      title: getLocaleDesc('file_search'),
      dataIndex: 'file_name',
      key: 'file_name',
    },
    {
      title: getLocaleDesc('book_name'),
      dataIndex: 'book_name',
      key: 'book_name',
    },
    {
      title: getLocaleDesc('author'),
      dataIndex: 'author',
      key: 'author',
    },
    {
      title: getLocaleDesc('version'),
      dataIndex: 'version',
      key: 'version',
    },
    {
      title: getLocaleDesc('tags'),
      dataIndex: 'tags',
      key: 'tags',
      width: '200px',
      render:(value,record,index) => {
        return <AddTags uid={record.id} tags={value} onChange={onTagsChange} />
      }
    },
    // {
    //   title: getLocaleDesc('file_check'),
    //   dataIndex: 'is_check',
    //   key: 'is_check',
    //   render: (value,record,index) => {
    //     return  <a href='#' onClick={(e)=>doCheck(e,record)} > {value ? getLocaleDesc('yes'): getLocaleDesc('no')}</a>
    //   },
    // },
  ];

  const onTagsChange = (tags,id)=>{
    request({url:'/file',method:'patch',data:{file_id:id,tags}}).then(res=>{
      // console.log(res)
      message.success(getLocaleDesc(res.msg));

      const newData = [...tData];
      const index = newData.findIndex(item => item.id === id);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          tags
        });
        setTData(newData);
      }
    })
  }


  const doCheck = (e,r)=>{
    // console.log(r)
    if(e){
      e.preventDefault()
    }
    doCheck2(r)
  }

  function doCheck2(r,cb){
    return request({url:'/file',method:'patch',data:{file_id:r.id,is_check:!r.is_check}}).then(res=>{
      // console.log(res)
      message.success(getLocaleDesc(res.msg));
      if(cb){
        cb()
      }else{
        const newData = [...tData];
        const index = newData.findIndex(item => item.id === r.id);
        if (index > -1) {
          const item = newData[index];
          newData.splice(index, 1, {
            ...item,
            is_check: !item.is_check
          });
          setTData(newData);
        }
      }
    })
  }

  // 批量校验
  const onCheck = async () => {
    console.log(selCheckFiles)

    const tmp = selCheckFiles.filter(item=>item.is_check===false)
    if(tmp.length > 0){
      setLoading2(true)
      /* eslint-disable no-await-in-loop */
      for(let i=0 ; i< tmp.length; i++){
        const item = tmp[i]
        if(i=== tmp.length-1){
          await doCheck2(item,()=>{
            setSelCheckFiles([])
            setLoading2(false)
          })
        }else{
          await doCheck2(item,()=>{

          })
        }
      }
    }
    getMyFiles()
  }

  // 目录
  const [treeData, setTreeData] = useState([

  ])

  // 选择文件名或目录
  const [selData, setSelData] = useState([])
  // 选择删除文件
  const [selFiles, setSelFiles] = useState([])
  // 选择校对文件
  const [selCheckFiles, setSelCheckFiles] = useState([])
  // 展开目录
  const [expandedKeys, setExpandedKeys] = useState([])

  const onExpand = (expandedKeys)=>{
    setExpandedKeys(expandedKeys)
  }
  // 提示弹窗
  const [v, sv] = useState(false);
  const onDel = (r) => {
    setSelFiles(r.id)
    sv(true);
  };
  const onCancel = () => {
    sv(false);
  };

  const onSelect = (selectedKeys, info) => {
    // console.log('selected', selectedKeys,info);
    if(selData.length>0 && selData[0] === selectedKeys[0]){
      return
    }
    setSelData(selectedKeys)
  };

  const columns = [
    ...baseClumn,
    {
      title: getLocaleDesc('action'),
      dataIndex: 'nam4',
      key: 'nam4',
      render: (text, record) => {
        return (
          <Space>
            <InfoButton uid={record.id} />
            {/*
            <Button icon={<FormOutlined />} onClick={()=>onEdit(record)} /> */}
            <Button onClick={()=>onDel(record)}>{getLocaleDesc('button_delete')}</Button>

          </Space>
        );
      },
    },
  ];

  const getMyFiles = (search) =>{
    setLoading(false)
    const path = selData.length>0 ?selData[0] :''
    request({url:'/content/file',method:'post',data:{origin:'private',path:path.substring(5),search}}).then((res)=>{
      // console.log(res)
      setTData(res.data)
      setLoading(true)
    })
  }

  const decodeTree = (title,kt,value)=>{
    const node = {
      title,
      key: kt
    }
    const children = []
    for(const key in value){
      const child = decodeTree(key,`${kt}/${key}`,value[key])
      children.push(child)
    }
    if(children.length>0)
      node.children = children
    return node;
  }

  const getMyTree = () =>{
    request({url:'/tree',params:{origin:'private'}}).then((res)=>{
      if(!isActive){
        return
      }
      const root = decodeTree(getLocaleDesc('directory'),'root',res)
      // console.log(root)
      setTreeData([root])
      setExpandedKeys(['root'])
    })
  }

  const doDel = () => {
    request({url:'/file',method:'delete',params:{file_id:selFiles}}).then((res)=>{
      // console.log(res)
      getMyFiles()
      onCancel()
    })
  };

  const onEdit = (record)=>{
    window.open(`#/edit?id=${record.id}`,'__blank')
  }

  let isActive= true
  useEffect(()=>{
    isActive= true
    getMyTree()
    return ()=>{
      isActive = false
    }
  },[])

  useEffect(()=>{
    // console.log('dir',selData)
    getMyFiles()
  },[selData])


  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      // console.log(selectedRowKeys,selectedRows)
      setSelCheckFiles(selectedRows)
    },
    selectedRowKeys:[...selCheckFiles.map(v=>v.id)]
  };

  return (
    <>

      <Row className="content  ">
        <Col  className="cpleft">
          <div className="leftbox">
            <div className="leftfiles">
              <Row className="lefttopmyfile leftpt50">
                <Col >
                  <FolderOutlined className="iconleft" /> {getLocaleDesc('file_list_title')}
                </Col>
              </Row>
              <div className="leftlist">
                <DirectoryTree
                  defaultExpandedKeys={['root']}
                  onSelect={onSelect}
                  treeData={treeData}
                  selectedKeys={selData}
                  expandedKeys={expandedKeys}
                  onExpand={onExpand}

                />
              </div>
            </div>
          </div>
        </Col>
        <Col  className="cpright">
          <Row className="mainborderfont">
            <Col span={24}>
              {/* {type === 'stat' && <Col><Checkbox onChange={onChange}>排除名单</Checkbox></Col>} */}
              <Form form={form} layout="inline" size='large'  className="fl">
                <Form.Item name="search">
                  <Input.Search
                    allowClear
                    enterButton
                    placeholder={getLocaleDesc('file_search')}
                    style={{ width: 340 }}
                    onSearch={doSearch}
                  />
                </Form.Item>
                <Form.Item>
                  <Uploadbutton url='/api/file' onSuccess={()=>getMyFiles()} prefix={selData} text={getLocaleDesc('upload_file')}/>
                </Form.Item>
                <Form.Item>
                  <Uploadbutton url='/api/file' onSuccess={getMyTree} isDir prefix={selData} text={getLocaleDesc('upload_files')}/>
                </Form.Item>
                {/* <Form.Item>
                  <Button disabled={selCheckFiles.length===0} loading={loading2} onClick={onCheck} icon={<FireOutlined />} >{getLocaleDesc('file_check')}</Button>
                </Form.Item> */}
              </Form>
            </Col>
          </Row>
          <Row className="mainborderfont">
            <Col span={24} className="pb-20  ">
              <Table
                rowSelection={{
                  type: 'checkbox',
                  ...rowSelection,
                }}
                columns={columns}
                dataSource={tData}
                rowKey="id" />
            </Col>
          </Row>
        </Col>
      </Row>

      <Confirm
        title={getLocaleDesc('file_delete_title')}
        desc={getLocaleDesc('file_delete_info')}
        visible={v}
        onCancel={onCancel}
        onConfirm={doDel}
      />
    </>
  );
}
