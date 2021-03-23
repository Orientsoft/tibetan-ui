import React, { useEffect, useState } from 'react';
import { Select, Row, Col, Spin, Pagination } from 'antd';
import { request } from 'ice';
import FontsizeInput from '@/components/FontsizeInput'
import { getNatureMap } from '@/utils/common';

const colorCfg = [
  {label:'红色',value:'#f00'},
  {label:'紫色',value:'#c0c'},
  {label:'蓝色',value:'#00f'},
  {label:'天蓝',value:'#09f'},
  {label:'草绿',value:'#080'},
  {label:'翠绿',value:'#0f0'},
];

const fontdata = [20, 24, 28, 32];

export default function Docreview({ data, isCalc=false }) {
  const [wid, setFid] = useState('');
  const [fontSize, setFontSize] = useState(24);
  const [txtLen, setTxtLen] = useState(10000);

  const onStep = (value) =>{
    setTxtLen(value)
  }

  const handleChange = (v) => {
    console.log('vid', v);
    setFid(v);
  };
  let defaultWid = '';
  if (data[0]) {
    defaultWid = data[0].work_id;
  }
  useEffect(() => {
    if (defaultWid && !wid) {
      setFid(defaultWid);
    }
  }, [defaultWid, wid]);
  return (
    <div >
      <Row className="toprighttextbox">
        <Col span={18}>
          {data.length>1&& <Select
            value={wid}
            style={{ width: 220 }}
            onChange={handleChange}
            notFoundContent=""
          >
            {data.map((v) => (
              <Select.Option key={v.work_id} value={v.work_id}>
                {v.file_name}
              </Select.Option>
            ))}
          </Select>}
        </Col>
        {/* <Col span={6}>
          <InputNumber onStep={onStep} onChange={setTxtLen} step={200} value={txtLen} />
        </Col> */}
        <Col span={6} style={{float:'right'}}>
          <FontsizeInput onChange={setFontSize} />
        </Col>
      </Row>
      <Doc id={wid} font={fontSize} length={txtLen} isCalc={isCalc} />
    </div>
  );
}

function Doc({ id, font, length=10000, isCalc }) {
  const [data, setData] = useState(null);
  const [dataString, setDataString] = useState('');
  const [showdata, setShowData] = useState('');
  const nmap = getNatureMap();
  const [pageInfo, setPageInfo] = useState({
    current:1,
    total:1,
    pageSize:1,
    pageTextSize:length
  })
  const [loading, setLoading] = useState(false)

  const calcShowData = ()=>{
    let start = (pageInfo.current-1) * pageInfo.pageTextSize
    let end = start + pageInfo.pageTextSize
    let index = start
    let count = 0
    while(index > 0 && count < 40){
      if(dataString[index] === ']'){
        break;
      }else if(dataString[index] === '['){
        start = index
        break;
      }
      index --
      count++
    }
    let dIndex = end
    count = 0
    while(dIndex < dataString.length && count < 40){
      if(dataString[dIndex] === ']'){
        end = dIndex+1
        break;
      }else if(dataString[dIndex] === '['){
        break;
      }
      dIndex ++;
      count++
    }
    let showStr = dataString.substr(start,end - start)
    console.log(start,end,dataString.length)
    if(isCalc){
      const len = data.result.length;
      // is_underline 加下划线
      for (let i = 0; i < len; i++) {
        // str = str.replace(new RegExp(`\\[${res.result[i].id}\\]`, 'g'),
      //     `<Tooltip title="${res.result[i].word}:${res.result[i].nature}" color={colorCfg[0]}>
      //   <Text underline>${res.result[i].word}</Text>
      // </Tooltip>`)
        const gstr = `<font color=${colorCfg[data.result[i].color].value}
          title="${data.result[i].word}:${nmap[data.result[i].nature] || data.result[i].nature} ${data.result[i].count}">${data.result[i].word}</font>`

        const gstr2 = `<font color=${colorCfg[data.result[i].color].value}
          title="${data.result[i].word}:${nmap[data.result[i].nature] || data.result[i].nature} ${data.result[i].count}"><u style='text-underline-offset: ${font*0.4}px'>${data.result[i].word}</u></font>`

        // 如果是连词，替换首先判断是否前面是[།་],如果是就不加下划线
        if(['འི','འུ','འོ'].indexOf(data.result[i].word) > -1){
          showStr = showStr.replace(new RegExp(`(?<![།་])\\[${data.result[i].id}\\]`, 'g'), gstr2)
          showStr = showStr.replace(new RegExp(`\\[${data.result[i].id}\\]`, 'g'), gstr)
        }else{
          showStr = showStr.replace(new RegExp(`\\[${data.result[i].id}\\]`, 'g'), gstr)
        }
      }
    }else{
      const len = data.result.length;
      // is_underline 加下划线
      for (let i = 0; i < len; i++) {
        // str = str.replace(new RegExp(`\\[${res.result[i].id}\\]`, 'g'),
      //     `<Tooltip title="${res.result[i].word}:${res.result[i].nature}" color={colorCfg[0]}>
      //   <Text underline>${res.result[i].word}</Text>
      // </Tooltip>`)
        let gstr = `<font color=${colorCfg[0].value}
          >${data.result[i].word}</font>`
        if(data.result[i].is_underline){
          gstr = `<font color=${colorCfg[0].value}
          ><u style='text-underline-offset: ${font*0.4}px'>${data.result[i].word}</u></font>`
        }
        showStr = showStr.replace(new RegExp(`\\[${data.result[i].id}\\]`, 'g'), gstr)
      }
    }

    setShowData(showStr)
  }

  const onChange = (page,pageSize)=>{
    const str = dataString;
    if(str){
      const constal = Math.ceil(str.length / pageInfo.pageTextSize)
      setPageInfo({...pageInfo,current:page,pageSize,total:constal})
    }
  }
  useEffect(()=>{
    if(dataString){
      const str = dataString;
      const constal = Math.ceil(str.length / length)
      setPageInfo({...pageInfo,pageTextSize:length,total:constal})
    }
  },[dataString])
  useEffect(()=>{
    if(data){
      onChange(pageInfo.current,pageInfo.pageSize)
    }
  },[data])
  useEffect(()=>{
    if(data){
      console.log(pageInfo)
      calcShowData()
    }
  },[pageInfo,font,dataString])

  useEffect(() => {
    if (!id) {
      return;
    }
    setLoading(true)
    request({
      url: '/work/review',
      params: { id },
    }).then((res) => {
      console.time('global');

      setData(res)
      if(isCalc){
        setDataString(res.content)
      }else{
        setDataString(res.content)
      }
      console.timeEnd('global');
      setLoading(false)
    }).catch((e) => {
      setLoading(false)
      console.log(e);
    });
  }, [id]);
  return (
    <div className="righttextbox">
      <Spin spinning={loading}>
        <div className="mainborderfont">
          <font
            id="doc"
            // face="Microsoft Himalaya"
            style={{ lineHeight: `${font*1.8}px`, fontSize: font }}
          >
            <div dangerouslySetInnerHTML = {{ __html: showdata }} />
          </font>
          <div className="fontpagination">
            <Pagination simple defaultCurrent={1} pageSize={1} total={pageInfo.total} current={pageInfo.current} onChange={onChange} />
          </div>
        </div>
      </Spin>
    </div>
  );
}
