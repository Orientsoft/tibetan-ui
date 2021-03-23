import React, { useState, useEffect } from 'react';
import { Modal, Col, Menu, Button } from 'antd';
import { getLocaleDesc } from '@/utils/common';
import FindResult from '../Work/comp/findResult';
import Review from '../Work/comp/review'

export default function CalcModal(props) {
  const { record } = props
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cdata, setCData] = useState([]); // 计算的任务id

  useEffect(()=>{
    if(isModalVisible){
      setCData([{
        work_id: record.id,
        file_name: record.file_name,
        file_id: record.file_id
      }])
    }
  },[isModalVisible,record])

  const showModal = (e) => {
    if(e){
      e.preventDefault && e.preventDefault()
      e.preventBubble && e.preventBubble()
    }
    setIsModalVisible(true);
  };


  const handleCancel = () => {
    setIsModalVisible(false);
  };


  const [current, setCurrent] = useState('k1');
  const handleClick = (e) => {
    setCurrent(e.key);
  };

  //
  return (
    <>
      <Button onClick={showModal}>{getLocaleDesc('button_view')}</Button>
      <Modal className="detailModal" title={record.file_name} visible={isModalVisible} onOk={handleCancel} onCancel={handleCancel}>
        <Col span={16} >

          {/* <Menu onClick={handleClick} mode="horizontal" selectedKeys={[current]}>
            <Menu.Item key="k1">
              {getLocaleDesc('tab_find_res')}
            </Menu.Item>
            <Menu.Item key="k2">
              {getLocaleDesc('tab_find_view')}
            </Menu.Item>
          </Menu> */}
          <div className="detailContent">
            {current === 'k1' && <FindResult editable data={cdata} />}
            {current === 'k2' && <Review data={cdata} />}
          </div>
        </Col>
      </Modal>

    </>
  );
};
