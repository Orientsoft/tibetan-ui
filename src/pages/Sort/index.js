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
import Uploadbutton from '@/components/UploadButton';
import UploadMultibutton from '@/components/UploadMultiFileButton';
import Confirm from '@/components/Confirm';
import { getLocaleDesc } from '@/utils/common';

const { Sider, Content } = Layout;

export default function FileManage() {
  const [tData, setTData] = useState([])
  const [loading, setLoading] = useState(false)

  const [form] = Form.useForm();

  const doExport= ()=>{

  }

  function copyToClipboard(txt) {
    console.log(txt)
    if (window.clipboardData) {
      window.clipboardData.clearData();
      window.clipboardData.setData('Text', txt);
      message.success('复制成功！');
    } else if (navigator.userAgent.indexOf('Opera') !== -1) {
      window.location = txt;
    } else if (window.netscape) {
      try {
        window.netscape.security.PrivilegeManager.enablePrivilege('UniversalXPConnect');
      } catch (e) {
        alert('被浏览器拒绝！\n请在浏览器地址栏输入\'about:config\'并回车\n然后将 \'signed.applets.codebase_principal_support\'设置为\'true\'');
      }
      const clip = window.Components.classes['@mozilla.org/widget/clipboard;1'].createInstance(window.Components.interfaces.nsIClipboard);
      if (!clip)
        return;
      const trans = window.Components.classes['@mozilla.org/widget/transferable;1'].createInstance(window.Components.interfaces.nsITransferable);
      if (!trans)
        return;
      trans.addDataFlavor('text/unicode');
      let str = {};
      const len = {};
      str = window.Components.classes['@mozilla.org/supports-string;1'].createInstance(window.Components.interfaces.nsISupportsString);
      const copytext = txt;
      str.data = copytext;
      trans.setTransferData('text/unicode', str, copytext.length * 2);
      const clipid = window.Components.interfaces.nsIClipboard;
      console.log(clip,clipid)
      if (!clipid)
        return false;
      clip.setData(trans, null, clipid.kGlobalClipboard);
      message.success('复制成功！');
    }
  }

  const doCopy= ()=>{
    copyToClipboard('124')
  }

  return (
    <>
      <Row className="content  ">
        <Col span="12" className="cpleft" >
          <Row className="mainborderfont">
            <Col span={24}>
              <Form layout="inline" size='large'  className="fl">
                <Form.Item>
                  <Uploadbutton
                    className="upploadleft"
                    size='large'
                    url="/api/word/stat/dict/batch"
                    data={{  }}
                    onSuccess={() => {
                      // search.reset();
                    }}
                  />
                </Form.Item>
                <Form.Item>
                  <Button type='primary' onClick={doExport}>{getLocaleDesc('sort_btn')}</Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <Row className="mainborderfont">
            <Input.TextArea />
          </Row>
        </Col>
        <Col span="12" className="cpright" >
          <Row className="mainborderfont">
            <Col span={24}>
              <Form layout="inline" size='large'  className="fl">
                <Form.Item>
                  <Button type='primary' onClick={doExport}>{getLocaleDesc('export')}</Button>
                </Form.Item>
                <Form.Item>
                  <Button type='primary' onClick={doCopy}>{getLocaleDesc('copy_btn')}</Button>
                </Form.Item>
              </Form>
            </Col>
          </Row>
          <Row className="mainborderfont">
            <Input.TextArea />
          </Row>
        </Col>
      </Row>

    </>
  );
}
