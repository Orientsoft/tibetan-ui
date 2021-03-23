import React, { useState, useEffect, useRef } from 'react';
import {  Button, Spin, message } from 'antd';
import { request, getSearchParams } from 'ice';
import EditorJS from '@editorjs/editorjs';
import FontsizeInput from '@/components/FontsizeInput'
import { getLocaleDesc} from '@/utils/common';

export default function Edit(props) {

  const [content, setContent] = useState('')
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [fontSize, setFontSize] = useState(24)
  const editor = useRef()
  const params = getSearchParams()
  const fileId = params.id


  const handleOk = () => {
    doSave()
  };


  useEffect(()=>{
    getContent()
  },[fileId])

  const doAuto = () =>{
    setLoading(true)
    request({
      url:'/file/tokenize',
      params:{file_id:fileId}
    }).then(res=>{
      setContent(res.data)
      setFileName(res.file_name)

      console.log(res)
      const blocks = []
      const parr = res.data.split('\r\n')
      parr.forEach(v=>{
        // if(blocks.length < 599)
        blocks.push({
          type : 'paragraph',
          data : {
            text: v
          }
        })
      })
      console.log('blocks', blocks, editor.current)
      // 清空
      editor.current.clear()
      // 重绘
      editor.current.render({
        blocks
      })
      setLoading(false)
    })
  }

  const doSave = ()=>{
    setLoading(true)
    editor.current.save().then((outputData) => {

      let txt = outputData.blocks.map(block=> block.data.text).join('\r\n')
      txt = txt.replace('/&nbsp;/g',' ')
      console.log('Article data: ', outputData,txt)
      request({
        url:'/file',
        method:'PATCH',
        data:{file_id:fileId,content: txt}
      }).then(res=>{
        setLoading(false)
        message.success(getLocaleDesc(res.msg),1.5);
      })
    }).catch((error) => {
      console.log('Saving failed: ', error)
      setLoading(false)
    });
  }

  const getContent = ()=>{
    setLoading(true)
    request({
      url:'/file/content',
      params:{file_id:fileId}
    }).then(res=>{
      setContent(res.data)
      setFileName(res.file_name)
      setLoading(false)
      console.log(res)
      const blocks = []
      const parr = res.data.split('\r\n')
      parr.forEach(v=>{
        // if(blocks.length < 599)
        blocks.push({
          type : 'paragraph',
          data : {
            text: v
          }
        })
      })
      if(editor.current){
        editor.current.clear()
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
      
    })
  }

  //
  return (
    <div className="editbox">
      <Spin spinning={loading} >
        <div className="topedit">
          <div className="topeditwidth">
            <span className="topfontbtn">&nbsp;<b>{fileName}</b></span>
            <Button onClick={doSave} type="primary" className="savebtn">{getLocaleDesc('file_edit_save_button')}</Button>
            <Button onClick={doAuto} type="primary" className="savebtn">{getLocaleDesc('auto_split')}</Button>
            <FontsizeInput onChange={setFontSize} />
          </div>
        </div>
        <div id={fileId} className="editContent" style={{fontSize:`${fontSize}px`}} />
      </Spin>

    </div>
  );
};
