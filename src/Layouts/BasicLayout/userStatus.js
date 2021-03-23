import React, { useState } from 'react';
import { Modal, Form, Input, Button, Typography, Avatar, Dropdown, Menu, message } from 'antd';

import { useUserData, useUserAction } from '@/ProviderManage/UserProvider';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { request, store, useHistory, } from 'ice';
import {useLoingModalStatus, useLoginModalAction} from '@/ProviderManage/LoginModalProvider';
import { getLocaleDesc} from '@/utils/common';

export default function UserStatus() {
  const userData = useUserData();
  const setUser = useUserAction();
  const [gData, gDataDispatcher] = store.useModel('gdata');
  const history = useHistory();
  const [v, sv] = useState(false);
  const onClick = () => {
    setTimeout(() => {
      sv(true);
    }, 0);
  };
  const onCancel = () => {
    sv(false);
  };
  const onConfirm = (va) => {
    request({ url: '/user', method: 'patch', data: va })
      .then((r) => {
        message.success(getLocaleDesc(r.msg));
        sv(false);
      });
  };

  const logout = ()=>{
    setUser({access_token:''})
    gDataDispatcher.changeUserInfo(null)
    history.push('/')
  }
  const menu =  (
    <Menu>
      <Menu.Item onClick={onClick}>{getLocaleDesc('edit_pwd')}</Menu.Item>
      <Menu.Item onClick={logout}>{getLocaleDesc('button_exit')}</Menu.Item>
    </Menu>
  );

  if (userData.access_token) {
    return <>
      <Dropdown overlay={menu}>
        <Avatar className="ml-10" >{gData.userInfo&&gData.userInfo.username}</Avatar>
      </Dropdown>
      {
        v && (
          <Modal title={getLocaleDesc('edit_pwd')} visible={v} footer={null} onCancel={onCancel}>
            <Form onFinish={onConfirm} layout="vertical">
              <Form.Item
                label={getLocaleDesc('old_pwd')}
                name="old_password"
                rules={[{ required: true, message: getLocaleDesc('p_input') }]}
              >
                <Input.Password
                  size="large"
                  placeholder={getLocaleDesc('old_pwd')}
                />
              </Form.Item>
              <Form.Item
                label={getLocaleDesc('user_password_new')}
                name="new_password"
                rules={[
                  { required: true, message: getLocaleDesc('p_input') },
                  () => ({
                    validator(_, value) {                      
                      if (/^[0-9a-zA-Z]*$/g.test(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject(getLocaleDesc('charnum'));
                    },
                  })
                ]}
              >
                <Input.Password
                  size="large"
                  placeholder={getLocaleDesc('user_password_new')}
                />
              </Form.Item>
      
              <Form.Item>
                <Button htmlType="submit" type="primary">
                  {getLocaleDesc('confirm')}
                </Button>
              </Form.Item>
            </Form>
          </Modal>
        )
      }
    </>
  }
  return <Login />;
}

function Login() {
  const { Title } = Typography;
  // const [visible, sv] = useState(false);
  const visible = useLoingModalStatus();
  const sv = useLoginModalAction();
  const setUser = useUserAction();
  const [gData, gDataDispatcher] = store.useModel('gdata');
  const onLogin = () => {

    sv(true);
  };
  const onCancel = () => {
    sv(false);
  };
  const onFinish = (v) => {

    request({
      url: '/users/login',
      method: 'post',
      data: `username=${v.username}&password=${v.password}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    }).then((res) => {
      sv(false);
      setUser(res);
      request('/user/me').then(res=>{

        gDataDispatcher.changeUserInfo(res)
      })
    }).catch((e) => {
      console.log(e);
    });
  };

  return (
    <>
      {/* <a onClick={onLogin}>登录</a> */}
      <Button type="primary" onClick={onLogin} value="登录" className="ml-10" >{getLocaleDesc('login')}</Button>

      <Modal closable={false} title="" visible={visible} footer={null} onCancel={onCancel}>
        <Form
          name="normal_login"
          className="login-form"
          initialValues={{ remember: true }}
          onFinish={onFinish}
        >
          <Title level={2} className="pt-20 text-center">{getLocaleDesc('login')}</Title>
          <Title level={4} className="pb-30 text-center">{getLocaleDesc('home_title')}</Title>
          <Form.Item
            name="username"
            rules={[{ required: true, message: getLocaleDesc('login_user_info') }]}
          >
            <Input size='large'
              prefix={<UserOutlined className="site-form-item-icon" />}
              placeholder={getLocaleDesc('user_name')}
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: getLocaleDesc('login_user_info_2') }]}
          >
            <Input
              size='large'
              prefix={<LockOutlined className="site-form-item-icon" />}
              type="password"
              placeholder={getLocaleDesc('user_password')}
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              className="login-form-button"
              size='large'
              block
            >
              {getLocaleDesc('login')}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
