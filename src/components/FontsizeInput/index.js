import React, { useState, useEffect } from 'react';
import { Button, InputNumber } from 'antd';
import { store } from 'ice';
import { saveFontSize} from '@/utils/common'

export default function FontsizeInput(props) {
  const { onChange } = props
  const [gData, gDataDispatcher] = store.useModel('gdata');

  useEffect(()=>{
    onChange(gData.fontSize)
  },[])
  const onSub =()=>{
    const size = gData.fontSize-2
    if(size < 16){
      return
    }
    gDataDispatcher.changeFontSize(size)
    saveFontSize(size)
    onChange(size)
  }
  const onAdd =()=>{
    const size = gData.fontSize+2
    if(size > 120){
      return
    }
    gDataDispatcher.changeFontSize(size)
    saveFontSize(size)
    onChange(size)
  }
  const onStep = (value) =>{
    gDataDispatcher.changeFontSize(value)
    saveFontSize(value)
    onChange(value)
  }

  return (
    <>
      <Button onClick={onSub} className="fontbtn">A-</Button>
      {/* <InputNumber style={{width:'50px'}} onStep={onStep} step={2} value={gData.fontSize} /> */}
      <Button onClick={onAdd} className="fontbtn">A+</Button>
    </>
  );
}
