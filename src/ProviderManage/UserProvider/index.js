import React, { useState } from 'react';
import { getLocalUser, setLocalUser } from '@/utils/common';

const UserDataContext = React.createContext({});
const UserActionContext = React.createContext(() => {});

export default function UserProvider({ children }) {
  const [user, setUser] = useState({});
  return (
    <UserActionContext.Provider value={setUser}>
      <UserDataContext.Provider value={user}>{children}</UserDataContext.Provider>
    </UserActionContext.Provider>
  )
}



export function useUserData(){
  const user = React.useContext(UserDataContext);
  const localUser = getLocalUser();
  if (!user.access_token) {
    return localUser;
  }
  return user;
}

export function useUserAction(){
  const setUser = React.useContext(UserActionContext);
  const saveUserInfo = (v) => {
    setLocalUser(v);
    setUser(v);
  }  
  return saveUserInfo;
}