import React, { useState } from 'react';
import { request } from 'ice';
import { Button, message, Modal, Input, Form } from 'antd';
import { LockOutlined } from '@ant-design/icons';
import { getLocaleDesc } from '@/utils/common';

export default function EditInfo({ uid }) {
  const [v, sv] = useState(false);
  const onClick = () => {
    sv(true);
  };
  const onCancel = () => {
    sv(false);
  };
  const onConfirm = (va) => {
    request({ url: '/file', method:'patch',data: {...va, file_id: uid } }).then((res) => {
      message.success(getLocaleDesc(res.msg));
      sv(false);
    });
  };
  return (
    <>
      <Button onClick={onClick}>{getLocaleDesc('button_modify')}</Button>
      <Modal title={getLocaleDesc('button_modify')} visible={v} footer={null} onCancel={onCancel}>
        <Form 
          layout="vertical"
          onFinish={onConfirm}>
          <Form.Item
            label={getLocaleDesc('book_name')}
            name="book_name"
            rules={[]}
          >
            <Input
              placeholder={getLocaleDesc('book_name')}
            />
          </Form.Item>
          <Form.Item
            label={getLocaleDesc('author')}
            name="author"
            rules={[]}
          >
            <Input
              placeholder={getLocaleDesc('author')}
            />
          </Form.Item>
          <Form.Item
            label={getLocaleDesc('version')}
            name="version"
            rules={[]}
          >
            <Input
              placeholder={getLocaleDesc('version')}
            />
          </Form.Item>

          <Form.Item>
            <Button htmlType="submit" type="primary">
              {getLocaleDesc('confirm')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
