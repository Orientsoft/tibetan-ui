import React, { useState } from 'react';
import { Row, Col, Menu, Button, Upload, Spin } from 'antd';
import { BarChartOutlined, CopyOutlined } from '@ant-design/icons';
import { request } from 'ice';
import Uploadbutton from '@/components/UploadButton';
import { getLocaleDesc } from '@/utils/common';
import FileManage from '../comp/dirManage';
import CalcResult from '../comp/calcResult';
import Review from '../comp/review';

export default function File() {
  const [cdata, setCData] = useState([]); // 计算的任务id
  const [rdata, setRData] = useState([]); // 计算结果
  const [loading, setLoading] = useState(false)
  const onClick = () => {
  };

  const doStart = (value) =>{
    // console.log(value)
    // const ids = value.map((v)=>v.id)
    setLoading(true)
    request({url:'/file/path/work_id',method:'post',data:{...value}}).then((res)=>{
      console.log(res)
      setCData(res.data)
      setTimeout(()=>{
        // const ids = res.data.map((v)=>v.work_id)
        getStatus(res.data)
      },1*1000)
    })
  }

  const getStatus = (data) =>{
    request({url:'/work/status',method:'post',data:{ids:data}}).then((res)=>{
      // console.log(res)
      if(res.status){
        getResult(data)
      }else{
        setTimeout(()=>{
          getStatus(data)
        },3*1000)
      }
    }).catch(e=>{
    })
  }

  const getResult = (data) =>{
    request({url:'/work/result',method:'post',data:{ids:data}}).then((res)=>{

      const result = res.data.map((v,i)=>({...v,id:i,key:i}))
      setRData(result)
      // console.log(result)
      const flag = false
      setLoading(false)
    }).catch(e=>{
      setLoading(false)
    })
  }

  const [current, setCurrent] = useState('k1');
  const handleClick = (e) => {
    setCurrent(e.key);
  };

  return (
    <>
      <Row className="content">
        <Col  className=" cpleft2">
          <FileManage doStart={doStart} />
        </Col>

        {cdata.length===0 ?
          <Col className=" cpright2">
            <div className="maincontno" style={{display:'block'}}>
              <p><img src="images/nofile.png" alt=""/></p>
              <h2>{getLocaleDesc('file_select_info')}</h2>
            </div>
          </Col>
          :
          <Col className=" cpright2" >

            {!loading&&
            <div>
              <Menu onClick={handleClick} mode="horizontal" selectedKeys={[current]} className="contmuen">
                <Menu.Item key="k1" icon={<BarChartOutlined />}>
                  {getLocaleDesc('tab_calc_res')}
                </Menu.Item>
              </Menu>
              <div className="maincont">
                {current === 'k1' && <CalcResult data={rdata} cdata={cdata} />}
                {current === 'k2' && <Review data={cdata} isCalc />}
              </div>
            </div>}


            <div className="maincontno" style={{display:loading?'block':'none'}}>
              <p><img src="images/nofile.png" alt=""/></p>
              <h2>{getLocaleDesc('calc_work_wait_info')}</h2>
              <p>{getLocaleDesc('calc_work_wait_info2')}</p>
            </div>
          </Col>
        }

      </Row>
    </>
  )
}
