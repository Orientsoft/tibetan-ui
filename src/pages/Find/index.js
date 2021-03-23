import React from 'react';
import { Tabs } from 'antd';
import Findwords from '../Work/findwords';

const { TabPane } = Tabs;

export default function Find() {
  function callback(key) {
    console.log(key);
  }
  return (
    <Findwords />
  );
}
