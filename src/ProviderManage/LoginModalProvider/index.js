import React, { useState } from 'react';

const LoginModalContext = React.createContext({});
const LoginModalActionContext = React.createContext(() => {});

export default function LoginModalProvider({ children }) {
  const [visible, setVisible] = useState(false);
  return (
    <LoginModalActionContext.Provider value={setVisible}>
      <LoginModalContext.Provider value={visible}>{children}</LoginModalContext.Provider>
    </LoginModalActionContext.Provider>
  )
}



export function useLoingModalStatus(){
  const visible = React.useContext(LoginModalContext);
  return visible;
}

export function useLoginModalAction(){
  const setVisible = React.useContext(LoginModalActionContext);
  return setVisible;
}