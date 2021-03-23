import React, { useEffect, useReducer, useState } from 'react';
import { request } from 'ice';
import { Button, Table, Space, Form, Modal, Input } from 'antd';
import { PlusCircleOutlined, CloseOutlined } from '@ant-design/icons';
import { getLocaleDesc } from '@/utils/common';

const layout = {
  labelCol: { span: 4 },
  wrapperCol: { span: 20 },
};
const tailLayout = {
  wrapperCol: { offset: 4, span: 20 },
};
export default function AddTags({ uid,tags, onChange, type='files' }) {
  const [visible, sv] = useState(false);
  const onCancel = () => {
    sv(false);
  };
  const doDel = (v)=>{
    const newTags = tags.filter((t)=> t!==v)
    onChange(newTags,uid)
  }
  const onFinish = (values,e) => {
    // onAdd(values, onCancel);
    if(e){
      return
    }

    const t = [...tags, values.tag]
    onChange(t,uid)
    onCancel()
  };

  return (
    <>
      <div className="tag-div">
        {tags.map((v,i)=>(<span className="tag" key={i}>
          {v}
          {type==='files'&&<CloseOutlined className='tag-del' onClick={()=>doDel(v)} />}
        </span>))}

        {type==='files'&&<PlusCircleOutlined className="addtag" onClick={() => {
          sv(true);
        }} />}
      </div>

      <Modal title={getLocaleDesc('button_add')} visible={visible} footer={null} onCancel={onCancel}>
        <Form
          {...layout}
          name="basic"
          onFinish={onFinish}
        >
          <Form.Item
            label={getLocaleDesc('tags')}
            name="tag"
            rules={[{ required: true, message: getLocaleDesc('tags_error') }]}
          >
            <Input />
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
