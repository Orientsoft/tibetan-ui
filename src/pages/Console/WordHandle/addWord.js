import React, { useState } from 'react';
import { Button, Form, Modal, Input, Select } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getLocaleDesc, getNatureList} from '@/utils/common';

// const layout = {
//   labelCol: { span: 4 },
//   wrapperCol: { span: 20 },
// };
const tailLayout = {
  wrapperCol: { offset: 4, span: 20 },
};
export default function AddWord({ onAdd, type }) {
  const [visible, sv] = useState(false);
  const natureList = getNatureList();

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
        icon={<PlusOutlined />}
        onClick={() => {
          sv(true);
        }}
      >
        {getLocaleDesc('button_add')}
      </Button>
      <Modal title={getLocaleDesc('button_add')} visible={visible} footer={null} onCancel={onCancel}>
        <Form

          name="basic"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label={getLocaleDesc('word_text')}
            name="word"
            rules={[{ required: true, message: getLocaleDesc('p_input') }]}
          >
            <Input />
          </Form.Item>

          {type !== 'word' && <Form.Item
            label={getLocaleDesc('word_nature')}
            name="nature"
            rules={[{ required: true, message: getLocaleDesc('p_input') }]}
          >
            <Select style={{ width: 120 }} options={natureList} />
          </Form.Item>}
          {type !== 'word' &&  <Form.Item
            label={getLocaleDesc('remark')}
            name="name"

          >
            <Input />
          </Form.Item>}

          {type === 'word' &&  <Form.Item
            label={getLocaleDesc('word_index')}
            name="nature"
            rules={[{ required: true, message: getLocaleDesc('p_input') }]}
          >
            <Input />
          </Form.Item>}

          {
            type === 'stat' && (
              <Form.Item
                label={getLocaleDesc('is_exclude')}
                name="is_exclude"
              >
                <Select style={{ width: 120 }} >
                  <Select.Option value="true">{getLocaleDesc('yes')}</Select.Option>
                  <Select.Option value="false">{getLocaleDesc('no')}</Select.Option>
                </Select>
              </Form.Item>
            )
          }
          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              {getLocaleDesc('confirm')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
