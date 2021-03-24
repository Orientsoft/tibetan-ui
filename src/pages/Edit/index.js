import React, { useState, useEffect, useRef } from 'react';
import {  Button, Spin, message, Pagination } from 'antd';
import { request, getSearchParams } from 'ice';
import EditorJS from '@editorjs/editorjs';
import { FormOutlined, ProfileOutlined, FolderOutlined, CloudDownloadOutlined,CloudTwoTone, FireOutlined } from '@ant-design/icons';
import FontsizeInput from '@/components/FontsizeInput'
import { getLocaleDesc, formatTime} from '@/utils/common';

export default function Edit(props) {

  const [contents, setContents] = useState([])
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [fontSize, setFontSize] = useState(24)
  const editor = useRef()
  const params = getSearchParams()
  const fileId = params.id
  const [pageInfo, setPageInfo] = useState({
    current:1,
    total:1,
    pageSize:1,
    pageTextSize:3000*1
  })

  useEffect(()=>{
    getContent()
  },[fileId])

  useEffect(()=>{
    console.log(contents)
    if(contents.length>0){
      const blocks = []
      blocks.push({
        type : 'paragraph',
        data : {
          text: contents[pageInfo.current-1].text
        }
      })
      // const parr = res.data.split('\r\n')
      // contents.forEach(v=>{
      //   // if(blocks.length < 599)
      // })
      if(editor.current){
        editor.current.clear && editor.current.clear()
        // 重绘
        editor.current.render({
          blocks
        })
      }else{
        // console.log('blocks',parr,blocks)
        editor.current = new EditorJS({
          holder: fileId,
          inlineToolbar:[],
          onReady: () => {
            console.log('Editor.js is ready to work!')
          },
          data:{
            blocks
          }
        });
      }
    }
  },[pageInfo])

  const doAuto = () =>{
    setLoading(true)
    request({
      url:'/file/tokenize',
      method:'post',
      params:{file_id:[fileId]}
    }).then(res=>{
      setLoading(false)
      // 重新获取内容
      getContent()
    })
  }

  // 保存到服务器
  const doSave = (isCheck=false)=>{
    setLoading(true)
    editor.current.save().then((outputData) => {

      const txt = outputData.blocks.map(block=> block.data.text).join('')
      // txt = txt.replace('/&nbsp;/g',' ')
      console.log('Article data: ', outputData)
      const tmpContents = [...contents]
      tmpContents[pageInfo.current-1].text = txt;
      // setContents(tmpContents)
      // setPageInfo({...pageInfo,current:page})
      request({
        url:'/file',
        method:'PATCH',
        data:{file_id:fileId,content: tmpContents.map(v=>v.text).join(''),is_check: isCheck}
      }).then(res=>{
        setLoading(false)
        message.success(getLocaleDesc(res.msg),1.5);
      })
    }).catch((error) => {
      console.log('Saving failed: ', error)
      setLoading(false)
    });

  }
  // 保存当前页内容
  const editSave = (page)=>{
    setLoading(true)
    editor.current.save().then((outputData) => {

      const txt = outputData.blocks.map(block=> block.data.text).join('')
      // txt = txt.replace('/&nbsp;/g',' ')
      console.log('Article data: ', outputData)
      const tmpContents = [...contents]
      tmpContents[pageInfo.current-1].text = txt;
      setContents(tmpContents)
      setPageInfo({...pageInfo,current:page})
      setLoading(false)
    }).catch((error) => {
      console.log('Saving failed: ', error)
      setLoading(false)
    });
  }

  const getContent = (is_origin=false)=>{
    setLoading(true)
    request({
      url:'/file/content',
      params:{file_id:fileId,is_origin}
    }).then(res=>{
      setFileName(res.file_name)
      setLoading(false)
      const content = res.content
      const tshowContent = []
      let tmpstr = ''
      let len = 0
      // 拼接展示text
      for(let i=0; i < content.length;i++){
        len += content[i].sentence.length
        // tmpstr += `<span id='seq${content[i].seq}'>${content[i].sentence}</span>`
        tmpstr += content[i].sentence
        if(content[i].sentence.length > pageInfo.pageTextSize*5){
          console.log('sentence',content[i].sentence.length)
          console.log(content[i].sentence)
          message.error(getLocaleDesc('word_error'))
          setLoading(false)
          return ;
        }
        if(len >= pageInfo.pageTextSize || i=== content.length-1){
          tshowContent.push({
            seq:content[i].seq,
            text:tmpstr
          })
          tmpstr = ''
          len = 0
        }
      }
      setContents(tshowContent)
      setPageInfo({...pageInfo,total: tshowContent.length})
    })
  }

  const onChange = (page,pageSize)=>{
    editSave(page)

  }

  const doExport = (values,onCancel)=>{
    console.log(values)
    request({url:'/work/result/export',method:'post',
      data:{...values},
      responseType: 'arraybuffer'}).then(res=>{
      // console.log(res)
      message.success(getLocaleDesc('success'));
      const tmp = new Blob([res]);
      const reader = new FileReader();
      reader.onload = function (evt) {
        const a = document.createElement('a');
        //   a.download = `${title}代码及排名.zip`;
        a.download = `export-count-${formatTime(new Date())}.txt`;
        a.href = evt.target.result;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      };
      reader.readAsDataURL(tmp);
      onCancel && onCancel()
    })
      .catch((e) => {
        console.log(e);
        message.error(getLocaleDesc('failed'));
      });

  }

  //
  return (
    <div className="editbox">
      <Spin spinning={loading} >
        <div className="topedit">
          <div className="topeditwidth">
            <span className="topfontbtn">&nbsp;<b>{fileName}</b></span>
            <Button onClick={()=>doSave()} type="primary" className="savebtn">{getLocaleDesc('file_edit_save_button')}</Button>
            <Button onClick={()=>getContent(true)} type="primary" className="savebtn">{getLocaleDesc('edit_origin')}</Button>
            <Button onClick={()=>doSave(true)} type="primary" className="savebtn">{getLocaleDesc('file_check')}</Button>
            <Button onClick={doAuto} type="primary" className="savebtn">{getLocaleDesc('auto_split')}</Button>
            <Button loading={loading} type="primary" className="savebtn" onClick={doExport}>{getLocaleDesc('export_new')}</Button>
            <Button loading={loading} type="primary" className="savebtn" onClick={doExport}>{getLocaleDesc('export_all')}</Button>
            <FontsizeInput onChange={setFontSize} />
          </div>
          <Pagination simple defaultCurrent={1} pageSize={1} total={pageInfo.total} current={pageInfo.current} onChange={onChange} />
        </div>
        <div id={fileId} className="editContent" style={{fontSize:`${fontSize}px`}} />
      </Spin>
    </div>
  );
};
