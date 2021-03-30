import React, { useState } from 'react';
import { Row, Col, Menu, Button, Upload, Spin } from 'antd';
import { request } from 'ice';
import { FileUnknownOutlined, CopyOutlined } from '@ant-design/icons';
import Uploadbutton from '@/components/UploadButton';
import { getLocaleDesc } from '@/utils/common';
import FileManage from '../comp/dirManage';
import FindResult from '../comp/findResult';
import Review from '../comp/review';

export default function FindWords() {
  const [cdata, setCData] = useState([]); // 计算的任务id
  const [loading, setLoading] = useState(false)
  const onClick = () => {
  };

  const doStart = (value) =>{
    // console.log(value)
    // const ids = value.map((v)=>v.id)
    setLoading(true)
    request({url:'/file/path/work_id',method:'post',data:{type:'new',...value}}).then((res)=>{
      console.log(res)
      setCData(res.data.map(v=>({work_id:v})))
      getStatus(res.data)
    })
  }

  const getStatus = (data) =>{
    request({url:'/work/status',method:'post',data:{ids:data}}).then((res)=>{
      console.log(res)
      if(res.status){
        setLoading(false)
      }else{
        setTimeout(()=>{
          getStatus(data)
        },3*1000)
      }
    }).catch(e=>{
    })
  }

  const [current, setCurrent] = useState('k1');
  const handleClick = (e) => {
    setCurrent(e.key);
  };

  return (
    <>
      <Row className="content">
        <Col className="cpleft2 ">
          <FileManage type='new' doStart={doStart} />
        </Col>

        {cdata.length===0?
          <Col className="cpright2" >
            <div className="maincontno" style={{display:'block'}}>
              <p><img src="images/nofile.png" alt=""/></p>
              <h2>{getLocaleDesc('file_select_info')}</h2>
            </div>
          </Col>
          :

          <Col className="cpright2" >
            {
              loading?
                <div className="maincontno" style={{display:'block'}}>
                  <p><img src="images/nofile.png" alt="" /></p>
                  <h2>{getLocaleDesc('find_work_wait_info')}</h2>
                  <p>{getLocaleDesc('calc_work_wait_info2')}</p>
                </div>
                :
                <div >
                  {/* <Menu onClick={handleClick} mode="horizontal" selectedKeys={[current]} className="contmuen">
                    <Menu.Item key="k1" icon={<FileUnknownOutlined />}>
                      {getLocaleDesc('tab_find_res')}
                    </Menu.Item>
                     <Menu.Item key="k2" icon={<CopyOutlined />}>
                      {getLocaleDesc('tab_find_view')}
                    </Menu.Item>

                  </Menu> */}
                  <div className="maincont">
                    {current === 'k1' && <FindResult data={cdata} />}
                    {current === 'k2' && <Review data={cdata} isCalc={false} />}
                  </div>
                </div>
            }
          </Col>
        }

      </Row>
    </>
  )
}
