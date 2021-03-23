import React, { useState } from 'react';
import { Button, Form, Modal, Input, Select, Checkbox } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getLocaleDesc } from '@/utils/common';

// const layout = {
//   labelCol: { span: 4 },
//   wrapperCol: { span: 20 },
// };
const tailLayout = {
  wrapperCol: { offset: 4, span: 20 },
};
export default function ExportCalc({ onExport, colors }) {
  const [visible, sv] = useState(false);
  const [showColors] = useState(colors.map((v,i)=>({...v,value:i,valueColor:v.value})))

  const onCancel = () => {
    sv(false);
  };
  const onFinish = (values) => {
    console.log(values)
    onExport(values, onCancel);
  };

  return (
    <>
      <Button onClick={() => {
        sv(true);
      }}>{getLocaleDesc('export')}</Button>
      <Modal title={getLocaleDesc('export')} visible={visible} footer={null} onCancel={onCancel}>
        <Form
          name="basic"
          onFinish={onFinish}
          layout="vertical"
        >
          <Form.Item
            label={getLocaleDesc('work_count_color')}
            name="color"
            valuePropName="checked"
            rules={[{ required: true, message: getLocaleDesc('p_input') }]}
          >
            <Checkbox.Group>
              {showColors.map(v=>(
                <Checkbox key={v.value} value={v.value}>{v.label}</Checkbox>
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
    </>
  );
}
