import React, { useState, useEffect } from 'react';
import { Row, Col, Button, Spin,
  Table,Tabs, message, Form, Input, Layout } from 'antd';
import { request, getSearchParams } from 'ice';
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
  const searchParams = getSearchParams();
  const [form] = Form.useForm();

  useEffect(()=>{
    console.log(searchParams)
    if(searchParams.type === 'find'){
      setCurrent('k2')
    }
  },[])

  const getHistory = (filename) =>{
    setLoading(true)
    request({url:'/work',method:'get',params:{work_type:current==='k1'?'stat':'new',file_name:filename}}).then((res)=>{
      console.log(res)
      setData(res.data.map(v=>({...v,key:v.id})))
      setLoading(false)
    })
  }

  const getHistorySplit = (filename) =>{
    setLoading(true)
    request({url:'/work/tokenize',method:'get',params:{search:filename}}).then((res)=>{
      console.log(res)
      setData(res.data.map(v=>({...v,key:v.id})))
      setLoading(false)
    })
  }

  const doSearch = (value) =>{
    const t = value ? value.trim(): '';
    switch(current){
      case 'k1':
      case 'k2':
        getHistory(t)
        break;
      case 'k6':
        getHistorySplit(t)
        break;
      default:
        break
    }
    // if(t){
    // }
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

  const baseClumn = [
    {
      title: getLocaleDesc('file_search'),
      dataIndex: 'file_name',
      key: 'file_name',
      render:(value,record)=>{
        return <a onClick={(e) => { e.preventDefault(); onEdit(record) }} href="" className="filename">{value}</a>
      }
    },
    {
      title: getLocaleDesc('file_check'),
      dataIndex: 'is_check',
      key: 'is_check',
      render: (value,record,index) => {
        return  <a href='#' onClick={(e)=>doCheck(e,record)} > {value ? getLocaleDesc('yes'): getLocaleDesc('no')}</a>
      },
    },
  ];
  const onEdit = (record)=>{
    window.open(`#/edit?id=${record.id}`,'_blank')
  }
  const doCheck = (e,r)=>{
    // console.log(r)
    if(e){
      e.preventDefault()
    }
    doCheck2(r)
  }

  function doCheck2(r,cb){
    return request({url:'/file',method:'patch',data:{file_id:r.id,is_check:!r.is_check}}).then(res=>{
      // console.log(res)
      message.success(getLocaleDesc(res.msg));
      if(cb){
        cb()
      }else{
        const newData = [...data];
        const index = newData.findIndex(item => item.id === r.id);
        if (index > -1) {
          const item = newData[index];
          newData.splice(index, 1, {
            ...item,
            is_check: !item.is_check
          });
          setData(newData);
        }
      }
    })
  }

  const [current, setCurrent] = useState('k1');
  const handleClick = (key) => {
    // console.log(key)
    setCurrent(key);
  };

  useEffect(()=>{
    doSearch('')
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
              <Tabs activeKey={current} onChange={handleClick}>
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
                <TabPane tab={getLocaleDesc('auto_split')} key="k6">
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
                      </Form>
                    </Col>
                  </Row>
                  <Table
                    // rowSelection={{
                    //   type: 'radio',
                    //   ...rowSelection,
                    // }}
                    columns={baseClumn}
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
