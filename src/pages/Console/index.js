import React, { useState } from 'react';
import { Menu,Layout, } from 'antd';
import { getLocaleDesc} from '@/utils/common';

import UserManage from './userManage';
import WordHandle from './WordHandle';

export default function Console() {
  const [current, setCurrent] = useState('k1');
  const { Sider, Content } = Layout;

  const handleClick = (e) => {
    setCurrent(e.key);
  };
  return (
    <>
      <Layout className="contentwp" >
        <Sider style={{ width: 256 }} className="pt-20" >
          <Menu  onClick={handleClick} mode="inline" selectedKeys={[current]} >
            <Menu.Item key="k1">
              {getLocaleDesc('console_tab_word')}
            </Menu.Item>
            <Menu.Item key="k2">
              {getLocaleDesc('console_tab_existword')}
            </Menu.Item>
            <Menu.Item key="k3">
              {getLocaleDesc('console_tab_user')}
            </Menu.Item>
            <Menu.Item key="k4">
              {getLocaleDesc('console_tab_word_index')}
            </Menu.Item>
          </Menu>
        </Sider>
        <Content className=" pt-20 p-lr-10 consolebox">
          {current === 'k1' && <WordHandle type="stat" wtitle={getLocaleDesc('console_tab_word')}  />}
          {current === 'k2' && <WordHandle type="used" wtitle={getLocaleDesc('console_tab_existword')}  />}
          {current === 'k3' && <UserManage />}
          {current === 'k4' && <WordHandle type="word" wtitle={getLocaleDesc('console_tab_word_index')}  />}
        </Content>
      </Layout>
    </>
  );
}
