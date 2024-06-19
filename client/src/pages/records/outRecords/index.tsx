import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
  FooterToolbar,
  ModalForm,
  PageContainer,
  ProFormText,
  ProTable,
  ProFormDigit,
  ProFormSelect,
  ProForm,
  ProFormDatePicker,
  TableDropdown
} from '@ant-design/pro-components';
import { Button, Drawer, TreeSelect, message, Switch } from 'antd';
import React, { useRef, useState } from 'react';
import dayjs from 'dayjs';
// import type { FormValueType } from './components/UpdateForm';
// import UpdateForm from './components/UpdateForm';
// import { PrismaClient } from "@prisma/client";
// import request from 'umi-request';

// const prisma = new PrismaClient();

/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: any, itemId: string) => {
  const hide = message.loading('正在添加');
  fields.itemId = itemId.substring(6)
  fields.priceIn = "0"
  fields.numberIn = "0"
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
    const fetchResponse  = await fetch('http://127.0.0.1:5000/api/createRecord', settings)
    const data = await fetchResponse.json();

    message.success('记录添加成功');
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
    const fetchResponse  = await fetch('http://127.0.0.1:5000/api/updateRecord', settings)
    const data = await fetchResponse.json();

    message.success('记录编辑成功');
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

  const keys = ['Rid', 'name','type','gender','length','priceIn','priceOut','numberIn',
  'numberOut','payment','note','timestamp']

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
    Record.id AS Rid,
    Item.name,
    Item.type,
    Item.gender,
    Item.length,
    Record.state,
    Record.priceIn,
    Record.priceOut,
    Record.numberIn,
    Record.numberOut,
    Record.payment,
    Record.note,
    Record.timestamp AS timestamp
  FROM
    Record
  JOIN
    Item ON Record.itemId = Item.id
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
    const fetchResponse  = await fetch('http://127.0.0.1:5000/api/getItems?query_param='+ query)
    const data = await fetchResponse.json();
    // console.log(data)
    let records = data.result
    let result = []
    for (let i = 0; i < records.length; i += 1) {
      if (records[i][9] != 0) {
        let item: any = {}
        item['Rid'] = records[i][0]
        item['name'] = records[i][1]
        item['type'] = records[i][2]
        item['gender'] = records[i][3]
        item['length'] = records[i][4]
        item['state'] = records[i][5]
        item['priceIn'] = records[i][6]
        item['priceOut'] = records[i][7]
        item['numberIn'] = records[i][8]
        item['numberOut'] = records[i][9]
        item['payment'] = records[i][10]
        item['note'] = records[i][11]
        item['timestamp'] = records[i][12]
        result.push({...item})
      }
    }
    return result
  }
  catch(e){
    return console.log(e)
  }  
};

const getTreeData = async() => {

  let query = `
    SELECT
      Item.id as id,
      Item.name as name,
      Item.type as type,
      Item.gender as gender,
      Item.length as length
    FROM Item;
    `;
  
  try{
    const fetchResponse  = await fetch('http://127.0.0.1:5000/api/getItems?query_param='+ query)
    const data = await fetchResponse.json();
    console.log(data)
    let tds:object[] = []
    for (let item of data.result) {
      tds.push({value: `商品编号: ${item[0]}`, 
                title: `商品编号: ${item[0]}, 名称: '${item[1]}', 种类: '${item[2]}' , 性别: '${item[3]}', 长度: '${item[4]}'`})
    }
    // console.log(tds)
    return tds
    // await fetch('http://127.0.0.1:5000/api/getItems?query_param='+ query)
    // .then((data) => data.json()
    // .then((data) => 
    //   {
    //     // console.log(data.result)
    //     let tds:object[] = []
    //     for (let item of data.result) {
    //       tds.push({value: `id: ${item[0]}, 名称: '${item[2]}', 性别: '${item[3]}', 长度: '${item[4]}'`, 
    //                 title: `id: ${item[0]}, 名称: '${item[2]}', 性别: '${item[3]}', 长度: '${item[4]}'`})
    //     }
    //     console.log(tds)
    //     return tds
    //   }
    // ))
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
const handleRemove = async (selectedRows: recordItem[]) => {
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
    const fetchResponse  = await fetch('http://127.0.0.1:5000/api/deleteRecords', settings)
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


type recordItem = {
  Rid:        number;
  name:      string;
  type:      string;
  gender:    string;
  length:    string;
  priceIn:   number;
  priceOut:  number;
  numberIn:  number;
  numberOut: number;
  payment?:  string;
  note?:     string;
  timestamp: Date;
}

type PageParams = {
  current?: number;
  pageSize?: number;
};

const OutRecords: React.FC = () => {

  const columns: ProColumns<recordItem>[] = [
    {
      title:'记录编号',
      sorter: true,
      dataIndex: 'Rid',
    },
    {
      title:'商品名称',
      sorter: true,
      dataIndex: 'name',
      editable: false,
    },
    {
      title:'种类',
      filters: true,
      dataIndex: 'type',
      editable: false,
      valueEnum: {
        发套: {
          text: '发套',
        },
        发片: {
          text: '发片',
        },
      },
    },
    {
      title:'性别',
      filters: true,
      dataIndex: 'gender',
      editable: false,
      valueEnum: {
        男性: {
          text: '男性',
        },
        女性: {
          text: '女性',
        },
        两者: {
          text: '两者',
        },
      },
    },
    {
      title:'长度',
      sorter: true,
      dataIndex: 'length',
      editable: false,
    },
    {
      title:'状态',
      filters: true,
      dataIndex: 'state',
      valueEnum: {
        已支付: {
          text: '已支付',
          status: '已支付',
        },
        付定金: {
          text: '付定金',
          status: '付定金',
        },
        未支付: {
          text: '未支付',
          status: '未支付',
        },
      },
    },
    {
      title:'销售价',
      sorter: true,
      dataIndex: 'priceOut',
    },
    {
      title:'销售量',
      sorter: true,
      dataIndex: 'numberOut',
    },
    {
      title:'支付方式',
      dataIndex: 'payment',
    },
    {
      title:'备注',
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
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.Rid);
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

  const [existedItem, setExistedItem] = useState<boolean>(false);
  const [itemId, setItemId] = useState<string>('');
  const [treeData, setTreeData] = useState<object[]>([{value: '无', title: '无'}])

  const actionRef = useRef<ActionType>();
  const [currentRow, setCurrentRow] = useState<recordItem>();
  const [selectedRowsState, setSelectedRows] = useState<recordItem[]>([]);
  const [data, setData] = useState<recordItem[]>([]);


  return (
    <>
      {/* <PageContainer> */}
        <ProTable<recordItem, PageParams>
          headerTitle = '记录页'
          columns={columns}
          actionRef={actionRef}
          rowKey="Rid"
          request = {(params, sorter, filter) => {
            let placeholder:recordItem[] = [];
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
              console.log(selectedRows);
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
                getTreeData()
                .then((result:any)=>{
                  setTreeData(result);
                  // console.log(result)
                });
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
          title='添加记录'
          width="800px"
          visible={createModalVisible}
          onVisibleChange={handleModalVisible}
          onFinish={
            async (value) => {
              const success = await handleAdd(value, itemId);
              console.log(success)
            if (success) {
              handleModalVisible(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }
        }
        >
          <Switch
            style={{
              marginBlockEnd: 16,
              
            }}
            checked={existedItem}
            checkedChildren="商品已添加"
            unCheckedChildren="商品未添加"
            onChange={setExistedItem}
          />
          {
            existedItem ? 
            <ProForm.Group>
              <TreeSelect
                showSearch
                style={{ width: 300 }}
                value={itemId}
                dropdownStyle={{ maxHeight: 800, overflow: 'auto' }}
                placeholder="Please select"
                allowClear
                treeDefaultExpandAll
                onChange={(newValue: string) => {
                  setItemId(newValue);
                }}
                treeData={treeData}
              />
              <ProFormSelect width="md" name="state"  label="状态" initialValue = '已支付'
                request={async () => [
                  { label: '已支付', value: '已支付' },
                  { label: '付定金', value: '付定金' },
                  { label: '未支付', value: '未支付' },
                ]}
              />
              <ProFormDigit width="md" name="priceOut" label="销售价" initialValue = '0'/>
              <ProFormDigit width="md" name="numberOut" label="销售量" initialValue = '0'/>
              <ProFormText width="md" name="payment" label="支付方式" initialValue = '未知'/>
              <ProFormText width="md" name="note" label="备注" initialValue = '无'/>
              <ProFormDatePicker width="md" name="timestamp" label="日期时间" rules={[{ required: true, message: '请选择日期!' }]}/>
            </ProForm.Group>
            : 
            <ProForm.Group>
              <ProFormText width="md" name="name" label="名称" initialValue = 'a'/>
              <ProFormText width="md" name="length" label="长度" initialValue = 'b'/>
              <ProFormSelect width="md" name="type"  label="种类" initialValue = '头套'
                request={async () => [
                  { label: '头套', value: '头套' },
                  { label: '发片', value: '发片' },
                ]}
              />
              <ProFormSelect width="md" name="gender"  label="性别" initialValue = '男'
                request={async () => [
                  { label: '男', value: '男' },
                  { label: '女', value: '女' },
                  { label: '两者', value: '两者' },
                ]}
              />
              <ProFormSelect width="md" name="state"  label="状态" initialValue = '已支付'
                request={async () => [
                  { label: '已支付', value: '已支付' },
                  { label: '付定金', value: '付定金' },
                  { label: '未支付', value: '未支付' },
                ]}
              />
              <ProFormDigit width="md" name="priceOut" label="销售价" initialValue = '0'/>
              <ProFormDigit width="md" name="numberOut" label="销售量" initialValue = '0'/>
              <ProFormText width="md" name="payment" label="支付方式" initialValue = '未知'/>
              <ProFormText width="md" name="note" label="备注" initialValue = '无'/>
              <ProFormDatePicker width="md" name="timestamp" label="日期时间" rules={[{ required: true, message: '请选择日期!' }]}/>
          </ProForm.Group>
          }
          {/* <ProForm.Group>
            <ProFormText width="md" name="name" label="名称" initialValue = 'a'/>
            <ProFormText width="md" name="length" label="长度" initialValue = 'b'/>
            <ProFormSelect width="md" name="type"  label="种类" initialValue = '头套'
              request={async () => [
                { label: '头套', value: '头套' },
                { label: '发片', value: '发片' },
              ]}
            />
            <ProFormSelect width="md" name="gender"  label="性别" initialValue = '男'
              request={async () => [
                { label: '男', value: '男' },
                { label: '女', value: '女' },
                { label: '两者', value: '两者' },
              ]}
            />
            <ProFormDigit width="md" name="priceIn" label="进货价" initialValue = '0'/>
            <ProFormDigit width="md" name="priceOut" label="销售价" initialValue = '0'/>
            <ProFormDigit width="md" name="numberIn" label="进货量" initialValue = '0'/>
            <ProFormDigit width="md" name="numberOut" label="销售量" initialValue = '0'/>
            <ProFormText width="md" name="payment" label="支付方式" initialValue = '未知'/>
            <ProFormText width="md" name="note" label="备注" initialValue = '无'/>
            <ProFormDatePicker width="md" name="timestamp" label="日期时间" rules={[{ required: true, message: '请选择日期!' }]}/>
          </ProForm.Group> */}
        </ModalForm>
      {/* </PageContainer> */}
    </>
  );
};

export default OutRecords;