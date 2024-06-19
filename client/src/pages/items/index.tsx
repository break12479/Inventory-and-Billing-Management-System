import { PlusOutlined } from '@ant-design/icons';
import type { ActionType, ProColumns, ProDescriptionsItemProps } from '@ant-design/pro-components';
import {
    FooterToolbar,
    ModalForm,
    PageContainer,
    ProFormText,
    ProTable,
    ProFormDigit,
    ProDescriptions,
    ProFormSelect,
    ProForm,
    ProFormDatePicker
} from '@ant-design/pro-components';
import { Button, Drawer, Input, message } from 'antd';
import React, { useRef, useState } from 'react';
import Records from "../records/";
/**
 * @en-US Add node
 * @zh-CN 添加节点
 * @param fields
 */
const handleAdd = async (fields: any) => {
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
        // console.log(fields)
        const fetchResponse  = await fetch('http://127.0.0.1:5000/api/createItem', settings)
        const data = await fetchResponse.json();
        console.log(data)
        if (data.error && data.error == 'Item with the same name already exists'){
            message.error('商品已存在');
        }
        else{
            message.success('商品添加成功');
        }

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
        const fetchResponse  = await fetch('http://127.0.0.1:5000/api/updateItem', settings)
        const data = await fetchResponse.json();

        message.success('商品编辑成功');
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

    const keys = ['Iid','name','type','gender','length','priceIn','priceOut', 'stock']
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
  // console.log(param)

    let query = `
    SELECT
    Item.id as Iid,
    Item.name as name,
    Item.type as type,
    Item.gender as gender,
    Item.length as length,
    COALESCE(SUM(Record.priceIn * Record.numberIn), 0) AS priceIn,
    COALESCE(SUM(Record.priceOut * Record.numberOut), 0) AS priceOut,
    COALESCE(SUM(Record.numberIn), 0) - COALESCE(SUM(Record.numberOut), 0) AS stock
    FROM
        Item
    LEFT JOIN
        Record ON Item.id = Record.itemId
    `;
    if (where) {
        query += 'WHERE ' + where;
    }
    query += `
    GROUP BY Item.id, Item.name, Item.type, Item.gender, Item.length
    `
    if (order) {
        query += 'ORDER BY ' + order;
    }
    query += ';'
    try{
        const fetchResponse  = await fetch('http://127.0.0.1:5000/api/getItems?query_param='+ query)
        const data = await fetchResponse.json();
        
        let records = data.result
        let result = []
        for (let i = 0; i < records.length; i += 1) {
            let item: any = {}
            item['Iid'] = records[i][0]
            item['name'] = records[i][1]
            item['type'] = records[i][2]
            item['gender'] = records[i][3]
            item['length'] = records[i][4]
            item['priceIn'] = records[i][5]
            item['priceOut'] = records[i][6]
            item['stock'] = records[i][7]
            result.push({...item})
        }
        return result
    }
    catch(e){
        return console.log(e)
    }  
};


const getRecordsById = async (param: any) => {
    const keys = [
        "Rid",
        "name",
        "type",
        "gender",
        "length",
        "priceIn",
        "priceOut",
        "numberIn",
        "numberOut",
        "payment",
        "note",
        "timestamp",
    ];

    
    let where: string = "Item.id = " + param;
    
    
    let query = `
    SELECT
        Item.id,
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
        query += "WHERE " + where;
    }

    query += ";";
    // console.log(query)
    try {
        const fetchResponse = await fetch(
            "http://127.0.0.1:5000/api/getItems?query_param=" + query
        );
        const data = await fetchResponse.json();
        // console.log(data);
        let records = data.result;
        let result = [];
        for (let i = 0; i < records.length; i += 1) {
            let item: any = {};
            item["Iid"] = records[i][0];
            item["Rid"] = records[i][1];
            item["name"] = records[i][2];
            item["type"] = records[i][3];
            item["gender"] = records[i][4];
            item["length"] = records[i][5];
            item["state"] = records[i][6];
            item["priceIn"] = records[i][7];
            item["priceOut"] = records[i][8];
            item["numberIn"] = records[i][9];
            item["numberOut"] = records[i][10];
            item["payment"] = records[i][11];
            item["note"] = records[i][12];
            item["timestamp"] = records[i][13];
            result.push({ ...item });
        }
        // console.log(result)
        return result;
    } catch (e) {
        return console.log(e);
    }
};

const updateRecords = async (fields: any) => {
    const hide = message.loading("正在添加");
    try {
        hide();
        const settings = {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify(fields),
        };

        console.log(fields);
        const fetchResponse = await fetch(
            "http://127.0.0.1:5000/api/updateRecord",
            settings
        );
        const data = await fetchResponse.json();

        message.success("记录编辑成功");
        console.log(data);
        return true;
    } catch (error) {
        hide();
        console.log(error);
        message.error("编辑失败，请重新尝试！");
        return false;
    }
};

const removeRecords = async (selectedRows: recordItem[]) => {
    const hide = message.loading("正在删除");
    if (!selectedRows) return true;

    const settings = {
        method: "POST",
        headers: {
            "Content-Type": "application/json;charset=utf-8",
        },
        body: JSON.stringify(selectedRows),
    };

    try {
        const fetchResponse = await fetch(
            "http://127.0.0.1:5000/api/deleteRecords",
            settings
        );
        const data = await fetchResponse.json();
        hide();
        message.success("删除成功");
        return true;
    } catch (error) {
        hide();
        message.error("删除失败");
        return false;
    }
};

/**
 *  Delete node
 * @zh-CN 删除节点
 *
 * @param selectedRows
 */
const handleRemove = async (selectedRows: item[]) => {
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
        const fetchResponse  = await fetch('http://127.0.0.1:5000/api/deleteItems', settings)
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


type item = {
    Iid:        number;
    name:      string;
    type:      string;
    gender:    string;
    length:    string;
    priceIn:   number;
    priceOut:  number;
    stock:     number;
}

type recordItem = {
    Iid: number;
    Rid: number;
    name: string;
    type: string;
    gender: string;
    length: string;
    state: string;
    priceIn: number;
    priceOut: number;
    numberIn: number;
    numberOut: number;
    payment?: string;
    note?: string;
    timestamp: Date;
};

type PageParams = {
    current?: number;
    pageSize?: number;
};

const Items: React.FC = () => {

    const columns: ProColumns<item>[] = [
        {
        title:'商品编号',
        sorter: true,
        dataIndex: 'Iid',
        editable: false,
        render: (dom, entity) => {
            return (
                <a
                    onClick={() => {
                        setCurrentRow(entity);
                        setShowDetail(true);
                    }}
                >
                {dom}
                </a>
                );
            },
        },
        {
        title:'商品名称',
        sorter: true,
        dataIndex: 'name',
        },
        {
        title:'种类',
        filters: true,
        dataIndex: 'type',
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
        },
        {
        title:'总支出',
        sorter: true,
        dataIndex: 'priceIn',
        editable: false,
        },
        {
        title:'总收入',
        sorter: true,
        dataIndex: 'priceOut',
        editable: false,
        },
        {
        title:'库存',
        sorter: true,
        dataIndex: 'stock',
        editable: false,
        },
        {
        title: '操作',
        valueType: 'option',
        key: 'option',
        render: (text, item, _, action) => [
            <a
            key="editable"
            onClick={() => {
                action?.startEditable?.(item.Iid);
            }}
            >
            编辑
            </a>
        ],
        },
    ]

    const recordsColumn: ProColumns<recordItem>[] = [
        {
            title:'商品编号',
            sorter: true,
            dataIndex: 'Iid',
        },
        {
            title: "记录编号",
            sorter: true,
            dataIndex: "Rid",
        },
        {
            title: "商品名称",
            sorter: true,
            dataIndex: "name",
        },
        {
            title: "种类",
            filters: true,
            dataIndex: "type",
            valueEnum: {
                发套: {
                    text: "发套",
                },
                发片: {
                    text: "发片",
                },
            },
        },
        {
            title: "性别",
            filters: true,
            dataIndex: "gender",
            valueEnum: {
                男性: {
                    text: "男性",
                },
                女性: {
                    text: "女性",
                },
                两者: {
                    text: "两者",
                },
            },
        },
        {
            title: "长度",
            sorter: true,
            dataIndex: "length",
        },
        {
            title: "状态",
            filters: true,
            dataIndex: "state",
            valueEnum: {
                已支付: {
                    text: "已支付",
                    status: "已支付",
                },
                付定金: {
                    text: "付定金",
                    status: "付定金",
                },
                未支付: {
                    text: "未支付",
                    status: "未支付",
                },
            },
        },
        {
            title: "进货价",
            sorter: true,
            dataIndex: "priceIn",
        },
        {
            title: "进货量",
            sorter: true,
            dataIndex: "numberIn",
        },
        {
            title: "支付方式",
            dataIndex: "payment",
        },
        {
            title: "备注",
            dataIndex: "note",
        },
        {
            title: "日期",
            sorter: true,
            dataIndex: "timestamp",
            valueType: "date",
            fieldProps: {
                format: "YYYY-MM-DD",
            },
        },
        {
            title: "操作",
            valueType: "option",
            key: "option",
            render: (text, record, _, action) => [
                <a
                    key="editable"
                    onClick={() => {
                        action?.startEditable?.(record.Rid);
                    }}
                >
                    编辑
                </a>,
            ],
        },
    ];

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
    const [currentRow, setCurrentRow] = useState<item>();
    const [selectedRowsState, setSelectedRows] = useState<item[]>([]);
    const [data, setData] = useState<item[]>([]);
    const [recordbyid, setrecordbyid] = useState<recordItem[]>([]);
    const [selectedrecordRowsState, setselectedrecordRowsState] = useState<recordItem[]>([]);

    
    return (
    <>
      {/* <PageContainer> */}
        <ProTable<item, PageParams>
            headerTitle = '商品页'
            columns={columns}
            actionRef={actionRef}
            rowKey="Iid"
            request = {(params, sorter, filter) => {
                let placeholder:item[] = [];
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
                onChange: (_: any, selectedRows: any) => {
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
              {/* <FormattedMessage id="pages.searchTable.chosen" value="Chosen" /> */}
                <a>已选</a>
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
            </ProForm.Group>
        </ModalForm>
        <Drawer
            width={1200}
            open={showDetail}
            onClose={() => {
            setCurrentRow(undefined);
            setShowDetail(false);
            actionRef.current?.reloadAndRest?.();
            }}
        >

            {currentRow?.name && <Records Iid={currentRow.Iid}/>}
           
        </Drawer>
      {/* </PageContainer> */}
    </>
    );
};

export default Items;