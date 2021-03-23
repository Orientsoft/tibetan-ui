import { getLocale } from './locale';
import zhcn from '../locales/zh-CN';
import enus from '../locales/en-US';
import bocn from '../locales/bo-CN';
import { store} from 'ice'
import moment from 'moment'

export function getNatureMap() {
  const [gData] = store.getModel('gdata');
  const nmap = {};
  gData.natureList.forEach((v) => {
    nmap[v.value] = v.label;
  });
  return nmap;
}

export function getNatureList(){
  const [gData] = store.getModel('gdata');
  return gData.natureList
}

export function getNatureById(id){
  const [gData] = store.getModel('gdata')
  let list = gData.natureList
  if(id &&id < list.length){
    return list[id].label
  }
  return id
}

export function getLocaleDesc(k) {
  const l = getLocale();
  if (!l) {
    console.log('locale not found', k);
    return k;
  }

  let text = zhcn;
  if(l==='en-us'){
    text = enus
  }
  if(l==='bo-cn'){
    text = bocn
  }
  if (text[k]) {
    return text[k];
  }

  if (!window.locale) {
    console.log('window loale not found', k);
    return k;
  }
  if (!window.locale[l]) {
    console.log('window loale text not found', k);
    return k;
  }
  if (!window.locale[l][k]) {
    console.log('window loale desc not found', k);
    return k;
  }
  return window.locale[l][k];
}

export function getLocalUser(){
  const t = window.localStorage.getItem('u-i');
  if (t) {
    try {
      const p = JSON.parse(t);
      // TODO 设置过期时间检查
      return p;
    } catch (error) {
      return {};
    }
  }
  return {}
}

export function setLocalUser(v){
  window.localStorage.setItem('u-i', JSON.stringify(v));
}

export function getFontSize(){
  const t = window.localStorage.getItem('fontsize');
  if (t) {
    try {
      const p = JSON.parse(t);
      // TODO 设置过期时间检查
      return p;
    } catch (error) {
      return {};
    }
  }
  return 24
}

export function saveFontSize(v){
  window.localStorage.setItem('fontsize', JSON.stringify(v));
}

export function formatTime(t) {
  if (!t) {
    return '';
  }
  return moment(t).format('YYYY-MM-DD HH:mm:ss');
}
