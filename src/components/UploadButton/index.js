import React, {useState} from 'react';
import { Upload, message, Button, Spin } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useUserData } from '@/ProviderManage/UserProvider';
import { getLocaleDesc} from '@/utils/common';

export default function Uploadbutton(props) {
  const userData = useUserData();
  const [loading, setLoading] = useState(false)
  const { onSuccess, url, data = {} } = props
  const action = {
    name: 'file',
    action: url,
    multiple: true,
    headers: {
      Authorization: `Bearer ${userData.access_token}`
    },
    data,
    onChange(info) {
      if (info.file.status !== 'ploading') {
        console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`);
        if(onSuccess){
          onSuccess();
        }
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
      if(!loading){
        setLoading(true)
      }
      console.log('onChange',info.fileList);
      const index= info.fileList.findIndex(v=>v.status !=='done' && v.status !== 'error')
      if(index < 0){
        setLoading(false)
      }
    },
  };

  return (
    <Spin spinning={loading}>
      <Upload {...action} showUploadList={false}>
        <Button icon={<UploadOutlined />} size='' type="primary" >{getLocaleDesc('upload_file')}</Button>
      </Upload>
    </Spin>
  );
}
