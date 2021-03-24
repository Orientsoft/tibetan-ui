import React, { useState, useEffect, useRef } from 'react';
import {  Button, Spin, message, Pagination } from 'antd';
import { request, getSearchParams } from 'ice';
import FontsizeInput from '@/components/FontsizeInput'
import { getLocaleDesc} from '@/utils/common';

export default function Edit(props) {

  const [seq, setSeq] = useState([])
  const [showContent, setShowContent] = useState([])
  const [showText, setShowText] = useState('')
  const [posIndex, setPosIndex] = useState(-1)
  const [fileName, setFileName] = useState('')
  const [loading, setLoading] = useState(false)
  const [fontSize, setFontSize] = useState(24)
  const params = getSearchParams()
  const fileId = params.id
  const seqId = params.seq
  const searchKey = params.search

  const [pageInfo, setPageInfo] = useState({
    current:1,
    total:1,
    pageSize:1,
    pageTextSize:10000*1
  })

  useEffect(()=>{
    getContent2()
  },[fileId])

  useEffect(()=>{
    if(showContent.length>0){
      showContent[pageInfo.current-1]&&setShowText(showContent[pageInfo.current-1].text)
    }
  },[pageInfo,showContent])
  useEffect(()=>{
    if(showContent.length>0){
      const seqId = seq[posIndex]
      const page = showContent.findIndex(v=>v.seq>=seqId)
      console.log('posIndex',seqId,page)
      setPageInfo({...pageInfo,current:page+1})
      setTimeout(()=>{
        setMark(posIndex)
      },1000)
    }
  },[posIndex])

  const findNext = (type)=>{
    if(type===1){
      if(posIndex >= seq.length-1){
        setPosIndex(0)
      }else{
        setPosIndex(posIndex+1)
      }
    }else if(posIndex <= 0){
      setPosIndex(seq.length-1)
    }else{
      setPosIndex(posIndex-1)
    }
  }

  const onChange = (page,pageSize)=>{
    // const str = content;
    // if(str){
    //   const constal = Math.ceil(str.length / pageInfo.pageTextSize)
    setPageInfo({...pageInfo,current:page})
    // }
  }

  const getContent2 = ()=>{
    setLoading(true)
    request({
      url:'/file/search',
      method:'post',
      data:{file_id:fileId,search:searchKey}
    }).then(res=>{
      // const content = res.data.replace(new RegExp(' ', 'g'),'');
      const regExp = new RegExp(`${searchKey}(?!([^<]+)?>)`, 'ig');// 正则表达式匹配
      // const showStr = content.substr(start,end - start)
      // console.log(start,end,showStr.length)
      // const tmp = showStr.replace(regExp, `<span class='em-normal'>${searchKey}</span>`);// 高亮操作
      const content = res.content;
      const seq = res.seq.sort((a,b)=> a - b);
      content.forEach(item=>{
        if(seq.findIndex((v)=>item.seq===v) > -1){
          item.sentence = item.sentence.replace(regExp, `<span class='em-normal'>${searchKey}</span>`);
        }
      })

      setSeq(seq)
      const tshowContent = []
      let tmpstr = ''
      let len = 0
      // 拼接展示text
      for(let i=0; i < content.length;i++){
        len += content[i].sentence.length
        tmpstr += `<span id='seq${content[i].seq}'>${content[i].sentence}</span>`
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
      setShowContent(tshowContent)
      setPageInfo({...pageInfo,total: tshowContent.length})
      setFileName(res.file_name)
      console.log(tshowContent,seq)
      const seqIndex = seq.findIndex(v=> v=== parseInt(seqId,10))
      console.log(tshowContent,seq,seqIndex)
      if(seqIndex>0){
        setPosIndex(seqIndex)
      }else{
        setPosIndex(0)
      }

      setLoading(false)
    })
  }

  const setMark = (nIndex)=>{
    // const nodeList = document.getElementsByClassName('em-normal')
    // if(nodeList.length === 0){
    //   return
    // }
    // if(nIndex < 0){
    //   nIndex = seq.length - 1
    // }
    // if(nIndex >= seq.length){
    //   nIndex = 0
    // }
    // console.log(nodeList[nIndex],nIndex)
    // nodeList[nIndex].classList.add('em-active')
    // const top = nodeList[nIndex].offsetTop
    // document.getElementById('viewId').scrollTop = top - 100
    // if(posIndex.current > -1 && nIndex !== posIndex.current){
    //   nodeList[posIndex.current]&&nodeList[posIndex.current].classList.remove('em-active')
    // }
    // posIndex.current = nIndex
    const selNodes = document.getElementsByClassName('em-active')
    if(selNodes.length>0){
      selNodes[0].classList.remove('em-active')
    }

    const sentence = document.getElementById(`seq${seq[nIndex]}`)
    console.log(seq[nIndex],sentence)
    if(sentence){
      console.log(sentence)
      // sentence.classList.add('em-normal')
      const nodeList = sentence.getElementsByClassName('em-normal')
      if(nodeList.length>0){
        nodeList[0].classList.add('em-active')
        const top = nodeList[0].offsetTop
        document.getElementById('viewId').scrollTop = top - 100
      }
    }

    document.getElementById('showIndex').innerText = `${nIndex+1}/${seq.length}`
  }

  const previous = ()=>{
    findNext(2)
  }
  const next = ()=>{
    findNext(1)
  }


  //
  return (
    <div className="editbox">
      <Spin spinning={loading} >
        <div className="topedit">
          <div className="topeditwidth">
            <span className="topfontbtn">&nbsp;<b>{fileName}</b></span>
            <Button onClick={previous}>{getLocaleDesc('prev')}</Button>
            <Button onClick={next}>{getLocaleDesc('next')}</Button>
            <span id='showIndex' />
            <FontsizeInput onChange={setFontSize} />
          </div>
          <Pagination simple defaultCurrent={1} pageSize={1} total={pageInfo.total} current={pageInfo.current} onChange={onChange} />
        </div>
        <div id='viewId' className="editContent" style={{fontSize:`${fontSize}px`}} >
          <div className="view_content" dangerouslySetInnerHTML={{__html: showText}} />
        </div>
      </Spin>

    </div>
  );
};
