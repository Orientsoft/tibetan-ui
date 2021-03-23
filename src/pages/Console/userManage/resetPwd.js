import React, { useState } from 'react';
import { request } from 'ice';
import { Button, message, Modal, Input, Form } from 'antd';
import { getLocaleDesc} from '@/utils/common';

export default function ResetButton({ uid }) {
  const [v, sv] = useState(false);
  const onClick = () => {
    sv(true);
  };
  const onCancel = () => {
    sv(false);
  };
  const onConfirm = (va) => {
    request({ url: '/reset_password', params: { user_id: uid, new_pass: va.new_pass } })
      .then((r) => {
        message.success(getLocaleDesc(r.msg));
        sv(false);
      });
  };
  return (
    <>
      <Button onClick={onClick}>{getLocaleDesc('user_password_reset')}</Button>
      <Modal title={getLocaleDesc('user_password_reset')} visible={v} footer={null} onCancel={onCancel}>
        <Form onFinish={onConfirm} layout="vertical">
          <Form.Item
            label={getLocaleDesc('user_password_new')}
            name="new_pass"
            rules={[{ required: true, message: getLocaleDesc('p_input') }]}
          >
            <Input.Password
              size="large"
              placeholder={getLocaleDesc('user_password_new')}
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
