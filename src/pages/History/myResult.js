import React, { useState, useEffect } from 'react';
import { Row, Col, Button,Form,Checkbox, Input, Typography,Table,Spin, message } from 'antd';
import { request } from 'ice';
import { getLocaleDesc, getNatureById, formatTime } from '@/utils/common';

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

  const inputNode = inputType === 'bool' ? <Checkbox defaultChecked={record[dataIndex]} /> : <Input.TextArea />;
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
            {inputNode}
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
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

export default function MyResult(props) {

  const { editable=true } = props
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

      request({url:'/self/dict',method:'patch',data:{...row,id}})
        .then(res=>{
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
    },
    // {
    //   title: getLocaleDesc('word_nature'),
    //   dataIndex: 'nature',
    //   key: 'nature',
    //   editable,
    //   render:(value)=>{
    //     return getNatureById(value)
    //   }
    // },
    {
      title: getLocaleDesc('file'),
      dataIndex: 'file_name',
      key: 'file_name',
      width: 200,
      editable,
    },
    {
      title: getLocaleDesc('time'),
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      // width: 450,
      // editable,
      render:(value)=>{
        return formatTime(value)
      }
    },
    // {
    //   title: '校验',
    //   dataIndex: 'is_check',
    //   key: 'is_check',
    //   editable,
    //   render: (value,record,index) => {
    //     if(editable){
    //       return  <a href='#' onClick={(e)=>doCheck(e,record)} > {value ? '是': '否'}</a>
    //     }
    //     return  <> {value ? '是': '否'}</>
    //   },
    //   width: 150,
    // },
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
    getResult(pageInfo.current,pageInfo.pageSize)
  },[])

  const getResult = (page,pageSize,value) =>{
    setLoading(true)
    const search = value || pageInfo.value
    request({url:'/self/dict',method:'get',
      params:{page,
        is_check:true,
        limit:pageSize,
        search},
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
        setPageInfo({...pageInfo,total:res.total,current:page,pageSize,value:search})
      }
    }).catch(e=>{
      setLoading(false)
    })
  }

  const doDel = ()=>{
    request({url:'/self/dict/operator',method:'patch',data:{ids:[...selData],operator:'1'}}).then(res=>{
      console.log(res)
      getResult(pageInfo.current,pageInfo.pageSize)
    })
  }

  // 需要接口
  const doExport = ()=>{
    request({url:'/my/self/dict/export',method:'post',
      data:{},
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

  const doSearch = (value) =>{
    console.log('doSearch',value)
    const t = value ? value.trim(): '';
    getResult(1,pageInfo.pageSize,t)

  }

  const onChange = (page,pageSize)=>{
    console.log('onChange',page,pageSize)
    getResult(page,pageSize)
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

    return {
      ...col,
      onCell: (record) => ({
        record,
        inputType: col.dataIndex === 'is_check' ? 'bool' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        editing: isEditing(record),
      }),
    }
  });

  return (
    <>
      <Row>
        <Col span={24} className="pb-20  ">
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
            <Form.Item>
              <Button onClick={doDel} disabled={selData.length<1}>{getLocaleDesc('button_delete')}</Button>
            </Form.Item>
            <Form.Item>
              <Button onClick={doExport} >{getLocaleDesc('export_all')}</Button>
            </Form.Item>
          </Form>

        </Col>
      </Row>
      <Spin spinning={loading} delay={500}>
        <Form form={form} component={false}>
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
            rowKey={r=>r.id}
            columns={mergedColumns}
            dataSource={rdata}
            pagination={{hideOnSinglePage:false,
              onChange,...pageInfo,
              // showTotal:(total, range) => `第${range[0]}-${range[1]}行 总数:${total}`
            }}
          />
        </Form>
      </Spin>

    </>
  );
}
