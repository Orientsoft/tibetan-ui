import React, { useState, useEffect } from 'react';
import { Button, Form, Modal, Checkbox, message } from 'antd';
import { getLocaleDesc } from '@/utils/common';
import { request } from 'ice'


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
  {
    value:4,
    label: getLocaleDesc('tab_split'),
  },
  {
    value:5,
    label: getLocaleDesc('tab_sort'),
  }
];
const menuCfg = {
  0: getLocaleDesc('tab_console'),
  1: getLocaleDesc('word_search'),
  2: getLocaleDesc('tab_calc'),
  3: getLocaleDesc('tab_find'),
  4: getLocaleDesc('tab_split'),
  5: getLocaleDesc('tab_sort'),
};

const tailLayout = {
  wrapperCol: { offset: 4, span: 20 },
};
export default function EditMenu({ record, onSave }) {
  const [visible, sv] = useState(false);
  const [form] = Form.useForm();
  // useEffect(() => {
  //   if(visible){
  //     console.log('record.role', record.role);
  //     form.setFieldsValue({ role: record.role });

  //   }
  // }, [visible, form, JSON.stringify(record.role)]);


  const onCancel = () => {
    sv(false);
  };
  const onFinish = (values) => {
    const role = values.role.slice().sort();
    request({ url: '/user/menu', data: { user_id:record.id, role }, method: 'post' })
      .then((r) => {
        message.success(getLocaleDesc(r.msg));
        sv(false);
        if(onSave){
          onSave();
        }
      });
  };

  console.log('edit',record.role)

  return (
    <>
      <a href="/" onClick={(e) => {
        e.preventDefault()
        sv(true);
      }}>
        {record.role.map(v => menuCfg[v]).join('/')}
        {/* {record.role.length>0? record.role.map(v=>showMenus[v-1].label).join('/'):getLocaleDesc('none')} */}
      </a>
      <Modal title={getLocaleDesc('button_modify')} visible={visible} footer={null} onCancel={onCancel}>
        <Form
          name="basic"
          onFinish={onFinish}
          layout="vertical"
          form={form}
          initialValues={{ role: record.role }}
        >
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
    </>
  );
}
