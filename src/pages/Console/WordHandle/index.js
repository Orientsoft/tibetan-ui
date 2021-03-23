import React, { useState, useRef } from 'react';
import {
  Row,
  Col,
  Input,
  message,
  Form,
  Typography,
  Divider,
  Switch,
  Tooltip,
  Pagination,
} from 'antd';
import { useAntdTable } from 'ahooks';
import moment from 'moment';
import { request } from 'ice';
import Uploadbutton from '@/components/UploadButton';
import { getLocaleDesc, getNatureMap} from '@/utils/common';
import AddWord from './addWord';
import ClearWord from './clearWord'
import EditWord from './editWord';

export default function WordHandle({ type, wtitle }) {
  const nmap = getNatureMap();

  const checked = useRef(false);
  const [form] = Form.useForm();
  const { Title, Text } = Typography;
  // 编辑
  const [selRecord,setSelRecord] = useState({})
  const [visible, sv] = useState(false);

  const onEdit = (record)=>{
    setSelRecord(record)
    sv(true)
  }

  const getTableData = ({ current, pageSize }, formData) => {
    console.log('formData', formData);
    const params = {
      page: current,
      limit: pageSize,
      type,
    };
    if (type === 'stat') {
      params.is_exclude = checked.current;
    }
    const t = formData.search ? formData.search.trim() : '';
    if (t) {
      params.search = t;
    }
    return request({
      url: '/word/stat/dict',
      params,
    }).then((res) => {
      const list = res.data.map((v) => ({
        ...v,
        createdAt: moment(v.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        is_exclude_desc: v.is_exclude ? '是': '否'}));
      return { total: res.total, list };
    });
  };
  const { tableProps, loading, search } = useAntdTable(getTableData, {
    defaultPageSize: 48,
    form,
  });
  console.log(tableProps);
  const onChangeSwitch = (isc) => {
    checked.current = isc;
    search.submit();
  };
  const onChangePagi = (page) => {
    console.log(page);
    tableProps.onChange( { current: page } );
  };
  const onClear = (closeModal)=>{
    request({
      url: '/word/stat/dict',
      params: { type },
      method: 'delete',
    }).then((r) => {
      message.success(getLocaleDesc(r.msg));
      closeModal();
      search.reset();
    });
  }
  const onAdd = (v, closeModal) => {
    request({
      url: '/word/stat/dict',
      data: { ...v, type },
      method: 'post',
    }).then((r) => {
      message.success(getLocaleDesc(r.msg));
      closeModal();
      search.reset();
    });
  };
  const onSave = (v, closeModal) => {
    request({
      url: '/word/stat/dict',
      data: { ...v, type },
      method: 'patch',
    }).then((r) => {
      message.success(getLocaleDesc(r.msg));
      closeModal();
      search.reset();
    });
  };

  const getTabTitle = () =>{
    return type==='word'?getLocaleDesc('word_word'):getLocaleDesc('word_text')
  }

  const getTabTitle2 = () =>{
    return type==='word'?getLocaleDesc('word_index'):getLocaleDesc('word_nature')
  }

  console.log('tableProps.pagination', tableProps.pagination)
  return (
    <>
      <Row>
        <Col span={14}>
          <Typography>
            <Title level={5}>{wtitle}</Title>
            {/* <Paragraph type="secondary">{wdesc}</Paragraph> */}
          </Typography>
        </Col>
        <Col span={10} className="text-right contop">
          <Uploadbutton
            className="upploadleft"
            size='large'
            url="/api/word/stat/dict/batch"
            data={{ type }}
            onSuccess={() => {
              search.reset();
            }}
          />
          <AddWord onAdd={onAdd} type={type} />
          <ClearWord onClear={onClear} type={type} />
        </Col>
      </Row>
      <Row>
        <Divider className="mt-0 mb-10" />
        <Col span={24} className="pb-20  ">
          <Form form={form} layout="inline" className="fl">
            <Form.Item name="search">
              <Input.Search
                allowClear
                enterButton
                placeholder={getLocaleDesc('find_search')}
                style={{ width: 340 }}
                onSearch={search.submit}
                loading={loading}
              />
            </Form.Item>
          </Form>
          {type === 'stat' && (
            <div className=" pt-5">
              <Switch
                checkedChildren={getLocaleDesc('calc_stat')}
                unCheckedChildren={getLocaleDesc('close')}
                defaultChecked={false}
                className=" mr-10"
                onChange={onChangeSwitch}
              />
              <Text type="secondary">{getLocaleDesc('calc_stat_info')}</Text>
            </div>
          )}

        </Col>
      </Row>
      <Row>
        <Col span={6} className="mb-10">
          <Tooltip>
            <Text strong className="mr-10 fs16">
              {getTabTitle()}
            </Text>
            <Text strong type="secondary">
              [{getTabTitle2()}]
            </Text>
          </Tooltip>
        </Col>
        <Col span={6} className="mb-10">
          <Tooltip>
            <Text strong className="mr-10 fs16">
              {getTabTitle()}
            </Text>
            <Text type="secondary">[{getTabTitle2()}]</Text>
          </Tooltip>
        </Col>
        <Col span={6} className="mb-10">
          <Tooltip>
            <Text strong className="mr-10 fs16">
              {getTabTitle()}
            </Text>
            <Text type="secondary">[{getTabTitle2()}]</Text>
          </Tooltip>
        </Col>
        <Col span={6} className="mb-10">
          <Tooltip>
            <Text strong className="mr-10 fs16">
              {getTabTitle()}
            </Text>
            <Text type="secondary">[{getTabTitle2()}]</Text>
          </Tooltip>
        </Col>
      </Row>
      <Divider className="mt-0 mb-10" />

      <Row className="mb-10">
        {tableProps.dataSource.map((v) => (
          <Col key={v.id} span={6} onClick={()=>onEdit(v)} className="mb-10">
            <Text strong className="mr-10 fs16">
              {v.word}
            </Text>
            <Text type="secondary"> {nmap[v.nature] || v.nature}</Text>
          </Col>
        ))}
      </Row>

      <Pagination className="mb-10 text-center" hideOnSinglePage {...tableProps.pagination} onChange={onChangePagi} showSizeChanger={false} />

      <EditWord
        editKey={selRecord.id}
        initialValues={{
          word: selRecord.word,
          nature: selRecord.nature,
          name: selRecord.name,
          is_exclude: selRecord.is_exclude,
        }}
        onSave={onSave}
        type={type}
        visible={visible}
        onCancel={()=>sv(false)}
      />
    </>
  );
}
