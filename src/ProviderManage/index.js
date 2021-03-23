import React from 'react';
import UserProvider from './UserProvider';
import LoginModalProvider from './LoginModalProvider';

export default function ProviderManage({ children }) {
  return (<LoginModalProvider ><UserProvider>{children}</UserProvider></LoginModalProvider>)
}