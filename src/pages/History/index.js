import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Spin,
  Table,Tabs, message, Form, Input, Layout } from 'antd';
import { request } from 'ice';
import { formatTime, getLocaleDesc } from '@/utils/common';
import Confirm from '@/components/Confirm';
import CalcModal from './calcModel'
import FindModal from './findModel'
import MyResult from './myResult'
import CalcAll from '../Work/calcwordsall/index.js'
import FindAll from '../Work/findwordsall/index.js'

const { Content } = Layout;
const { TabPane } = Tabs;

export default function History() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false)
  const [selData, setSelData] = useState([])
  const [selRowData, setSelRowData] = useState([])
  const [form] = Form.useForm();

  const getHistory = (filename) =>{
    setLoading(true)
    request({url:'/work',method:'get',params:{work_type:current==='k1'?'stat':'new',file_name:filename}}).then((res)=>{
      console.log(res)
      setData(res.data.map(v=>({...v,key:v.id})))
      setLoading(false)
    })
  }

  const doSearch = (value) =>{
    const t = value ? value.trim(): '';
    if(t){
      getHistory(t)
    }
  }

  const [v, sv] = useState(false);
  const onDel = () => {
    sv(true);
  };
  const onCancel = () => {
    sv(false);
  };
  const doDel = () => {
    request({url:'/work',method:'delete',data:{ids:selData}}).then((res)=>{
      console.log(res)
      message.success(getLocaleDesc(res.msg))
      doSearch()
      onCancel()
    })
  };

  const columns = [
    {
      title: getLocaleDesc('file'),
      dataIndex: 'file_name',
      key: 'file_name',
    },
    {
      title: getLocaleDesc('time'),
      dataIndex: 'createdAt',
      key: 'createdAt',
      render(v){
        return formatTime(v)
      }
    },
    {
      title: getLocaleDesc('status'),
      dataIndex: 'o_status',
      key: 'o_status',
      render(v){
        if(v===0){
          return getLocaleDesc('stat_1')
        }
        if(v===1){
          return getLocaleDesc('stat_2')
        }
        if(v===2){
          return getLocaleDesc('stat_3')
        }
      }
    },
    {
      title: getLocaleDesc('action'),
      dataIndex: 'id',
      key: 'id',
      width: 250,
      render(v,r,i){
        // console.log(v,r,i)
        if(r.work_type==='stat'){
          if(r.o_status===1){
            return <CalcModal records={[r]} />
          }
        }
        if(r.work_type==='new'){
          if(r.o_status===1){
            return <FindModal record={r} />
          }
        }
      }
    }
  ];

  const [current, setCurrent] = useState('k1');
  const handleClick = (key) => {
    // console.log(key)
    setCurrent(key);
  };

  useEffect(()=>{
    if(current==='k3'){
      return
    }
    getHistory()
  },[current])

  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      // console.log(selectedRowKeys,selectedRows)
      setSelData(selectedRowKeys)
      setSelRowData(selectedRows)
    },
    selectedRowKeys:[...selData]
  };


  return (
    <>
      <Content className="p-lr-10 historyheight">
        <Row>
          <Col span={24} >
            <Spin spinning={loading} delay={500}>
              <Tabs defaultActiveKey="1" onChange={handleClick}>
                <TabPane tab={getLocaleDesc('tab_calc')} key="k1">
                  <Row>

                    <Col span={24} className="pb-20  ">
                      {/* {type === 'stat' && <Col><Checkbox onChange={onChange}>排除名单</Checkbox></Col>} */}
                      <Form form={form} layout="inline" className="fl">
                        <Form.Item name="search">
                          <Input.Search
                            allowClear
                            enterButton
                            placeholder={getLocaleDesc('file_search')}
                            style={{ width: 340 }}
                            onSearch={doSearch}
                          />
                        </Form.Item>
                        <Form.Item>
                          <Button disabled={selData.length===0} onClick={onDel}>{getLocaleDesc('button_delete')}</Button>&nbsp;
                          <CalcModal records={selRowData} />
                        </Form.Item>
                      </Form>
                    </Col>
                  </Row>
                  <Table
                    rowSelection={{
                      type: 'checkbox',
                      ...rowSelection,
                    }}
                    columns={columns}
                    dataSource={data}
                  />
                </TabPane>
                <TabPane tab={getLocaleDesc('tab_find')} key="k2">
                  <Row>
                    <Col span={24} className="pb-20  ">
                      {/* {type === 'stat' && <Col><Checkbox onChange={onChange}>排除名单</Checkbox></Col>} */}
                      <Form form={form} layout="inline" className="fl">
                        <Form.Item name="search">
                          <Input.Search
                            allowClear
                            enterButton
                            placeholder={getLocaleDesc('file_search')}
                            style={{ width: 340 }}
                            onSearch={doSearch}
                          />
                        </Form.Item>
                        <Form.Item>
                          <Button disabled={selData.length===0} onClick={onDel}>{getLocaleDesc('button_delete')}</Button>
                        </Form.Item>
                      </Form>
                    </Col>
                  </Row>
                  <Table
                    rowSelection={{
                      type: 'checkbox',
                      ...rowSelection,
                    }}
                    columns={columns}
                    dataSource={data}
                  />
                </TabPane>
                <TabPane tab={getLocaleDesc('word_list')} key="k3">
                  <MyResult />
                </TabPane>
                <TabPane tab={getLocaleDesc('tab_calc_all')} key="k4">
                  <CalcAll />
                </TabPane>
                <TabPane tab={getLocaleDesc('tab_find_all')} key="k5">
                  <FindAll />
                </TabPane>
              </Tabs>


            </Spin>
          </Col>

        </Row>
      </Content>
      <Confirm
        title={getLocaleDesc('file_delete_title')}
        desc={current==='k1'?getLocaleDesc('calc_delete_info'):getLocaleDesc('find_delete_info')}
        visible={v}
        onCancel={onCancel}
        onConfirm={doDel}
      />
    </>
  );
}
