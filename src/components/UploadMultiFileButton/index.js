import React, {useState} from 'react';
import { Upload, message, Button, Spin } from 'antd';
import { FolderOutlined, FileOutlined } from '@ant-design/icons';
import { useUserData } from '@/ProviderManage/UserProvider';
import { getLocaleDesc} from '@/utils/common';
import UploadMultiList from '../UploadMultiList'

export default function Uploadbutton(props) {
  const userData = useUserData();
  const [loading, setLoading] = useState(false)
  const [resList, setReslist] = useState([])
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
    // console.log('onData',file)
    let prefixDir = ''
    if(prefix.length>0){
      prefixDir = prefix[0].substring(5)
    }
    return {
      path: file.webkitRelativePath || file.name,
      prefix_dir: prefixDir
    }
  }

  function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve(null), ms))
  }

  // function sleep2(delay){
  //   const start = Date.now();
  //   let index
  //   while((Date.now() - start) < delay){
  //     index++
  //   }
  // }

  const action = {
    name: 'file',
    accept:'.txt,.doc,.docx',
    action: url,
    multiple: true,
    directory: isDir,
    defaultFileList:[],
    maxCount:500,
    headers: {
      Authorization: `Bearer ${userData.access_token}`
    },
    data:(f)=>onData(f),
    beforeUpload: (f,flist) => {
      // console.log('beforeUpload',f.webkitRelativePath)
      // setLoading(true)
      // try{
      //   await sleep(200)
      // }catch(e){
      //   // TODO handle the exception
      // }
      if(flist.length > 500 && f.uid === flist[0].uid){
        message.error('请选择总文件数小于500的目录');
        return false;
      }

      if(f.uid === flist[flist.length-1].uid){
        console.log('beforeUpload2',f,flist.length)
        const tmp = flist.filter(v=>isFilter(v.webkitRelativePath))
        setReslist(tmp)
        setVisible(true)
        setLoading(false)
      }
      return false;
    },
    // onChange(info) {
    //   // console.log('onChange',info.file,info.fileList);
    //   if(info.fileList.length===1){
    //     if (info.file.status !== 'ploading') {
    //       console.log(info.file, info.fileList);
    //     }
    //     if (info.file.status === 'done') {
    //       message.success(`${info.file.name} file uploaded successfully`);
    //       if(onSuccess){
    //         onSuccess();
    //       }
    //       setLoading(false)
    //     } else if (info.file.status === 'error') {
    //       message.error(`${info.file.name} file upload failed.`);
    //       setLoading(false)
    //     }

    //   }else{
    //     const tmp = info.fileList.filter(v=>isFilter(v.originFileObj.webkitRelativePath))
    //     // console.log('onChange',tmp.length);
    //     const index= tmp.findIndex(v=>v.status !=='done' && v.status !== 'error')
    //     if(index < 0){
    //       const textList = tmp.map(v=>({
    //         name:v.originFileObj.webkitRelativePath,
    //         status:v.status,
    //         id: v.uid
    //       }
    //       )).sort((a,b)=> {
    //         if(a.status > b.status){
    //           return -1
    //         }
    //         if(a.status < b.status){
    //           return 1
    //         }
    //         return 0
    //       })

    //       // info.fileList = []
    //       setReslist(textList)
    //       setVisible(true)
    //       setLoading(false)
    //       onSuccess();
    //     }
    //   }
    // },
  };

  return (
    <Spin spinning={loading}>
      <Upload {...action} showUploadList={false}>
        <Button icon={isDir?<FolderOutlined />:<FileOutlined />} size='large' type="primary" className={isDir?'filesbtn':'filebtn'}>{text}</Button>
      </Upload>
      <UploadMultiList visible={visible}
        onCancel={()=>{setVisible(false); onSuccess()}}
        title={getLocaleDesc('upload_file_res')}
        list={resList}
        prefix={prefix}
        onConfirm={()=>{setVisible(false); onSuccess()}}  />
    </Spin>
  );
}
