import React, { useState } from 'react';
import { Button, Form, Modal, Input, Select, Spin } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import { getLocaleDesc} from '@/utils/common';
import Confirm from '@/components/Confirm'

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
const tailLayout = {
  wrapperCol: { offset: 4, span: 20 },
};
export default function ClearWord({ onClear, type }) {
  const [visible, sv] = useState(false);
  const [loading, sLoading] = useState(false);

  const onCallback = () => {
    sLoading(false)
    // sv(false);
  };
  const onCancel = () => {
    sv(false);
  };
  const onFinish = () => {
    sLoading(true)
    sv(false);
    onClear(onCallback);
  };
  return (

    <>
      <Spin spinning={loading}>
        <Button
          type="primary"
          danger
          style={{marginLeft:'5px'}}
          icon={<DeleteOutlined />}
          onClick={() => {
            sv(true);
          }}
        >
          {getLocaleDesc('button_clear')}
        </Button>
      </Spin>
      <Confirm title={getLocaleDesc('file_delete_title')} onCancel={onCancel} desc={getLocaleDesc('clear_info')} onConfirm={onFinish} visible={visible} />
    </>

  );
}
