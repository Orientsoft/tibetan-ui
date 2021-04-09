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
  Select,
  Table, Space, message, Typography
} from 'antd';
import { FormOutlined, ProfileOutlined, FolderOutlined, FolderOpenOutlined, CloudDownloadOutlined,CloudTwoTone, FireOutlined, VerticalAlignBottomOutlined, CarryOutOutlined } from '@ant-design/icons';
import { useAntdTable } from 'ahooks';
import Uploadbutton from '@/components/UploadFileButton';
import UploadMultibutton from '@/components/UploadMultiFileButton';
import Confirm from '@/components/Confirm';
import { getLocaleDesc, formatTime } from '@/utils/common';
import AddTags from '../Files/addTags';

const { Sider, Content } = Layout;
const { DirectoryTree } = Tree;
const { Option} = Select

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
      render:(value,record)=>{
        return <a onClick={(e) => { e.preventDefault(); onEdit(record) }} href="" className="filename">{value}</a>
      }
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
        return <AddTags uid={record.id} type='split' tags={value} onChange={onTagsChange} />
      }
    },
    {
      title: getLocaleDesc('auto_split'),
      dataIndex: 'tokenize_status',
      key: 'tokenize_status',
      render:(value)=>{
        if(!value){
          return getLocaleDesc('no')
        }
        if(value === '0'){
          return getLocaleDesc('stat_1')
        }
        if(value === '1'){
          return getLocaleDesc('stat_2')
        }
        return getLocaleDesc('stat_3')
      }
    },
    {
      title: getLocaleDesc('file_check'),
      dataIndex: 'is_check',
      key: 'is_check',
      render: (value,record,index) => {
        return  <a href='#' onClick={(e)=>doCheck(e,record)} > {value ? getLocaleDesc('yes'): getLocaleDesc('no')}</a>
      },
    },
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

  // 批量分词
  const doAuto = () =>{
    setLoading(true)
    request({
      url:'/file/tokenize',
      method:'post',
      data:{file_ids:selCheckFiles.map(v=>v.id), is_async:true}
    }).then(res=>{
      message.success(getLocaleDesc(res.msg))
      setLoading(false)
      // 重新获取内容
      getMyFiles()
    })
  }

  // 批量校验
  const onCheck = async () => {
    console.log(selCheckFiles)

    const tmp = selCheckFiles.filter(item=>item.is_check===false && item.parsed !== null)
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

  const onFind = ()=>{
    setLoading(true)
    request({url:'/work',method:'post',data:{file_ids:selCheckFiles.map(v=>v.id),work_type:'new'}}).then((res)=>{
      console.log(res)
      // setCData(res.data)
      // getStatus(res.data.map(v=>(v.work_id)))
      setTimeout(()=>{
        window.open('#/history?type=find','_blank')
      },1000)
      setLoading(false)
    })
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
  const [treeType, setTreeType] = useState('private')

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
  ];

  const getMyFiles = (search) =>{
    setLoading(false)
    const path = selData.length>0 ?selData[0] :''
    request({url:'/content/file',method:'post',data:{origin:treeType,path:path.substring(5),search}}).then((res)=>{
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
    request({url:'/tree',params:{origin:treeType}}).then((res)=>{
      if(!isActive){
        return
      }
      const root = decodeTree(getLocaleDesc('directory'),'root',res)
      // console.log(root)
      setTreeData([root])
      setExpandedKeys(['root'])
      setSelData(['root'])
    })
  }


  const onEdit = (record)=>{
    window.open(`#/edit?id=${record.id}`,'_blank')
  }

  let isActive = true
  useEffect(()=>{
    // setLoadedKeys([])
    setExpandedKeys([])
    getMyTree()
    isActive = true
    return ()=>{
      isActive = false
    }
  },[treeType])

  useEffect(()=>{
    // console.log('dir',selData)
    getMyFiles()
  },[selData])


  const doExport= (type)=>{
    setLoading2(true)
    request({
      url:'/file/tokenize/export',
      method:'post',
      data:{ids:selCheckFiles.map(v=>(v.id)),type},
    }).then((res)=>{
      const tmp = new Blob([res]);
      const reader = new FileReader();
      reader.onload = function (evt) {
        const a = document.createElement('a');
        //   a.download = `${title}代码及排名.zip`;
        a.download = `export-${formatTime(new Date())}.txt`;
        a.href = evt.target.result;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      reader.readAsDataURL(tmp);
      message.success(getLocaleDesc('success'))
      setLoading2(false)
    })

  }

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      // console.log(selectedRowKeys,selectedRows)
      setSelCheckFiles(selectedRows)
    },
    selectedRowKeys:[...selCheckFiles.map(v=>v.id)]
  };

  const handleSelectChange = (value)=>{
    console.log(value)
    setTreeType(value)
  }

  return (
    <>

      <Row className="content  ">
        <Col  className="cpleft">
          <div className="leftbox">
            <div className="leftfiles">
              <Row className="lefttopmyfile leftpt50">
                <Col >
                  <Select defaultValue="private" onChange={handleSelectChange}>
                    <Option value="private"><FolderOutlined className="iconleft" />{getLocaleDesc('file_list_title')}</Option>
                    <Option value="share"><FolderOpenOutlined className="iconleft" />{getLocaleDesc('share_file_list_title')}</Option>
                  </Select>
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
                  <Button disabled={selCheckFiles.length===0} loading={loading2} onClick={doAuto} icon={<ProfileOutlined />} >{getLocaleDesc('auto_split')}</Button>
                </Form.Item>
                <Form.Item>
                  <Button disabled={selCheckFiles.length===0} loading={loading2} onClick={onCheck} icon={<CarryOutOutlined />} >{getLocaleDesc('file_check')}</Button>
                </Form.Item>
                <Form.Item>
                  <Button disabled={selCheckFiles.length===0 || selCheckFiles.filter(v=>v.is_check===false).length!==0} loading={loading2} onClick={onFind} icon={<FireOutlined />} >{getLocaleDesc('tab_find')}</Button>
                </Form.Item>
                <Form.Item>
                  <Button disabled={selCheckFiles.length===0 || selCheckFiles.filter(v=>v.is_check===false).length!==0} loading={loading2} onClick={()=>doExport('new')} icon={<VerticalAlignBottomOutlined />} >{getLocaleDesc('export_new')}</Button>
                </Form.Item>
                <Form.Item>
                  <Button disabled={selCheckFiles.length===0 || selCheckFiles.filter(v=>v.is_check===false).length!==0} loading={loading2} onClick={()=>doExport('all')} icon={<CloudDownloadOutlined />} >{getLocaleDesc('export_all')}</Button>
                </Form.Item>
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
      />
    </>
  );
}
