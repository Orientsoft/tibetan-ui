import React, { useState } from "react";
import { Button } from "antd";
import Confirm from '@/components/Confirm';

export default function DeleteButton({ data, onDelete }) {
  const [v, sv] = useState(false);
  const onClick = () => {
    sv(true);
  };
  const onCancel = () => {
    sv(false);
  };
  const onConfirm = () => {
    onDelete(data);
  };
  return (
    <>
      <Button onClick={onClick}>删除</Button>
      <Confirm
        title="删除"
        desc="是否确认删除？"
        visible={v}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />
    </>
  );
}
