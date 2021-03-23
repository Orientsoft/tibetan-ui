import React, { useEffect } from 'react';
import Header from './header';
import ProviderManage from '@/ProviderManage';
import { store, request } from 'ice';
import { getFontSize } from '@/utils/common'
import { getLocale } from '@/utils/locale'

export default function BasicLayout({ children, location }) {

  const [gData, gDataDispatcher] = store.useModel('gdata');
  useEffect(()=>{
    gDataDispatcher.changeFontSize(getFontSize())
    request({
      url: '/language/code',
    }).then((res) => {
      window.locale = res.data;
    });
    request({
      url: '/poscode',
    }).then((res) => {
      const l = getLocale();
      let tmp = res.data.map(item=>({
        value:item.id,label:item[l]
      }))
      gDataDispatcher.changeNature(tmp)
    });
    // const loc = getLocale();
    // if(loc==='zh-cn'){
    //   let container = document.getElementById('ice-container')
    //   container.style.fontSize = '15px'
    // }else{
    //   let container = document.getElementById('ice-container')
    //   container.style.fontSize = '20px'
    // }

  },[])
  useEffect(function(){
    document.oncopy = function(e) {
      const href = window.location.href;
      const isView = href.indexOf('/view') !== -1;
      const isCalc = href.indexOf('/calc') !== -1;
      if(isView || isCalc){
        e.preventDefault();
        const selObj = window.getSelection();      
        const clipboardData = e.clipboardData || window.clipboardData;
        const copytext = selObj + '';
        clipboardData.setData('text/plain', copytext.slice(0, isCalc ? 960 : 1740));
      }
    }
    return () => {
      
    }
  }, [])
  return (
    <ProviderManage>
      <Header />
        <div className="containerwh"> { children }</div>
    </ProviderManage>

  );
}
