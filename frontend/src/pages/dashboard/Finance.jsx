import { useEffect, useState } from "react";
import {
    Card,
    Row,
    Col,
    Statistic,
    Table,
    Progress,
    Button,
    Tag,
    Divider,
    DatePicker,
    Space,
} from "antd";
import {
    BankOutlined,
    RiseOutlined,
    TransactionOutlined,
    PieChartOutlined,
    DownloadOutlined,
} from "@ant-design/icons";
import request from "../../utils/request";

const Finance = () => {
    const [stats, setStats] = useState({
        total_income: 0,
        today_income: 0,
        order_count: 0,
        avg_transaction: 0,
    });
    const [deptData, setDeptData] = useState([]);
    const [loading, setLoading] = useState(false);

    // 获取数据
    const fetchData = async () => {
        setLoading(true);
        try {
            const [statsRes, deptRes] = await Promise.all([
                request.get("/dashboard/finance/stats"),
                request.get("/dashboard/finance/dept_stats"),
            ]);
            setStats(statsRes || {});
            setDeptData(deptRes.data || []);
        } catch (error) {
            console.error("获取财务数据失败", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // 模拟导出报表
    const handleExport = () => {
        const csvContent =
            "data:text/csv;charset=utf-8,科室,营收\n" +
            deptData.map((e) => `${e.department},${e.total}`).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "financial_report.csv");
        document.body.appendChild(link);
        link.click();
    };

    // 科室营收表格列定义
    const deptColumns = [
        {
            title: "排名",
            key: "index",
            render: (_, __, index) => (
                <Tag color={index < 3 ? "gold" : "default"}>{index + 1}</Tag>
            ),
            width: 80,
        },
        {
            title: "科室名称",
            dataIndex: "department",
            key: "department",
            render: (t) => <b>{t}</b>,
        },
        {
            title: "营收贡献度",
            key: "percent",
            width: 300,
            render: (_, record) => {
                // 修复：删除了未使用的 max 变量
                // 计算百分比：该科室收入 / 总收入
                const percent =
                    stats.total_income > 0
                        ? (record.total / stats.total_income) * 100
                        : 0;

                return (
                    <Progress
                        percent={percent.toFixed(1)}
                        size="small"
                        status="active"
                        strokeColor="#1890ff"
                    />
                );
            },
        },
        {
            title: "累计营收",
            dataIndex: "total",
            key: "total",
            render: (t) => `¥ ${t.toFixed(2)}`,
        },
    ];

    return (
        <div style={{ padding: "0 12px" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 16,
                }}
            >
                <h2 style={{ margin: 0 }}>📈 财务分析驾驶舱 (Financial Analysis)</h2>
                <Space>
                    <DatePicker.RangePicker />
                    <Button
                        type="primary"
                        icon={<DownloadOutlined />}
                        onClick={handleExport}
                    >
                        导出月报
                    </Button>
                </Space>
            </div>

            {/* 1. 核心指标卡片 */}
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        className="finance-card"
                        style={{
                            border: "none",
                            background: "linear-gradient(135deg, #3023AE 0%, #C86DD7 100%)",
                        }}
                    >
                        <Statistic
                            title={
                                <span style={{ color: "rgba(255,255,255,0.8)" }}>
                                    累计总营收 (Total Revenue)
                                </span>
                            }
                            value={stats.total_income}
                            precision={2}
                            prefix={<BankOutlined />}
                            suffix="元"
                            // 修复：使用 formatter 代替 valueStyle
                            formatter={(value) => (
                                <span style={{ color: "#fff", fontWeight: "bold" }}>
                                    {value}
                                </span>
                            )}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card
                        className="finance-card"
                        style={{
                            border: "none",
                            background: "linear-gradient(135deg, #108ee9 0%, #87d068 100%)",
                        }}
                    >
                        <Statistic
                            title={
                                <span style={{ color: "rgba(255,255,255,0.8)" }}>
                                    今日营收 (Today)
                                </span>
                            }
                            value={stats.today_income}
                            precision={2}
                            prefix={<RiseOutlined />}
                            suffix="元"
                            formatter={(value) => (
                                <span style={{ color: "#fff", fontWeight: "bold" }}>
                                    {value}
                                </span>
                            )}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ border: "none" }}>
                        <Statistic
                            title="总交易笔数"
                            value={stats.order_count}
                            prefix={<TransactionOutlined />}
                            formatter={(value) => (
                                <span style={{ color: "#3f8600" }}>{value}</span>
                            )}
                        />
                    </Card>
                </Col>
                <Col xs={24} sm={12} lg={6}>
                    <Card style={{ border: "none" }}>
                        <Statistic
                            title="平均客单价 (ATV)"
                            value={stats.avg_transaction}
                            precision={2}
                            prefix="¥"
                            formatter={(value) => (
                                <span style={{ color: "#cf1322" }}>{value}</span>
                            )}
                        />
                    </Card>
                </Col>
            </Row>

            <Divider />

            {/* 2. 详细数据分析区域 */}
            <Row gutter={24}>
                {/* 左侧：科室营收排行榜 */}
                <Col xs={24} lg={16}>
                    <Card
                        title={
                            <span>
                                <PieChartOutlined /> 科室创收贡献排行
                            </span>
                        }
                        style={{ border: "none" }}
                    >
                        <Table
                            rowKey="department"
                            dataSource={deptData}
                            columns={deptColumns}
                            pagination={false}
                            loading={loading}
                        />
                    </Card>
                </Col>

                {/* 右侧：快速操作或公告 */}
                <Col xs={24} lg={8}>
                    <Card
                        title="财务公告 / 待办事项"
                        style={{ height: "100%", border: "none" }}
                    >
                        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                            <Tag color="red" style={{ padding: 10, fontSize: 14 }}>
                                ⚠️ 待审核退款申请: 0 笔
                            </Tag>
                            <Tag color="orange" style={{ padding: 10, fontSize: 14 }}>
                                ⚠️ 药品库存盘点差异预警
                            </Tag>
                            <Tag color="blue" style={{ padding: 10, fontSize: 14 }}>
                                ℹ️ 上月税务申报已完成
                            </Tag>

                            <Divider dashed />
                            <p style={{ color: "#999" }}>
                                系统提示：请每日下班前核对“今日营收”与实际收款账户余额是否一致。
                            </p>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Finance;