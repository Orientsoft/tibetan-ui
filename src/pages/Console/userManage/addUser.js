import React, { useState } from 'react';
import { Button, Form, Modal, Input, Checkbox } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getLocaleDesc } from '@/utils/common';

const showMenus = [
  {
    value:0,
    label: getLocaleDesc('tab_console'),
  },
  {
    value:1,
    label: getLocaleDesc('word_search'),
  },
  {
    value:2,
    label: getLocaleDesc('tab_calc'),
  },
  {
    value:3,
    label: getLocaleDesc('tab_find'),
  },
  // {
  //   value:4,
  //   label: getLocaleDesc('tab_split'),
  // },
  // {
  //   value:5,
  //   label: getLocaleDesc('tab_sort'),
  // }
];
const tailLayout = {
  wrapperCol: { offset: 4, span: 20 },
};
export default function AddUser({ onAdd }) {
  const [visible, sv] = useState(false);

  const onCancel = () => {
    sv(false);
  };
  const onFinish = (values) => {
    onAdd(values, onCancel);
  };

  return (
    <>
      <Button
        type="primary"
        size='large'
        icon={<PlusOutlined />}
        onClick={() => {
          sv(true);
        }}
      >
        {getLocaleDesc('button_add')}
      </Button>
      {
        visible && (
          <Modal title={getLocaleDesc('button_add')} visible={visible} footer={null} onCancel={onCancel}>
            <Form
              layout="vertical"
              name="basic"
              onFinish={onFinish}
            >
              <Form.Item
                label={getLocaleDesc('user_name')}
                name="username"
                rules={[
                  { required: true, message: getLocaleDesc('p_input') },
                  () => ({
                    validator(_, value) {
                      if (/^[0-9a-zA-Z]*$/g.test(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(getLocaleDesc('charnum'));
                    },
                  })
                ]}
                extra={getLocaleDesc('same_pwd')}
              >
                <Input />
              </Form.Item>

              <Form.Item
                label={getLocaleDesc('user_menu')}
                name="role"
                rules={[{ required: true, message: getLocaleDesc('select_info') }]}
              >
                <Checkbox.Group>
                  {showMenus.map(v=>(
                    <Checkbox key={v.value} value={v.value}><span>{v.label}</span></Checkbox>
                  ))}
                </Checkbox.Group>
              </Form.Item>
              <Form.Item {...tailLayout}>
                <Button type="primary" htmlType="submit">
                  {getLocaleDesc('confirm')}
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        )
      }
    </>
  );
}
