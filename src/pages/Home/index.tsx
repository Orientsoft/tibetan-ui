import React, { useEffect, useState } from 'react';
import {
  Col,
  Form,
  Button,
  Input,
  Table,
  Spin,
  message,
  Select,
  ConfigProvider,
  Tooltip
} from 'antd'
import { store, request } from 'ice'
import {useLoginModalAction} from '@/ProviderManage/LoginModalProvider';
import { useUserData } from '@/ProviderManage/UserProvider';
import { getLocaleDesc } from '@/utils/common';
import { getLocale } from '@/utils/locale';
import { FolderOutlined, FolderOpenOutlined } from '@ant-design/icons';


export default function Home() {
  const [gData] = store.useModel('gdata');
  const [treeType, setTreeType] = useState('share')
  const userData = useUserData();
  const sv = useLoginModalAction();
  const l = getLocale();
  const [pageInfo, setPageInfo] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
    value:''
  })

  const toView = (record)=>{
    let search = form.getFieldValue('search').trim()
    // console.log('toview',ss)
    window.open(`#/view?id=${record.id}&type=view&search=${search}&seq=${record.seq}`,'_blank')
  }

  const baseClumn = [
    {
      title: getLocaleDesc('file_search'),
      dataIndex: 'sentence',
      key: 'sentence',
      render:function(value,record){
        if(value[0][0].length > 1000){
          console.log(record)
        }
        const promt = value[0][0]+value[0][1]+value[0][2]
        const tmp = value.map(v=>`<div class='row'><div class='c1'>${v[0].length>200?v[0].substr(v[0].length-200):v[0]}</div><div class='c2'>${v[1]}</div><div class='c3'>${v[2].substr(0,200)}</div></div>`)
        return (
        <Tooltip title={promt.length>1000?getLocaleDesc('please_view_doc'):promt}>
          <div onClick={()=>toView(record)} dangerouslySetInnerHTML={{__html: tmp.join('')}}>
          </div>
        </Tooltip>
        )
      }
    },
   ]
  const [searchData, setSearchData] = useState([])
  const [loading, setLoading] = useState(false)
  const [isSearch, setIsSearch] = useState(false)
  const [form] = Form.useForm();

  const doSearch = (value) =>{
    console.log('doSearch')
    if (!userData.access_token) {
      sv(true);
      return
    }
    if(!hasSearch()){
      message.error(getLocaleDesc('no_auth'))
      return
    }
    setSearchData([])
    // getHistory(value)
    if(value.trim() === ''){
      setIsSearch(false)
    }else{
      setIsSearch(true)
    }
    search(1,pageInfo.pageSize,value)
  }

  const hasSearch = ()=>{
    if(gData && gData.userInfo && gData.userInfo.role.indexOf(1) > -1){
      return true
    }
    return false
  }

  const search = (page,pageSize,value) =>{
    let searchstr = value || form.getFieldValue('search')
    if(!searchstr)
      searchstr = ''
    setLoading(true)
    request({url:'/search',method:'post',data:{search:searchstr,origin:treeType,page,
        limit:pageSize}}).then((res)=>{
      console.log(res)
      setLoading(false)
      setSearchData(res.data.map((v,i)=>({...v,index:i})))
      setPageInfo({...pageInfo,total:res.total,current:page,pageSize,value})

    })
  }

  const onChange = (page,pageSize)=>{
    console.log('onChange',page,pageSize)
    search(page,pageSize,form.getFieldValue('search'))
    // setPageInfo({...pageInfo,page,pageSize})
  }
  const handleSelectChange = (value)=>{
    console.log(value)
    setTreeType(value)
  }

  console.log('home')

  return (
  <div>
  {
    isSearch?
        <div className="containerwp containerbg">
        <div className="homeheight">
        <div className="container ">

            <div className="row pt-80 pb-30">
              {/* <div className="col-12 homecont "><h1 className="pt-40 text-center">{getLocaleDesc('home_title')}</h1></div> */}

              <div className="searchwp">

                <Form form={form} layout="inline" size='large' className="searchbox">
                  <Form.Item name="search">
                    <Input.Search
                      allowClear
                      enterButton
                      placeholder={getLocaleDesc('search')}
                      style={{ width: 640 }}
                      onSearch={doSearch}
                    />
                  </Form.Item>
                  <Form.Item className="search-select">
                    <Select value={treeType} onChange={handleSelectChange}>
                      <Select.Option value="private"><FolderOutlined className="iconleft" />{getLocaleDesc('file_list_title')}</Select.Option>
                      <Select.Option value="share"><FolderOpenOutlined className="iconleft" />{getLocaleDesc('share_file_list_title')}</Select.Option>
                    </Select>
                  </Form.Item>
                </Form>

              </div>

              <div className="col-12">
                <ConfigProvider locale={{Pagination:{items_per_page:''}}}>
                  <Table
                  className="home-table"
                  loading={loading}
                  showHeader={false}
                  pagination={{hideOnSinglePage:true,onChange,...pageInfo,}}
                  dataSource={searchData}
                  columns={baseClumn}
                  rowKey="index" />
                </ConfigProvider>
              </div>
            </div>

        </div>
        </div>
      </div>
      :
      <div className="containerwp">
        <div className="containerwpbg"></div>
        <div className="shader_left"></div>
        <div className="shader_right"></div>
        <div className="shader_bottom"></div>
        <div className="homeheight">
        <div className="container ">
            <div className="row pt-80 pb-30">
              <div className="col-12 homecont ">
              {
                l === 'bo-cn'?
                <h1 className="pt-40 text-center">
                  <img height="90px" src="images/home-h2.png" alt="" />
                </h1>
                :
                <h1 className="pt-40 text-center">{getLocaleDesc('home_title')}</h1>
              }
              </div>
              <div className="searchwp">
                <Form form={form} layout="inline" size='large' className="searchbox">
                  <Form.Item name="search">
                    <Input.Search
                      allowClear
                      enterButton
                      placeholder={getLocaleDesc('search')}
                      style={{ width: 640 }}
                      onSearch={doSearch}
                    />
                  </Form.Item>
                  <Form.Item className="search-select">
                    <Select value={treeType} onChange={handleSelectChange}>
                      <Select.Option value="private"><FolderOutlined className="iconleft" />{getLocaleDesc('file_list_title')}</Select.Option>
                      <Select.Option value="share"><FolderOpenOutlined className="iconleft" />{getLocaleDesc('share_file_list_title')}</Select.Option>
                    </Select>
                  </Form.Item>
                </Form>
              </div>
            </div>
        </div>
        </div>
      </div>
  }
  </div>
  );

}
