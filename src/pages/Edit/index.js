import React, { useState, useEffect, useRef } from 'react';
import {  Button, Spin, message, Pagination, Tooltip } from 'antd';
import { request, getSearchParams } from 'ice';
import EditorJS from '@editorjs/editorjs';
import { FormOutlined, ProfileOutlined, FolderOutlined, CarryOutOutlined, ContainerOutlined, RetweetOutlined, CloudDownloadOutlined, SaveOutlined, CloudTwoTone, FireOutlined, VerticalAlignBottomOutlined } from '@ant-design/icons';
import FontsizeInput from '@/components/FontsizeInput'
import { getLocaleDesc, formatTime} from '@/utils/common';

export default function Edit(props) {

  const [contents, setContents] = useState([])
  const [newWord, setNewWord] = useState([])
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [isCheck, setIsCheck] = useState(false)
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
    // console.log(contents)
    if(contents.length>0){
      const blocks = []
      const sArrStr = contents[pageInfo.current-1].text.split(' ').map(v=>{
        if(newWord.findIndex(n=>n===v) > -1){
          return `<em>${v}</em>`
        }
        return v
      }).join(' ')
      // tmpstr += sArrStr
      blocks.push({
        type : 'paragraph',
        data : {
          text: sArrStr
        }
      })
      console.log(sArrStr)
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
      data:{file_ids:[fileId]}
    }).then(res=>{
      setLoading(false)
      // 重新获取内容
      getContent()
    })
  }

  // 保存到服务器
  const doSave = (checked=false)=>{
    setLoading(true)
    editor.current.save().then((outputData) => {

      let txt = outputData.blocks.map(block=> block.data.text).join('')
      txt = txt.replace(/&nbsp;/g,' ')
      console.log('Article data: ', txt)
      const tmpContents = [...contents]
      tmpContents[pageInfo.current-1].text = txt;

      // setLoading(false)
      // setContents(tmpContents)
      // setPageInfo({...pageInfo,current:page})
      // return
      request({
        url:'/file',
        method:'PATCH',
        data:{file_id:fileId,content: tmpContents.map(v=>v.text).join(''),is_check: checked || isCheck}
      }).then(res=>{
        if(!isCheck){
          setIsCheck(checked || isCheck)
        }
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

      let txt = outputData.blocks.map(block=> block.data.text).join('')
      txt = txt.replace(/&nbsp;/g,' ')
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
      setIsCheck(res.is_check)
      setLoading(false)
      const content = res.content
      const tshowContent = []
      setNewWord(res.new_word)
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

  const doExport= (type)=>{
    setLoading(true)
    request({
      url:'/file/tokenize/export',
      method:'post',
      data:{ids:[fileId],type},
    }).then((res)=>{
      console.log(res)
      // return
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
      message.success(getLocaleDesc('success'))
      setLoading(false)
    }).catch(e=>{
      setLoading(false)
    })

  }

  //
  return (
    <div className="editbox">
      <Spin spinning={loading} >
        <div className="topedit">
          <div className="topeditwidth" >
            <span className="topfontbtn">
              {isCheck ?
                <Tooltip title={`${getLocaleDesc('checked')}`} color='#52c41a' ><span className='file-checked' >{getLocaleDesc('checked')}</span></Tooltip>
                :
                <Tooltip title={`${getLocaleDesc('un_check')}`} color="#ff982a"><span className='file-unchecked' >{getLocaleDesc('un_check')}</span></Tooltip>
              }
              <Tooltip title={fileName} ><b>{fileName}</b></Tooltip>
            </span>
            <FontsizeInput onChange={setFontSize} />
          </div>
          <div className="topeditwidth">
            <Pagination simple defaultCurrent={1} pageSize={1} total={pageInfo.total} current={pageInfo.current} onChange={onChange} className="pagetop" />
            <Button onClick={() => doSave()} type="primary" className="savebtn" ><SaveOutlined /> {getLocaleDesc('file_edit_save_button')}</Button>
            <Button onClick={() => getContent(true)} type="button" className="savebtn"><RetweetOutlined /> {getLocaleDesc('edit_origin')}</Button>
            <Button onClick={() => doSave(true)} type="button" className="savebtn"><CarryOutOutlined /> {getLocaleDesc('file_check')}</Button>
            <Button onClick={doAuto} type="button" className="savebtn"><ContainerOutlined /> {getLocaleDesc('auto_split')}</Button>
            <Button disabled={!isCheck} loading={loading} type="button" className="savebtn" onClick={() => doExport('new')}><VerticalAlignBottomOutlined />{getLocaleDesc('export_new')}</Button>
            <Button disabled={!isCheck} loading={loading} type="button" className="savebtn" onClick={() => doExport('all')}><CloudDownloadOutlined /> {getLocaleDesc('export_all')}</Button>
          </div>


        </div>
        <div id={fileId} className="editContent" style={{fontSize:`${fontSize}px`}} />
      </Spin>
    </div>
  );
};
