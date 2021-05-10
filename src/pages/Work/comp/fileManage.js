import React, { useState, useEffect } from 'react';
import { Checkbox,Radio,Row, Col, Menu, Button, Upload,
  Input, Table, Form, Space,
  Tree,Select,
  Tooltip, message
} from 'antd';
import { CaretRightOutlined, CopyOutlined, DeleteOutlined, FolderOutlined, FolderOpenOutlined, FileTextOutlined, FileWordOutlined, FormOutlined } from '@ant-design/icons';
import { request } from 'ice';
import Uploadbutton from '@/components/UploadButton';
import { useUserData, useUserAction } from '@/ProviderManage/UserProvider';
import { formatTime, getLocaleDesc } from '@/utils/common'
import Confirm from '@/components/Confirm';
import EditModal from './editModal'

const { Option} = Select
const { DirectoryTree } = Tree;

const dataList = []
export default function FileManage(props) {

  const {type='calc', doStart} = props
  const userData = useUserData();
  const [data, setData] = useState([])
  const [selData, setSelData] = useState([])
  const [selNode, setSelNode] = useState(null)
  const [treeType, setTreeType] = useState('private')
  const [loadedKeys, setLoadedKeys] = useState([])

  const getMyTree = () =>{
    request({url:'/tree',params:{origin:treeType}}).then((res)=>{
      if(!isActive){
        return
      }
      const root = decodeTree(getLocaleDesc('directory'),'root',res)
      // console.log(root)
      setTreeData([root])
      // setExpandedKeys(['root'])
      // onLoadData(root)
    })
  }

  const decodeTree = (title,kt,value)=>{
    const node = {
      title,
      key: kt,
      isDir: true
    }
    const children = []
    for(const key in value){
      const child = decodeTree(key,`${kt}/${key}`,value[key])
      children.push(child)
      dataList.push(child)
    }
    if(children.length>0)
      node.children = children
    return node;
  }


  const [formSearch] = Form.useForm();

  const doSearch = (value) =>{
    if(!value){
      setExpandedKeys(['root'])
      return
    }
    // setExpandedKeys
    const expandedKeys = dataList
      .map(item => {
        if (item.title.indexOf(value) > -1) {
          return item.key;
        }
        return null;
      })
      .filter((item, i, self) => item !== null);
    // console.log('doSearch',expandedKeys)
    setExpandedKeys(expandedKeys)

  }

  const getParentKey = (key, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node.children) {
        if (node.children.some(item => item.key === key)) {
          parentKey = node.key;
        } else if (getParentKey(key, node.children)) {
          parentKey = getParentKey(key, node.children);
        }
      }
    }
    return parentKey;
  };

  let isActive = true
  useEffect(()=>{
    setLoadedKeys([])
    setExpandedKeys([])
    getMyTree()
    isActive = true
    return ()=>{
      isActive = false
    }
  },[treeType])

  const onStart = ()=>{
    const tmp = checkedKeys.filter(v=>v.indexOf('root')===-1)
    doStart && doStart(tmp)
    // if(type==='calc'){
    //   const tmp = checkedKeys.filter(v=>v.indexOf('root')===-1)
    //   doStart && doStart(tmp)
    //   setTimeout(()=>{
    //     // getMyFiles()
    //   },1000)
    // }else{
    //   doStart && doStart(selData)
    // }
  }

  // useEffect(()=>{
  // console.log('selData treenode',selData)
  // if(type!=='calc'){
  //   if(selData.length>0 && selData[0].indexOf('root')< 0){
  //     if(selNode && selNode.value.last_new){
  //       onStart()
  //     }
  //   }
  // }
  // },[selData])

  const getLastTime = (record)=>{
    if(type==='calc'){
      return record.last_stat? formatTime(record.last_stat) : getLocaleDesc('calc_status')
    }else{
      return record.last_new? formatTime(record.last_new) : getLocaleDesc('find_status')
    }
  }

  const onEdit = (record)=>{
    window.open(`#/edit?id=${record.id}`,'__blank')
  }

  // 目录
  const [treeData, setTreeData] = useState([])
  // 展开目录
  const [expandedKeys, setExpandedKeys] = useState([])

  const [checkedKeys, setCheckedKeys] = useState([])

  const onExpand = (expandedKeys,node)=>{
    // console.log(expandedKeys,node)
    if(node.expanded || !node.node.children){
      setExpandedKeys(expandedKeys)
    }else{
      // 关闭节点时，同时移除目录下的打开节点
      const ckeys = node.node.children.map(v=>(v.key))
      const tmp = expandedKeys.filter(ek=> ckeys.indexOf(ek) < 0 )
      setExpandedKeys(tmp)
    }
  }

  const onSelect = (selectedKeys, info) => {
    // console.log('selected', selectedKeys,info);
    setSelData(selectedKeys)
    setSelNode(info.node)
  };

  const onCheck = (checkedKeys)=>{
    console.log('onCheck',checkedKeys)
    setCheckedKeys(checkedKeys)
  }

  function updateTreeData(list, key, children) {
    // console.log(list,key)
    return list.map(node => {
      if (node.key === key) {
        let tmp = []
        if(node.children){
          tmp = [...node.children,...children]
        }else{
          tmp = children
        }
        return {
          ...node,
          children: tmp,
        };
      } else if (node.children) {
        return {
          ...node,
          children: updateTreeData(node.children, key, children),
        };
      }
      return node;
    });
  }
  const onLoad = (nloadedKeys, node)=>{
    console.log('onLoad',nloadedKeys,node)
    setLoadedKeys([...loadedKeys,...nloadedKeys])
  }

  const onLoadData = (node)=>{

    const { title, key, children, isDir} = node
    if(loadedKeys.findIndex(v=> key===v)>-1){
      return new Promise(resolve => {
        resolve();
      })
    }
    console.log('onLoadData',key)
    return new Promise(resolve => {
      if (!isDir) {
        resolve();
        return;
      }

      const path = key
      request({url:'/content/file',method:'post',data:{origin:treeType,path:path.substring(5)}}).then((res)=>{

        // setTData(res.data)
        const nchildren = res.data.map(v=>({title:v.file_name,
          key: v.id,
          // disabled: type!=='calc'&& treeType==='share'&&v.last_new==null,// 如果是共享语料库且没有新词发现
          isLeaf:true,
          isDir: false,value:v}))

        nchildren.forEach(nc=>{
          dataList.push(nc)
        })

        console.log('/content/file',res,data,nchildren)

        setTreeData(origin =>
          updateTreeData(origin, key, nchildren),
        );
        resolve();
      })
    });
  }

  const titleRender = (node)=>{
    const {title,isDir,value} = node
    if(isDir){
      return <span className="infotext">{title}</span>
    }
    return <span className="infotext">
      {title}
      <span className="infotexttime">{getLastTime(value)}</span>
    </span>
  }

  const handleSelectChange = (value)=>{
    console.log(value)
    setTreeType(value)
  }

  const btnDisable = ()=>{
    if(type==='calc'){
      return checkedKeys.filter(v=>v.indexOf('root')===-1).length===0
    }else{
      return checkedKeys.filter(v=>v.indexOf('root')===-1).length===0
    }
  }

  return (
    <>

      <div className="leftbox">
        <div className="leftfiles">
          <Row className="lefttopmy">
            <Form style={{display:'none'}} form={formSearch} layout="inline" className="fl">
              <Form.Item name="search">
                <Input.Search
                  allowClear
                  enterButton
                  placeholder={getLocaleDesc('file_search')}
                  onSearch={doSearch}
                  className="width300"
                />
              </Form.Item>
            </Form>
            <Button type='primary' style={{width:'300px',float:'right'}} disabled={btnDisable()} onClick={onStart} icon={<CaretRightOutlined />} className="mr-3 ml-3" >{getLocaleDesc('start')}</Button>
            {/* <Button type='primary' style={{width:'300px',float:'right'}} disabled={type==='calc'? checkedKeys.filter(v=>v.indexOf('root')===-1).length===0 : selData.length === 0} onClick={onStart} icon={<CaretRightOutlined />} className="mr-3 ml-3" >{getLocaleDesc('start')}</Button> */}
          </Row>
          <div className="lefttopmyfileovy">
            <Row className="lefttopmyfile">
              <Col >
                <Select defaultValue="private" onChange={handleSelectChange}>
                  <Option value="private"><FolderOutlined className="iconleft" />{getLocaleDesc('file_list_title')}</Option>
                  <Option value="share"><FolderOpenOutlined className="iconleft" />{getLocaleDesc('share_file_list_title')}</Option>
                </Select>
              </Col>
            </Row>
            <div className="leftlist">
              <DirectoryTree
                // checkable={type==='calc'}
                checkable
                loadData={onLoadData}
                onLoad={onLoad}
                loadedKeys={loadedKeys}
                onSelect={onSelect}
                treeData={treeData}
                selectedKeys={selData}
                expandedKeys={expandedKeys}
                onExpand={onExpand}
                autoExpandParent
                onCheck={onCheck}
                titleRender={titleRender}
              />

            </div>
          </div>
        </div>
      </div>
      <div className="leftup">
        <img src="images/cloud2.svg" alt="" width="40"/>
        <p className="info pt-20">
          {getLocaleDesc('upload_file_info')}
        </p>
        <a href="#" className="dl_button">{getLocaleDesc('upload_file')} </a>
      </div>

    </>
  );
}
