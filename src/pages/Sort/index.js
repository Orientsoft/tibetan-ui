import React, { useState, useEffect } from 'react';
import { request } from 'ice';
import moment from 'moment';
import {
  Row,
  Col,
  Button,
  Input,
  Upload,
  Form,
  Divider,
  Switch,
  Layout,
  message
} from 'antd';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { CopyOutlined, CloudDownloadOutlined, SortAscendingOutlined  } from '@ant-design/icons';
import Uploadbutton from '@/components/UploadButton';
import UploadMultibutton from '@/components/UploadMultiFileButton';
import Confirm from '@/components/Confirm';
import { getLocaleDesc, formatTime } from '@/utils/common';

const { Sider, Content } = Layout;

export default function FileManage() {
  const [srcValue, setSrcValue] = useState('')
  const [sortValue, setSortValue] = useState('')
  const [unSortValue, setUnSortValue] = useState('')
  const [loading, setLoading] = useState(false)

  const [form] = Form.useForm();

  const doExport= ()=>{
    const tmp = new Blob([sortValue]);
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
    message.success(getLocaleDesc('success'))
  }

  const doSort = ()=>{
    setSortValue('')
    setUnSortValue('')
    setLoading(true)
    request({url:'/word/sort',method:'post',
      data:{content:srcValue.split('\n')}
    }
    ).then((res)=>{
      setLoading(false)
      console.log(res)
      setUnSortValue(res.fail.join('\n'))
      setSortValue(res.success.join('\n'))
    })
  }

  const onChange = ({ target: { value } })=>{
    setSortValue(value)
  }

  const onChange2 = ({ target: { value } })=>{
    setSrcValue(value)
  }

  return (
    <>
      <Row className="content  ">
        <Col span="12" className="cpleft" >
          <Row className="mainborderfont">
            <Col span={24}>
              <div className="fl sorptit">
                {getLocaleDesc('sort_src')}
              </div>
              <Form layout="inline" size='large'  className="fr">
                <Form.Item>
                  <Uploadbutton
                    className="upploadleft"
                    size='large'
                    url="/api/file/once"
                    data={{  }}
                    onSuccess={(res) => {
                      console.log('onSuccess',res.data)
                      setSrcValue(res.data)
                      // search.reset();
                    }}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type='primary' danger loading={loading} onClick={doSort}><SortAscendingOutlined /> {getLocaleDesc('sort_btn')}</Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <Row className="mainborderfont">
            <Input.TextArea value={srcValue} onChange={onChange2} />
          </Row>
        </Col>
        <Col span="12" className="cpright" >
          <Row className="mainborderfont">
            <Col span={24}>
              <div  className="fl sorptit">
                {getLocaleDesc('sort_res')}
              </div>
              <Form layout="inline" size='large'  className="fr">
                <Form.Item>
                  <Button type='primary' onClick={doExport}><CloudDownloadOutlined /> {getLocaleDesc('export')}</Button>
                </Form.Item>
                <Form.Item>
                  <CopyToClipboard text={sortValue}
                  	          onCopy={() => message.success(getLocaleDesc('success'))}>
                    <Button id='copy' type='primary' danger><CopyOutlined /> {getLocaleDesc('copy_btn')}</Button>
                  </CopyToClipboard>
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <Row className="mainborderfont">
            <Input.TextArea value={sortValue} onChange={onChange}/>
          </Row>
          <div className="fail mainborderfont">
            <div className="failtit">{getLocaleDesc('sort_fail')}</div>
            <Input.TextArea value={unSortValue} />
          </div>
        </Col>
      </Row>

    </>
  );
}
