import { Col, Row, Statistic, Card, Tabs, DatePicker } from "antd";
import React, { useState, useEffect } from "react";
import { Column } from "@ant-design/charts";

const getItems = async () => {
    try {
        const fetchResponse = await fetch(
            "http://127.0.0.1:5000/api/getSummary"
        );
        const data = await fetchResponse.json();
        // console.log(data);

        return data;
    } catch (e) {
        return console.log(e);
    }
};

const getSaleByMonth = async () => {
    try {
        const fetchResponse = await fetch(
            "http://127.0.0.1:5000/api/getSaleByMonth"
        );
        const data = await fetchResponse.json();

        return data;
    } catch (e) {
        return console.log(e);
    }
};

const getMonthData = async (param: string) => {
    try {
        const settings = {
            method: "POST",
            headers: {
                "Content-Type": "application/json;charset=utf-8",
            },
            body: JSON.stringify({ month: param }),
        };

        // console.log(param)
        const fetchResponse = await fetch(
            "http://127.0.0.1:5000/api/getMonthData",
            settings
        );
        const data = await fetchResponse.json();
        console.log(data)
        return data;
    } catch (e) {
        return console.log(e);
    }
};

const { TabPane } = Tabs;

const Dashboard: React.FC = () => {
    const [summaryData, setData] = useState([]);
    const [monthData, setMonthData] = useState([]);
    const [plotData, setPlotData] = useState([]);

    useEffect(() => {
        // 定义一个异步函数以获取数据
        const fetchData = async () => {
            try {
                const result = await getItems(); // 假设 getItems() 返回一个 Promise
                const saleMonth = await getSaleByMonth(); // 假设 getItems() 返回一个 Promise
                setPlotData(saleMonth);
                setData(result);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };

        // 调用 fetchData 函数
        fetchData();
    }, []); // 传递空的依赖项数组以确保只在组件首次渲染后执行

    const config = {
        data: plotData,
        xField: "年月",
        yField: "销售额",
        xAxis: {
            label: {
                autoRotate: false,
            },
        },
        slider: {
            start: 0.1,
            end: 0.2,
        },
    };

    return (
        <>
            <Card>
                <Row gutter={16}>
                    <Col span={8}>
                        <Statistic
                            title="总支出"
                            value={summaryData[0]}
                            precision={2}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="总收入"
                            value={summaryData[1]}
                            precision={2}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic title="总库存" value={summaryData[2]} />
                    </Col>
                </Row>
            </Card>

            <Card bordered={false} bodyStyle={{ padding: 0 }}>
                <Row>
                    <Col xl={18} lg={12} md={12} sm={24} xs={24}>
                        <Tabs size="large" tabBarStyle={{ marginBottom: 24 }}>
                            <TabPane tab="销售额" key="sales">
                                <Column {...config} />
                            </TabPane>
                        </Tabs>
                    </Col>
                    <Col xl={6} lg={12} md={12} sm={24} xs={24}>
                        <br />
                        <DatePicker
                            picker="month"
                            onChange={(value, dateString) => {
                                getMonthData(dateString).then((result) =>
                                    setMonthData(result)
                                );
                                // setMonthData(result)
                            }}
                        />
                        <br />
                        <br />
                        <Row gutter={16}>
                            <Statistic
                                title="月支出"
                                value={monthData[0]}
                                precision={2}
                            />
                        </Row>
                        <Row gutter={16}>
                            <Statistic
                                title="月收入"
                                value={monthData[1]}
                                precision={2}
                            />
                        </Row>
                        <Row gutter={16}>
                            <Statistic
                                title="月收支总和"
                                value={monthData[1] - monthData[0]}
                                precision={2}
                            />
                        </Row>
                        <Row gutter={16}>
                            <Statistic title="月进货量" value={monthData[2]} />
                        </Row>
                        <Row gutter={16}>
                            <Statistic title="月销售量" value={monthData[3]} />
                        </Row>
                    </Col>
                </Row>
            </Card>
        </>
    );
};

export default Dashboard;
