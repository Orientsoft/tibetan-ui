import React, { useEffect, useState, useRef } from 'react';
import { getLocale, setLocale } from '@/utils/locale';
import { Row, Col, Menu, Dropdown } from 'antd';
import { Link, request, store, getSearchParams } from 'ice';
import { useUserData } from '@/ProviderManage/UserProvider';
import { useLoginModalAction } from '@/ProviderManage/LoginModalProvider';
import { getLocaleDesc } from '@/utils/common';
import { MenuOutlined } from '@ant-design/icons';
import UserStatus from './userStatus';

export default function Header() {
  const [current, setCurrent] = useState('');
  const userData = useUserData();
  const [gData, gDataDispatcher] = store.useModel('gdata');
  const sv = useLoginModalAction();
  const params = getSearchParams();
  const status = useRef(false)

  const onAuthCheck = (e) => {
    if (!userData.access_token) {
      sv(true);
      e.preventDefault();
    }

  }
  useEffect(() => {
    if (userData.access_token) {
      request('/user/me').then(res => {
        console.log('userInfo', res)
        gDataDispatcher.changeUserInfo(res)
      })
    }
    // const url = location.href
    const k = location.hash;
    switch(k){
      case '#/':
        setCurrent('khome');
        break;
      case '#/calc':
        setCurrent('kcalc');
        break;
      case '#/find':
        setCurrent('kfind');
        break;
      case '#/history':
        setCurrent('khistory');
        break;
      case '#/console':
        setCurrent('kconsole');
        break;
      case '#/files':
        setCurrent('kfiles');
        break;
      case '#/ksplit':
        setCurrent('ksplit');
        break;
      case '#/ksort':
        setCurrent('ksort');
        break
      default:
    }
    // if (url.indexOf('calc') > -1) {
    //   setCurrent('kcalc');
    // } else if (url.indexOf('find') > -1) {
    //   setCurrent('kfind');
    // } else if (url.indexOf('history') > -1) {
    //   setCurrent('khistory');
    // } else if (url.indexOf('console') > -1) {
    //   setCurrent('kconsole');
    // } else if (url.indexOf('files') > -1) {
    //   setCurrent('kfiles');
    // } else if (url.indexOf('khome') > -1) {
    //   setCurrent('khome');
    // }


  }, [location.href])
  const onCollapse = () => {
    status.current = true;
  }
  const handleClick = (k) => () => {
    if(status.current){
      const t = document.getElementById('clo-target');
      if(t){
        t.click();
        status.current = false;
      }
    }

    setCurrent(k);
  };
  const getActive = (k) => {
    return current === k ? 'nav-item active' : 'nav-item';
  };
  const onHome = () => {
    setCurrent('khome');
  };

  const hasCalc = ()=>{
    if(gData && gData.userInfo && gData.userInfo.role.indexOf(2) > -1){
      return true
    }
  }

  const hasFind = ()=>{
    if(gData && gData.userInfo && gData.userInfo.role.indexOf(3) > -1){
      return true
    }
  }
  const hasSplit = ()=>{
    if(gData && gData.userInfo && gData.userInfo.role.indexOf(4) > -1){
      return true
    }
  }
  const hasSort = ()=>{
    if(gData && gData.userInfo && gData.userInfo.role.indexOf(5) > -1){
      return true
    }
  }

  return (
    <div className="container-fluid">
      <div className={current === 'khome'?'topheader':'topheader topheaderbg'}>

        <div className="col-12 ">
          {/* <Col span={21}> */}
          <nav className="navbar navbar-expand-lg ">
            <a onClick={onHome} className="navbar-brand" href="#"><img src="images/logo-ico.png" width="60" alt="" /><img src="images/logo.png" className="mr-10" alt="" /></a>
            {/* <div className="fl "><img src="images/logo-ico.jpg" width="60" alt="" /><img src="images/logo.jpg" className="mr-10" alt="" /></div> */}
            {/* <div className="logo" /> */}
            <button onClick={onCollapse} id="clo-target" className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
              <MenuOutlined />
            </button>
            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav mr-auto">
                <li className={getActive('khome')} key="khome" onClick={handleClick('khome')}>
                  <Link to="/">{getLocaleDesc('tab_home')}</Link>
                </li>
                <li className={getActive('kfiles')} key="kfiles" onClick={handleClick('kfiles')}>
                  <Link to="/files" onClick={onAuthCheck}>{getLocaleDesc('file_list_title')}</Link>
                </li>
                {hasCalc()&&<li className={getActive('kcalc')} key="kcalc" onClick={handleClick('kcalc')}>
                  <Link to="/calc" onClick={onAuthCheck}>{getLocaleDesc('tab_calc')}</Link>
                </li>}
                {hasFind()&&<li className={getActive('kfind')} key="kfind" onClick={handleClick('kfind')}>
                  <Link to="/find" onClick={onAuthCheck}>{getLocaleDesc('tab_find')}</Link>
                </li>}
                
                <li className={getActive('khistory')} key="khistory" onClick={handleClick('khistory')}>
                  <Link to="/history" onClick={onAuthCheck}>{getLocaleDesc('tab_history')}</Link>
                </li>
                {gData && gData.userInfo && gData.userInfo.role.indexOf(0) > -1 &&
                  <li className={`hidden-xs hidden-sm hidden-md ${getActive('kconsole')}`} key="kconsole" onClick={handleClick('kconsole')}>
                    <Link to="/console">{getLocaleDesc('tab_console')}</Link>
                  </li>}
              </ul>
              <div className="my-2 my-lg-0">
                <LocaleStatus />
                <UserStatus />
              </div>
            </div>
          </nav>
        </div>
        {/* 
        {hasSplit()&&<li className={getActive('ksplit')} key="ksplit" onClick={handleClick('ksplit')}>
          <Link to="/split" onClick={onAuthCheck}>{getLocaleDesc('tab_split')}</Link>
        </li>}
        {hasSort()&&<li className={getActive('ksort')} key="ksort" onClick={handleClick('ksort')}>
          <Link to="/sort" onClick={onAuthCheck}>{getLocaleDesc('tab_sort')}</Link>
        </li>}
        <Menu className="" onClick={handleClick} selectedKeys={[current]} mode="horizontal">
          <Menu.Item className="hidden-xs" key="khome">
            <Link to="/">{getLocaleDesc('tab_home')}</Link>
          </Menu.Item>
          <Menu.Item className="hidden-xs" key="kfiles">
            <Link to="/files" onClick={onAuthCheck}>{getLocaleDesc('file_list_title')}</Link>
          </Menu.Item>
          <Menu.Item className="hidden-xs hidden-sm" key="kcalc">
            <Link to="/calc" onClick={onAuthCheck}>{getLocaleDesc('tab_calc')}</Link>
          </Menu.Item>
          <Menu.Item className="hidden-xs hidden-sm" key="kfind">
            <Link to="/find" onClick={onAuthCheck}>{getLocaleDesc('tab_find')}</Link>
          </Menu.Item>
          <Menu.Item className="hidden-xs hidden-sm hidden-md" key="khistory">
            <Link to="/history" onClick={onAuthCheck}>{getLocaleDesc('tab_history')}</Link>
          </Menu.Item>
          {gData&&gData.userInfo&&gData.userInfo.role.indexOf(0)>-1&&<Menu.Item className="hidden-xs hidden-sm hidden-md" key="kconsole">
            <Link to="/console">{getLocaleDesc('tab_console')}</Link>
          </Menu.Item>}
        </Menu> */}
        {/* </Col> */}
        {/* <div className="loginwp">
        <LocaleStatus />
        <UserStatus />
      </div> */}
        {/* </Row> */}
      </div>
    </div>
  );
}

function LocaleStatus() {
  const [lang, setLang] = React.useState({ show: 'ZH', value: 'zh-cn' });
  const onChangeLanguage = (v) => {
    setLang(v)
    setLocale(v.value)
  };
  useEffect(() => {
    const tmp = getLocale()
    if (tmp === 'zh-cn') {
      setLang({ show: 'ZH', value: 'zh-CN' })
    }
    if (tmp === 'en-us') {
      setLang({ show: 'EN', value: 'en-US' })
    }
    if (tmp === 'bo-cn') {
      setLang({ show: 'BO', value: 'bo-CN' })
    }
  }, [])
  const menu = (
    <Menu>
      <Menu.Item onClick={() => onChangeLanguage({ show: 'ZH', value: 'zh-CN' })}>中文</Menu.Item>
      <Menu.Item onClick={() => onChangeLanguage({ show: 'BO', value: 'bo-CN' })}>བོད་སྐད</Menu.Item>
      <Menu.Item onClick={() => onChangeLanguage({ show: 'EN', value: 'en-US' })}>English</Menu.Item>
    </Menu>
  );

  return (
    <Dropdown overlay={menu}>
      <a>
        {lang.show}&nbsp;
        <img height={16} src="../images/language.svg" alt="" />
      </a>
    </Dropdown>
  );
}
