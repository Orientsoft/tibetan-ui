import React, { useEffect } from 'react';
import { Button, Form, Modal, Input, Select } from 'antd';
import { getLocaleDesc, getNatureList} from '@/utils/common';

// const layout = {
//   labelCol: { span: 4 },
//   wrapperCol: { span: 20 },
// };
const tailLayout = {
  wrapperCol: { offset: 4, span: 20 },
};
export default function EditWord({ onSave, onCancel, initialValues, editKey, type, visible }) {
  const [form] = Form.useForm();
  const natureList = getNatureList();

  const onFinish = (values) => {
    onSave({ ...values, id: editKey }, onCancel);
  };
  useEffect(() => {
    if(visible){
      form.setFieldsValue(initialValues);
    }
  }, [visible, form, JSON.stringify()]);
  return (
    <>
      <Modal title={getLocaleDesc('button_modify')} visible={visible} footer={null} onCancel={onCancel}>
        <Form

          name="basic"
          onFinish={onFinish}
          form={form}
          layout="vertical"
        >
          <Form.Item
            label={type !== 'word'?getLocaleDesc('word_text'):getLocaleDesc('word_word')}
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
          {type !== 'word' && <Form.Item
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
