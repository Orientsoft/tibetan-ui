import React, { useState } from "react";
import { Row, Col, Modal, Button } from "antd";
import { getLocaleDesc} from '@/utils/common';

export default function Confirm({ visible, onCancel, title, desc, onConfirm }) {
  return (
    <Modal title={title} visible={visible} footer={null} onCancel={onCancel}>
      <div className="pt-10 text-center pb-20">{desc}</div>
      <div className=" text-right"><Button type="primary" onClick={onConfirm} >
        {getLocaleDesc('confirm')}</Button>
      </div>
      
    </Modal>
  );
}
