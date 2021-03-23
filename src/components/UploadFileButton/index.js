import React, {useState} from 'react';
import { Upload, message, Button, Spin } from 'antd';
import { request } from 'ice'
import { FolderOutlined, FileOutlined } from '@ant-design/icons';
import { useUserData } from '@/ProviderManage/UserProvider';
import { getLocaleDesc} from '@/utils/common';
import Confirm from '../ConfirmList'

export default function Uploadbutton(props) {
  const userData = useUserData();
  const [loading, setLoading] = useState(false)
  const [resList, setReslist] = useState([])
  const [fileList, setFileList] = useState([])
  const [visible, setVisible] = useState(false)
  const { onSuccess, url, data = {}, text='', isDir=false, prefix='' } = props
  // console.log('prefix',prefix)
  // 过滤. 和 __MACOSX 的文件不上传
  const isFilter = (path)=>{
    const names = path.split('/');
    let flag = true;
    for(let i=0;i<names.length;i++){
      // 过滤.或__MACOSX开始的目录和文件,
      if(names[i][0] === '.' || names[i].indexOf('__MACOSX')>-1){
        flag = false
        break;
      }
    }
    return flag
  }

  const onData =(file) => {

    let prefixDir = ''
    if(prefix.length>0){
      prefixDir = prefix[0].substring(5)
    }
    return {
      path: file.webkitRelativePath || file.name,
      prefix_dir: prefixDir
    }
  }
  const handleStartFileUpload = async options => {
    const { onSuccess, onError, file, onProgress } = options;
    const formData = new FormData();
    formData.append('file',file)
    formData.append('path',file.webkitRelativePath || file.name)
    let prefixDir = ''
    if(prefix.length>0){
      prefixDir = prefix[0].substring(5)
    }
    formData.append('prefix_dir',prefixDir)
    const res = await request({
      url:'/file',
      method:'post',
      data: formData
    })
    return res
  };

  let count = 0
  const uploadFile = (options) => {
    setTimeout(()=>{
      const { onSuccess, onError, file, onProgress } = options;
      const res = handleStartFileUpload(options)
      file.response = res
      if(res.errors){
        file.status = 'error'
        onError(file);
      }else{
        file.status = 'done'
        onSuccess(file);
      }
    },count*200)
    count++
  }

  const action = {
    name: 'file',
    accept:'.txt,.doc,.docx',
    action: url,
    multiple: true,
    directory: isDir,
    fileList,
    headers: {
      Authorization: `Bearer ${userData.access_token}`
    },
    data:(f)=>onData(f),
    customRequest:uploadFile,
    beforeUpload:(f,fileList) => {
      setLoading(true)
      // console.log('beforeUpload',fileList.length,fileList)
      const path = f.webkitRelativePath;
      return isFilter(path);
    },
    onChange(info) {
    // console.log('onChange',info.file,info.fileList);
      if(info.fileList.length===1){
        if (info.file.status !== 'ploading') {
          console.log(info.file, info.fileList);
        }
        if (info.file.status === 'done') {
          message.success(`${info.file.name} file uploaded successfully`);
          if(onSuccess){
            onSuccess();
          }
          setLoading(false)
        } else if (info.file.status === 'error') {
          message.error(`${info.file.name} file upload failed.`);
          setLoading(false)
        }

      }else{
        const tmp = info.fileList.filter(v=>isFilter(v.originFileObj.webkitRelativePath))
        // console.log('onChange',tmp.length);
        const index= tmp.findIndex(v=>v.status !=='done' && v.status !== 'error')
        if(index < 0){
          console.log(tmp)
          const textList = tmp.map(v=>({
            name:v.originFileObj.webkitRelativePath?v.originFileObj.webkitRelativePath:v.originFileObj.name,
            status:v.status,
            id: v.uid,
            msg: v.response.errors && getLocaleDesc(v.response.errors[0].msg)
          }
          )).sort((a,b)=> {
            if(a.status > b.status){
              return -1
            }
            if(a.status < b.status){
              return 1
            }
            return 0
          })
          count = 0
          // info.fileList = []
          setReslist(textList)
          setVisible(true)
          setLoading(false)
          onSuccess()
        }
      }
    },
  };

  return (
    <Spin spinning={loading}>
      <Upload {...action} showUploadList={false}>
        <Button icon={isDir?<FolderOutlined />:<FileOutlined />} size='large' type="primary" className={isDir?'filesbtn':'filebtn'}>{text}</Button>
      </Upload>
      <Confirm visible={visible}
        onCancel={()=>setVisible(false)}
        title={getLocaleDesc('upload_file_res')}
        list={resList}
        onConfirm={()=>setVisible(false)}  />
    </Spin>
  );
}
