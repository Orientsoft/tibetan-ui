import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Menu, Divider,
  Button, Upload,Form,Checkbox,
  Popover,
  Input,InputNumber,Popconfirm, Typography,Table,
  Space, Select,Spin, Pagination, message, ConfigProvider } from 'antd';
import { request } from 'ice';
import Uploadbutton from '@/components/UploadButton';
import { getLocaleDesc, getNatureList, getNatureById, formatTime } from '@/utils/common';


const EditableCell = ({
  editing,
  dataIndex,
  title,
  inputType,
  record,
  index,
  children,
  ...restProps
}) => {

  if(inputType==='bool'){
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
            valuePropName="checked"
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            <Checkbox defaultChecked={record[dataIndex]} />
          </Form.Item>
        ) : (
          children
        )}
      </td>
    )
  }

  if(inputType==='select'){
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            <Select
              allowClear
              options={getNatureList()}
              placeholder={getLocaleDesc('select_info')}
            />
          </Form.Item>
        ) : (
          children
        )}
      </td>
    )
  }

  if(inputType==='select2'){
    return (
      <td {...restProps}>
        {editing ? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0,
            }}
            rules={[
              {
                required: true,
                message: `Please Input ${title}!`,
              },
            ]}
          >
            <Select
              allowClear
              placeholder={getLocaleDesc('select_info')}
            >
              {
                record.sentence.map((v,i)=>(
                  <Select.Option key={i} value={v}><div className="context-item" dangerouslySetInnerHTML={{__html: v}} /></Select.Option>
                ))
              }
            </Select>
          </Form.Item>
        ) : (
          children
        )}
      </td>
    )
  }
  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{
            margin: 0,
          }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          <Input.TextArea />
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export default function CalcResult(props) {

  const { data, editable=true } = props
  const [selData, setSelData] = useState([])
  const [rdata, setRData] = useState([]); // 计算结果
  const [pageInfo, setPageInfo] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    value:''
  })
  const [loading, setLoading] = useState(false)
  const [formSearch] = Form.useForm();

  // 编辑行
  const [form] = Form.useForm();
  const [editingKey, setEditingKey] = useState('');

  const isEditing = (record) => record.id === editingKey;
  const edit = (record) => {
    form.setFieldsValue({
      ...record,
    });
    console.log(record)
    setEditingKey(record.id);
  };
  const cancel = (e) => {
    e.preventDefault()
    setEditingKey('');
  };


  // 保存修改
  const save = async (e,id) => {
    e.preventDefault()
    try {
      const row = await form.validateFields();
      console.log('save',row,id)

      request({url:'/self/dict',method:'patch',data:{...row,id}}).then(res=>{
        message.success(getLocaleDesc(res.msg));
        const newData = [...rdata];
        const index = newData.findIndex((item) => id === item.id);

        if (index > -1) {
          const item = newData[index];
          newData.splice(index, 1, { ...item, ...row });
          setRData(newData);
          setEditingKey('');
        } else {
          newData.push(row);
          setRData(newData);
          setEditingKey('');
        }
      })

    } catch (errInfo) {
      console.log('Validate Failed:', errInfo);
    }
  };

  const columns = [
    {
      title: getLocaleDesc('words_text'),
      dataIndex: 'word',
      key: 'word',
      editable,
      width: 200,
    },
    // {
    //   title: getLocaleDesc('word_nature'),
    //   dataIndex: 'nature',
    //   key: 'nature',
    //   editable,
    //   width: 100,
    //   render:(value)=>{
    //     return getNatureById(value)
    //   }
    // },
    // {
    //   title: getLocaleDesc('word_context'),
    //   dataIndex: 'sentence',
    //   key: 'sentence',
    //   editable:false,
    //   render: (value, record) => {
    //     if(value && record.word){
    //       const showContent = value.map(v=>(v.replace(new RegExp(record.word, 'g'), `<span style="color:red">${record.word}</span>`)))
    //       return <Popover trigger="click" content={<div dangerouslySetInnerHTML = {{ __html: showContent.join('<p>') }} />} title={getLocaleDesc('word_context')}>
    //         <Button type="primary">{getLocaleDesc('button_view')}</Button>
    //       </Popover>;
    //     }

    //   }
    // },
    {
      title: getLocaleDesc('check'),
      dataIndex: 'is_check',
      key: 'is_check',
      editable,
      render: (value,record,index) => {
        if(editable){
          return  <a href='#' onClick={(e)=>doCheck(e,record)} > {value ? getLocaleDesc('yes'): getLocaleDesc('no')}</a>
        }
        return  <> {value ? getLocaleDesc('yes'): getLocaleDesc('no')}</>
      },
      width: 100,
    },
  ];
  if(editable){
    columns.push({
      title: getLocaleDesc('action'),
      dataIndex: 'id',
      key: 'id',
      render: (_, record) => {
        const isEdit = isEditing(record);
        return isEdit ? (
          <span>
            <a
              href="#"
              onClick={(e) => save(e,record.id)}
              style={{
                marginRight: 8,
              }}
            >
              {getLocaleDesc('file_edit_save_button')}
            </a>
            <a href="#" onClick={(e) => cancel(e)}>{getLocaleDesc('button_concel')}</a>
          </span>
        ) : (
          <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
            {getLocaleDesc('button_modify')}
          </Typography.Link>
        );
      },
      width: 150,
    })
  }

  useEffect(()=>{
    if(data && data.length > 0){
      getResult(pageInfo.current,pageInfo.pageSize)
    }
  },[data])

  const getResult = (page,pageSize,value) =>{
    setLoading(true)
    // const search = value || pageInfo.value
    request({url:'/work/new/result',method:'post',
      data:{ids:data.map(v=>v.work_id),page,
        limit:pageSize,search:value},
      search: value
    }
    ).then((res)=>{
      // 隐藏动画
      setLoading(false)
      const result = res.data.map((v,i)=>({...v,key:v.id}))
      // console.log(result)
      if(result.length===0){
        // 判断是否是第一页，不是就查询
        if(pageInfo.current > 1){
          getResult(pageInfo.current-1,pageInfo.pageSize)
          setPageInfo({...pageInfo,current:pageInfo.current-1})
        }else{
          setRData(result)
          setPageInfo({...pageInfo,total:res.total})
        }
      }else{
        setRData(result)
        setPageInfo({...pageInfo,total:res.total,current:page,pageSize,value})
      }
    }).catch(e=>{
      setLoading(false)
    })
  }

  const doExport = ()=>{
    request({url:'/self/dict/export',method:'post',
      data:{ids:data.map(v=>v.work_id)},
      responseType: 'arraybuffer'}).then(res=>{
      // console.log(res)
      message.success(getLocaleDesc('success'));
      const tmp = new Blob([res]);
      const reader = new FileReader();
      reader.onload = function (evt) {
        const a = document.createElement('a');
        //   a.download = `${title}代码及排名.zip`;
        a.download = `export-${formatTime(new Date())}.txt`;
        a.href = evt.target.result;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      reader.readAsDataURL(tmp);
    })
      .catch((e) => {
        console.log(e);
        message.error(getLocaleDesc('failed'));
      });
  }


  const doOpt = (opt)=>{
    request({url:'/self/dict/operator',method:'patch',data:{ids:[...selData],operator:opt}}).then(res=>{
      console.log(res)
      getResult(pageInfo.current,pageInfo.pageSize,pageInfo.value)
    })
  }
  const doSearch = (value) =>{
    console.log('doSearch',value)
    const t = value ? value.trim(): '';
    getResult(1,pageInfo.pageSize,t)
    
  }

  const onChange = (page,pageSize)=>{
    console.log('onChange',page,pageSize)
    getResult(page,pageSize)
  }

  const doCheck = (e,r)=>{
    console.log(r)
    e.preventDefault()
    request({url:'/self/dict',method:'patch',data:{id:r.id,is_check:!r.is_check}}).then(res=>{
      console.log(res)
      message.success(getLocaleDesc(res.msg));

      const newData = [...rdata];
      const index = newData.findIndex(item => item.id === r.id);
      if (index > -1) {
        const item = newData[index];
        newData.splice(index, 1, {
          ...item,
          is_check: !item.is_check
        });
        setRData(newData);
      }
    })
  }
  const rowSelection = {
    onChange: (selectedRowKeys, selectedRows) => {
      // console.log(selectedRowKeys,selectedRows)
      setSelData(selectedRowKeys)
    },
    selectedRowKeys:[...selData]
  };

  const mergedColumns = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    // console.log(col)

    let inType = 'text'
    if(col.dataIndex === 'is_check'){
      inType = 'bool'
    }
    if(col.dataIndex === 'nature'){
      inType = 'select'
    }
    if(col.dataIndex === 'context'){
      inType = 'select2'
    }
    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: inType,
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    }
  });

  function itemRender(current, type, originalElement) {
    console.log('itemRender',current,type,originalElement)
    // if (type === 'prev') {
    //   return <a>Previous</a>;
    // }
    // if (type === 'next') {
    //   return <a>Next</a>;
    // }
    // if(type==='page'){
    //   originalElement.
    // }
    return originalElement;
  }

  return (
    <>
      <Row className="toprighttextbox">
        {/* <Divider /> */}
        <Col span={24}>
          {/* {type === 'stat' && <Col><Checkbox onChange={onChange}>排除名单</Checkbox></Col>} */}
          <Form form={formSearch} layout="inline" className="fl">
            <Form.Item name="search">
              <Input.Search
                allowClear
                enterButton
                placeholder={getLocaleDesc('find_search')}
                style={{ width: 340 }}
                onSearch={doSearch}
              />
            </Form.Item>
          </Form>
          <Button onClick={()=>doOpt('1')} disabled={selData.length<1}>{getLocaleDesc('button_delete')}</Button>&nbsp;&nbsp;
          <Button onClick={()=>doOpt('2')} disabled={selData.length<1}>{getLocaleDesc('check')}</Button>&nbsp;&nbsp;
          <Button onClick={doExport}>{getLocaleDesc('export')}</Button>
        </Col>
      </Row>
      <div className="mainborderfont">
        <Form form={form} component={false}>
          <ConfigProvider locale={{Pagination:{items_per_page:''}}}>
            <Table
              rowSelection={{
                type: 'checkbox',
                ...rowSelection,
              }}
              components={{
                body: {
                  cell: EditableCell,
                },
              }}
              loading={loading}
              rowKey={r=>r.id}
              columns={mergedColumns}
              dataSource={rdata}
              pagination={{
                showSizeChanger:true,
                hideOnSinglePage:false,
                onChange,...pageInfo,
                showTotal:(total) => `${getLocaleDesc('count_all')}: ${total}`
              }}
            />
          </ConfigProvider>
        </Form>
      </div>

    </>
  );
}
