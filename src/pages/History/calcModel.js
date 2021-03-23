import React, { useState, useEffect } from 'react';
import { Modal, Col, Menu, Button, Spin } from 'antd';
import { request } from 'ice';
import { getLocaleDesc } from '@/utils/common';
import CalcResult from '../Work/comp/calcResult'
import Review from '../Work/comp/review'

export default function CalcModal(props) {
  const { records } = props
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cdata, setCData] = useState([]); // 计算的任务id
  const [rdata, setRData] = useState([]); // 计算结果
  const [loading, setLoading] = useState(false)


  useEffect(()=>{
    if(isModalVisible){
      getResult()
      setCData(
        records.map(v=>({work_id:v.id,file_name:v.file_name,file_id:v.file_id}))
      )
    }
  },[isModalVisible,records])

  const getResult = () =>{
    request({url:'/work/result',method:'post',data:{ids:records.map(v=>v.id)}}).then((res)=>{

      const result = res.data.map((v,i)=>({...v,id:i,key:i}))
      setRData(result)
      // console.log(result)
      // const flag = false
      setLoading(false)
    }).catch(e=>{
      setLoading(false)
    })
  }

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
      <Button disabled={records.length===0} onClick={showModal}>{getLocaleDesc('button_view')}</Button>
      <Modal className="detailModal" title={getLocaleDesc('tab_calc_res')} visible={isModalVisible} onOk={handleCancel} onCancel={handleCancel}>
        <Col span={16} >
          <Spin spinning={loading} delay={500}>
            <Menu onClick={handleClick} mode="horizontal" selectedKeys={[current]}>
              <Menu.Item key="k1">
                {getLocaleDesc('tab_calc_res')}
              </Menu.Item>
              <Menu.Item key="k2">
                {getLocaleDesc('tab_calc_view')}
              </Menu.Item>
            </Menu>
            <div className="detailContent">
              {current === 'k1' && <CalcResult data={rdata} cdata={cdata} id={records.length>0&&records[0].file_id} />}
              {current === 'k2' && <Review data={cdata} isCalc />}
            </div>
          </Spin>
        </Col>
      </Modal>

    </>
  );
};
