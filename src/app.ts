import { runApp, IAppConfig, history } from 'ice';
import { getLocalUser, getLocaleDesc } from '@/utils/common';
import { message } from "antd";

const appConfig: IAppConfig = {
  app: {
    rootId: 'ice-container'
  },
  router: {
    type: 'hash'
  },
  request: {
    baseURL: '/api',
    interceptors:{
      request: {
        onConfig: (config) => {
          const localUser = getLocalUser();
          if(localUser.access_token){
            config.headers = { Authorization: `Bearer ${localUser.access_token}` };
          }
          return config;
        },
      },
      response: {
        // onConfig: (response) => {
        //   // 请求成功：可以做全局的 toast 展示，或者对 response 做一些格式化

        //   return response;
        // },
        onError: (error) => {
          if (!error.response) {
            return Promise.reject(error.response);
          }
          if (error.response.status === 401 || error.response.status === 403) {
            message.error('授权已过期',1.5);
            window.localStorage.removeItem('u-i');
            setTimeout(() => {
              history.push('/');
            },1000);
            return Promise.reject(error.response.data);
          }
          if (error.response.status >= 500) {
            message.error(error.response.status,1.5);
            return Promise.reject(error.response.data);
          }

          if (error.response.data.errors) {
            const m = getLocaleDesc(error.response.data.errors[0].msg);
            message.error(m,1.5);
          } else {
            message.error(error.response.data,1.5);
          }
          // 请求出错：服务端返回错误状态码
          return Promise.reject(error.response.data);
        },
      },
    }
  },
};

runApp(appConfig);
