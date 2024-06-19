import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProFormText,
  ProTable,
  ProFormDigit,
  ProFormDatePicker,
  ProForm
} from '@ant-design/pro-components';
import { Button, Drawer, Input, message } from 'antd';
import React, { useRef, useState } from 'react';
// import { FormattedMessage } from 'umi';
// import { PrismaClient } from "@prisma/client";
// import request from 'umi-request';

// const prisma = new PrismaClient();

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: any) => {
  const hide = message.loading('正在添加');
  fields.IOO = '支出'
  try {
    hide();
    const settings = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
       }, 
      body: JSON.stringify(fields)
    }
    
    console.log(fields)
    const fetchResponse  = await fetch('http://127.0.0.1:5000/api/createService', settings)
    const data = await fetchResponse.json();

    message.success('支出添加成功');
    console.log(data)
    return true;
  } catch (error) {
    hide();
    console.log(error)
    message.error('添加失败，请重新尝试！');
    return false;
  }
};

const handleUpdate = async (fields: any) => {
  const hide = message.loading('正在添加');
  try {
    hide();
    const settings = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
       }, 
      body: JSON.stringify(fields)
    }
    
    console.log(fields)
    const fetchResponse  = await fetch('http://127.0.0.1:5000/api/updateService', settings)
    const data = await fetchResponse.json();

    message.success('收入编辑成功');
    console.log(data)
    return true;
  } catch (error) {
    hide();
    console.log(error)
    message.error('编辑失败，请重新尝试！');
    return false;
  }
};
const getItems = async(param: any) => {

  const keys = ['Sid','type','price', 'number','note','timestamp']
  // console.log(param)
  let order:string = ''
  let where:string = ''
  for (var key of keys) {
    if (key in param.sorter) {
      if (param.sorter[key] == 'ascend') {
        order = key + ' ASC'
      }
      else if (param.sorter[key] == 'descend') {
        order = key + ' DESC'
      }
    }
    if (key in param.params) {
      where += ' AND ' + key + ' = ' + param.params[key]
    }
  } 
  where = where.substring(5)
  // console.log(order)

  let query = `
  SELECT
    id AS Sid,
    type,
    price,
    number,
    note,
    timestamp,
    IOO
  FROM
    Service
  `;
  if (where) {
    query += 'WHERE ' + where + '\n';
  }
  if (order) {
    query += 'ORDER BY ' + order;
  }
  query += ';'
  // console.log(query)
  try{
    const fetchResponse  = await fetch('http://127.0.0.1:5000/api/getServices?query_param='+ query)
    const data = await fetchResponse.json();
    // console.log(data)
    let records = data.result
    let result = []
    for (let i = 0; i < records.length; i += 1) {
      if (records[i][6] == '支出') {
        let item: any = {}
        item['Sid'] = records[i][0]
        item['type'] = records[i][1]
        item['price'] = records[i][2]
        item['number'] = records[i][3]
        item['note'] = records[i][4]
        item['timestamp'] = records[i][5]
        result.push({...item})
      }
    }
    return result
  }
  catch(e){
    return console.log(e)
  }  
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: service[]) => {
  const hide = message.loading('正在删除');
  if (!selectedRows) return true;

  const settings = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8'
     }, 
    body: JSON.stringify(selectedRows)
  }

  try {
    const fetchResponse  = await fetch('http://127.0.0.1:5000/api/deleteServices', settings)
    const data = await fetchResponse.json();
    hide();
    message.success('删除成功');
    return true;
  } catch (error) {
    hide();
    message.error('删除失败');
    return false;
  }
};


type service = {
  Sid:         number;
  type:       string;
  price:      number;
  number:     number;
  note:       string;
  timestamp:  Date;
}

type PageParams = {
  current?: number;
  pageSize?: number;
};

const MoneyOut: React.FC = () => {

  const columns: ProColumns<service>[] = [
    {
      title:'支出编号',
      sorter: true,
      dataIndex: 'Sid',
    },
    {
      title:'支出种类',
      sorter: true,
      dataIndex: 'type',
    },
    {
      title:'价格',
      sorter: true,
      dataIndex: 'price',
    },
    {
      title:'数量',
      sorter: true,
      dataIndex: 'number',
    },
    {
      title:'备注',
      sorter: true,
      dataIndex: 'note',
    },
    {
      title:'日期',
      sorter: true,
      dataIndex: 'timestamp',
      valueType: 'date',
      fieldProps: {
        format: 'YYYY-MM-DD',
      },
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (text, service, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(service.Sid);
          }}
        >
          编辑
        </a>
      ],
    },
  ]

  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  const [updateModalVisible, handleUpdateModalVisible] = useState<boolean>(false);

  const [showDetail, setShowDetail] = useState<boolean>(false);

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<service>();
  const [selectedRowsState, setSelectedRows] = useState<service[]>([]);
  const [data, setData] = useState<service[]>([]);


  return (
    <>
      {/* <PageContainer> */}
        <ProTable<service, PageParams>
          headerTitle = '服务页'
          columns={columns}
          actionRef={actionRef}
          rowKey="Sid"
          request = {(params, sorter, filter) => {
            let placeholder:service[] = [];
            getItems({params, sorter,})
            .then((result:any)=>{
              setData(result);
              placeholder = result
            });
            return Promise.resolve({
              data: placeholder,
              success: true,
            });
            }}
          dataSource={data}
          editable={{
            type: 'multiple',
            onSave:async (key, row)=>{ 
              // await save(rows) 
              handleUpdate(row)
              actionRef.current?.reloadAndRest?.();
              // console.log(key, row)
            },
            onDelete:async (key, row) => {
              handleRemove([row])
              actionRef.current?.reloadAndRest?.();
            },
          }}
          search={{
            labelWidth: 120,
          }}
          rowSelection={{
            onChange: (_, selectedRows) => {
              // console.log(selectedRows);
              setSelectedRows(selectedRows);
              
            },
          }}
          toolBarRender={() => [
            // new
            <Button
              type="primary"
              key="primary"
              onClick={() => {
                handleModalVisible(true);
              }}
            >
              <PlusOutlined /> 
              <a>新建</a>
              {/* <FormattedMessage id="pages.searchTable.new" defaultMessage="New" /> */}
            </Button>,
          ]}
        />

      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              <a>已选</a>
              {/* <FormattedMessage id="pages.searchTable.chosen" defaultMessage="Chosen" /> */}
              {' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              {/* <FormattedMessage id="pages.searchTable.item" defaultMessage="项" /> */}
              <a>项</a>
              &nbsp;&nbsp;
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            <a>删除</a>
            {/* <FormattedMessage
              id="pages.searchTable.batchDeletion"
              defaultMessage="Batch deletion"
            /> */}
          </Button>
        </FooterToolbar>
      )}

        <ModalForm
          title='添加支出'
          width="800px"
          visible={createModalVisible}
          onVisibleChange={handleModalVisible}
          onFinish={
            async (value) => {
              const success = await handleAdd(value);
              // console.log(success)
            if (success) {
              handleModalVisible(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }
        }
        >
          <ProForm.Group>
            <ProFormText width="md" name="type" label="支出种类" initialValue = 'a'/>
            <ProFormDigit width="md" name="price" label="价格" initialValue = '0'/>
            <ProFormDigit width="md" name="number"  label="数量" initialValue = '0'/>
            <ProFormText width="md" name="note" label="备注" initialValue = '无'/>
            <ProFormDatePicker width="md" name="timestamp" label="日期时间" rules={[{ required: true, message: '请选择日期!' }]}/>
          </ProForm.Group>
        </ModalForm>
      {/* </PageContainer> */}
    </>
  );
};

export default MoneyOut;