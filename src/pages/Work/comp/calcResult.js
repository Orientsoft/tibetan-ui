import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Menu, Tooltip, Typography, Button,
  Pagination, Upload, Input, Table, Space, Select, message } from 'antd';
import { request } from 'ice';
import echarts from 'echarts';
import Uploadbutton from '@/components/UploadButton';
import { useUserData, useUserAction } from '@/ProviderManage/UserProvider';
import { getLocaleDesc, getNatureById, formatTime } from '@/utils/common';
import ExportCalc from './exportCalc'

const { Title, Text, Paragraph } = Typography;

export default function CalcResult(props) {

  const { data,cdata,id } = props
  const colors = [
    {label: getLocaleDesc('c_red'),value:'#f00'},
    {label: getLocaleDesc('c_purple'),value:'#c0c'},
    {label: getLocaleDesc('c_blue'),value:'#00f'},
    {label: getLocaleDesc('c_sky_blue'),value:'#09f'},
    {label: getLocaleDesc('c_green'),value:'#080'},
    { label: getLocaleDesc('c_orange'), value:'#ff982a'},
  ];
  // 选中颜色词列表
  const [selData, setSelData] = useState([])
  const [showData, setShowData] = useState([])
  // 选中颜色
  const [selIndex, setSelIndex] = useState(-1)
  // 表格title下拉
  const [selTitle, setSelTitle] = useState('all')
  const [pageInfo, setPageInfo] = useState({
    current:1,
    total:1,
    pageSize:100,
  })

  const handleChange = (value) =>{
    console.log(`selected ${value}`);
    setSelTitle(value)
    const index = colors.findIndex((v)=>v.value===value)
    setSelIndex(index)
  }

  const getOption = (xData, yData)=> {
    return {
      legend: {
        // data: xData
        show:false
      },
      grid: {
        left: '1%',
        right: '1%',
        bottom: 0,
        top: 0,
        // containLabel: true
      },
      tooltip: {},
      xAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: 'rgba(255,255,255,.01)'
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255,255,255,.01)'
          }
        },
        axisLabel: {
          color: 'rgba(255,255,255,.01)'
        },
      },
      yAxis: {
        type: 'category',
        axisLine: {
          lineStyle: {
            color: 'rgba(255,255,255,.01)'
          }
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(255,255,255,.01)'
          }
        },
        axisLabel: {
          color: 'rgba(255,255,255,.01)'
        },
        data: [getLocaleDesc('work_count')]
      },
      series: yData
    };
  }

  // 点击图 过滤表格
  useEffect(()=>{
    console.log('useEffect',selIndex)
    if(selIndex > -1){
      const tmp= []
      data.forEach(v=>{
        if(v.color === selIndex)
          tmp.push(v)
      })
      console.log('seldata',tmp)
      setSelData(tmp)
    }else{
      setSelData(data)
    }

  },[selIndex])

  useEffect(()=>{
    if(selData.length>0){
      const ctotal = Math.ceil(selData.length / pageInfo.pageSize)
      setPageInfo({
        ...pageInfo,
        current:1,
        total: selData.length
      })
    }
  },[selData])

  useEffect(()=>{
    const start = (pageInfo.current-1) * pageInfo.pageSize
    const data = selData.slice(start,start+pageInfo.pageSize)
    setShowData(data)
  },[pageInfo])
  // 柱状图
  useEffect(()=>{
    if(!data || data.length===0){
      return
    }
    console.log('init echarts')
    let myChart = echarts.init(document.getElementById(id||'main'));
    const xyData = []
    data.forEach((v)=>{
      if(xyData.length > v.color){
        xyData[v.color] +=  v.total
      }else{
        xyData.push(
          v.total
        )
      }
    })
    const xData = []
    const yData = []
    xyData.forEach((v,i)=>{
      xData.push(colors[i].label)
      yData.push(
        {
          name: colors[i].label,
          type: 'bar',
          stack: '总量',
          barWidth: 25,
          itemStyle: {
            normal: {
              barBorderRadius: 0,
            }
          },
          label: {
            show: true,
            position: 'insideRight'
          },
          emphasis: {
            focus: 'series'
          },
          data: [v],
          color:colors[i].value
        }
      )
    })

    const options = getOption(xData,yData)
    // console.log(xData, yData,options,myChart)
    myChart.setOption(options);
    // myChart.current.reload()
    myChart.on('click', onBar );
    window.onresize = ()=>{
      myChart&&myChart.resize();
    }
    setSelData(data)
    return ()=>{
      myChart = null
    }
  },[data])

  const onBar = (params)=>{

    const index = colors.findIndex(v=>v.value===params.color)
    console.log(index,selIndex);
    setSelTitle(colors[index].value)
    // 制台打印数据的名称
    if(selIndex === index){
      console.log('相同');
      // 取消选择
      setSelIndex(-1)
    }else{
      setSelIndex(index)
    }
  }
  const onChange = (page,pageSize)=>{
    setPageInfo({
      ...pageInfo,
      current:page,
      pageSize
    })
    console.log(page,pageSize)
  }

  const doExport = (values,onCancel)=>{
    console.log(values)
    request({url:'/work/result/export',method:'post',
      data:{ids:cdata.map(v=>v.work_id),...values},
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

  return (
    <>
      {data.length > 0 &&
        <div className="topmaincharts">
          <a onClick={()=>setSelIndex(-1)} className="colorall">{getLocaleDesc('calc_all_button')}</a>
          <div className="maincharts" id={id || 'main'}  />
          <ExportCalc onExport={doExport} colors={colors}  />
        </div>
      }
      <div className="maincontborder">
        {/* <Table
          columns={columns}
          dataSource={selData}
          pagination={
            {simple:true}
          }
        /> */}
        <Row>
          <Col span={6} className="mb-10">
            <Tooltip>
              <Text strong className="mr-10 fs16">
                {getLocaleDesc('word_text')}
              </Text>
              <Text strong type="secondary">
                [{getLocaleDesc('word_nature')}]
              </Text>
            </Tooltip>
          </Col>
          <Col span={6} className="mb-10">
            <Tooltip>
              <Text strong className="mr-10 fs16">
                {getLocaleDesc('word_text')}
              </Text>
              <Text type="secondary">[{getLocaleDesc('word_nature')}]</Text>
            </Tooltip>
          </Col>
          <Col span={6} className="mb-10">
            <Tooltip>
              <Text strong className="mr-10 fs16">
                {getLocaleDesc('word_text')}
              </Text>
              <Text type="secondary">[{getLocaleDesc('word_nature')}]</Text>
            </Tooltip>
          </Col>
          <Col span={6} className="mb-10">
            <Tooltip>
              <Text strong className="mr-10 fs16">
                {getLocaleDesc('word_text')}
              </Text>
              <Text type="secondary">[{getLocaleDesc('word_nature')}]</Text>
            </Tooltip>
          </Col>
        </Row>
        <Row className="mb-10 fonttext">
          {
            showData.map((v,i)=>(
              <Col span={6} key={i} className="mb-10">
                <Text strong className="mr-3 fs16" style={{color:colors[v.color].value}}>{v.word}</Text>
                <Text className="fontnum mr-10">{v.total}</Text>
                <Text type="secondary">{getNatureById(v.nature)}</Text>
              </Col>
            ))
          }


        </Row>
        <div className="fontpagination">
          <Pagination showSizeChanger={false} defaultCurrent={1} pageSize={pageInfo.pageSize} total={pageInfo.total} current={pageInfo.current} onChange={onChange} />
        </div>
      </div>
    </>
  );
}
