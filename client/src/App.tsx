// import {
//   GithubFilled,
//   InfoCircleFilled,
//   QuestionCircleFilled,
// } from '@ant-design/icons';
import { PageContainer, ProCard, ProLayout } from "@ant-design/pro-components";
import { useState } from "react";
// import { Routes, Route } from "react-router-dom";
// import dashboard from './pages/dashboard';
import Dashboard from "./pages/dashboard";
import Items from "./pages/items";
import InRecords from "./pages/records/inRecords";
import OutRecords from "./pages/records/outRecords";
import MoneyIn from "./pages/other/in";
import MoneyOut from "./pages/other/out";
import avatar from "./avatar.jpg";

const defaultProps = {
    route: {
        path: "/",
        routes: [
            {
                path: "/dashboard",
                name: "总结",
                component: <Dashboard />,
            },
            {
                path: "/items",
                name: "商品",
                component: <Items />,
            },
            {
                path: "/records",
                name: "记录",
                routes: [
                    {
                        path: "/records/in",
                        name: "进货",
                        component: <InRecords />,
                    },
                    {
                        path: "/records/out",
                        name: "出库",
                        component: <OutRecords />,
                    },
                ],
            },
            {
                path: "/other",
                name: "其他收支",
                routes: [
                    {
                        path: "/other/in",
                        name: "收入",
                        component: <MoneyIn />,
                    },
                    {
                        path: "/other/out",
                        name: "支出",
                        component: <MoneyOut />,
                    },
                ],
            },
        ],
    },
};

const App = () => {
    const [pathname, setPathname] = useState("/dashboard");
    const [component, setComponent] = useState(<Dashboard />);
    
    return (
        <div
            id="test-pro-layout"
            style={{
                height: "100vh",
            }}
        >
            <ProLayout
                title={"店铺管理系统"}
                siderWidth={186}
                {...defaultProps}
                location={{
                    pathname,
                }}
                avatarProps={{
                    src: avatar,
                    title: "世臻",
                    size: "small",
                }}
                menuItemRender={(item: any, dom: any) => (
                    <div
                        onClick={() => {
                            setPathname(item.path || "/dashboard");
                            setComponent(item.component);
                            // console.log(item.path)
                        }}
                    >
                        {dom}
                    </div>
                )}
            >
                <PageContainer>
                    <ProCard
                        style={{
                            height: "100vh",
                            minHeight: 800,
                        }}
                    >
                        {component}
                    </ProCard>
                </PageContainer>
            </ProLayout>
        </div>
    );
};

export default App;
