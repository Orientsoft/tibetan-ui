import React, { useState, useEffect, useRef } from 'react';
import { Modal, Button, Spin, InputNumber, message } from 'antd';
import { request } from 'ice';
import EditorJS from '@editorjs/editorjs';
import FontsizeInput from '@/components/FontsizeInput'
import { FormOutlined } from '@ant-design/icons';
import { getFontSize } from '@/utils/common'



export default function EditModal(props) {
  const { file } = props
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [fontSize, setFontSize] = useState(24)
  const editor = useRef()


  const showModal = (e) => {
    if(e){
      e.preventDefault && e.preventDefault()
      e.preventBubble && e.preventBubble()
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    doSave()
    // setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  useEffect(()=>{
    if(isModalVisible){
      getContent()
    }
    if(!isModalVisible){
      editor.current && editor.current.destroy()
      editor.current = null
    }
  },[file,isModalVisible])

  const doSave = ()=>{
    editor.current.save().then((outputData) => {
      let txt = outputData.blocks.map(block=> block.data.text).join('\r\n')
      txt = txt.replace('/&nbsp;/g',' ')
      console.log('Article data: ', outputData,txt)
      request({
        url:'/file',
        method:'PATCH',
        data:{file_id:file.id,content: txt}
      }).then(res=>{
        message.success('保存成功');
        handleCancel()
      })
    }).catch((error) => {
      console.log('Saving failed: ', error)
    });
  }

  const getContent = ()=>{
    setLoading(true)
    request({
      url:'/file/content',
      params:{file_id:file.id}
    }).then(res=>{
      setContent(res.data)
      setLoading(false)
      console.log(res.data)
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
      // console.log('blocks',parr,blocks)
      editor.current = new EditorJS({
        holder: file.id,
        inlineToolbar:[],
        onReady: () => {
          console.log('Editor.js is ready to work!')
        },
        data:{
          blocks
        }
      });
    })
  }

  //
  return (
    <>
      <FormOutlined onClick={showModal} className="editicon" />

      <Modal className="editModal" title={file.file_name} visible={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <Spin spinning={loading}>
          <FontsizeInput onChange={setFontSize} />
          <div id={file.id} className="editContent" style={{fontSize:`${fontSize}px`}} />
        </Spin>
      </Modal>

    </>
  );
};
