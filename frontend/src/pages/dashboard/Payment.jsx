import { useEffect, useState, useCallback } from 'react';
import { Card, Table, Tag, Button, message, Statistic, Row, Col, Tabs, Input, Space } from 'antd';
import { 
  DollarOutlined, 
  ReloadOutlined, 
  AccountBookOutlined, 
  HistoryOutlined, 
  SearchOutlined,
  UserOutlined 
} from '@ant-design/icons';
import request from '../../utils/request';

const Payment = () => {
  // === 状态管理 ===
  const [activeTab, setActiveTab] = useState('unpaid');
  const [data, setData] = useState([]); // 统一存储当前 Tab 的数据
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState(''); // 搜索关键词

  // 获取当前用户角色，用于 UI 判断
  const userRole = localStorage.getItem('role');

  // === 1. 获取数据逻辑 (使用 useCallback 解决依赖报警) ===
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (activeTab === 'unpaid') {
        // 获取待缴费订单 (后端已根据角色做了分流：患者看自己，挂号员看所有)
        res = await request.get('/dashboard/payment/');
      } else {
        // 获取历史记录
        res = await request.get('/dashboard/payment/history');
      }
      
      // 兼容后端返回格式 (可能是 {data: []} 或 {orders: []})
      const list = res.data || res.orders || [];
      setData(list);
    } catch (error) {
      console.error(error);
      message.error('获取订单数据失败');
    } finally {
      setLoading(false);
    }
  }, [activeTab]); // 依赖 activeTab，切换 Tab 时函数逻辑会变

  // === 2. 监听 Tab 变化自动刷新 (符合 React 规范) ===
  useEffect(() => {
    fetchData();
  }, [fetchData]); // fetchData 变化时执行 (因为 fetchData 依赖 activeTab，所以 Tab 变了也会执行)

  // === 3. 确认收费逻辑 ===
  const handleConfirm = async (orderId) => {
    try {
      await request.post('/dashboard/payment/', { order_id: orderId });
      message.success('收费成功！');
      fetchData(); // 操作成功后刷新列表
    } catch (error) {
      const errorMsg = error.response?.data?.error || '收费失败';
      message.error(errorMsg);
    }
  };

  // === 4. 前端搜索过滤 ===
  // 挂号员可能面对几百条订单，需要前端再次过滤
  const filteredData = data.filter(item => {
    if (!searchText) return true;
    const name = item.patient_name || '';
    // 支持按 姓名 或 订单ID 搜索
    return name.includes(searchText) || String(item.id).includes(searchText);
  });

  // === 5. 表格列定义 ===
  const columns = [
    { 
      title: '订单号', 
      dataIndex: 'id', 
      key: 'id', 
      width: 80,
      render: (text) => <span style={{ color: '#999' }}>#{text}</span>
    },
    { 
      title: '患者姓名', 
      dataIndex: 'patient_name', 
      key: 'patient_name',
      render: (text) => (
        <Space>
          <UserOutlined /> 
          <span style={{ fontWeight: 'bold', color: '#1890ff' }}>{text || '未知'}</span>
        </Space>
      )
    },
    { 
      title: '应收金额', 
      dataIndex: 'total_amount', 
      key: 'total_amount',
      render: (val) => (
        <span style={{ 
          color: activeTab === 'unpaid' ? '#cf1322' : '#389e0d', 
          fontWeight: 'bold',
          fontSize: '16px'
        }}>
          ¥ {val ? val.toFixed(2) : '0.00'}
        </span>
      )
    },
    { 
      title: '状态', 
      dataIndex: 'status', 
      key: 'status',
      render: (status) => (
        <Tag color={status === 'Unpaid' ? 'orange' : 'green'}>
          {status === 'Unpaid' ? '待支付' : '已缴费'}
        </Tag>
      )
    },
    { 
      title: '创建时间', 
      dataIndex: 'created_at', 
      key: 'created_at',
      render: (text) => new Date(text).toLocaleString()
    },
  ];

  // 只有在“待缴费”Tab 下，且显示操作按钮
  if (activeTab === 'unpaid') {
    columns.push({
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Button 
          type="primary" 
          size="small"
          icon={<DollarOutlined />}
          onClick={() => handleConfirm(record.id)}
        >
          {userRole === 'general_user' ? '立即支付' : '确认收款'}
        </Button>
      )
    });
  }

  // === Tab 配置 ===
  const tabItems = [
    { key: 'unpaid', label: <span><AccountBookOutlined /> 待缴费订单</span> },
    { key: 'history', label: <span><HistoryOutlined /> 历史缴费记录</span> }
  ];

  // 计算总金额 (用于顶部统计)
  const totalAmount = filteredData.reduce((sum, item) => sum + (item.total_amount || 0), 0);

  return (
    <div>
      {/* 顶部统计栏 */}
      <Row gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={8}>
          <Card size="small">
            <Statistic 
              title={activeTab === 'unpaid' ? "当前待处理总额" : "历史已收总额"}
              value={totalAmount}
              precision={2}
              prefix={<DollarOutlined />}
              // 🔥 修复: 使用 formatter 代替 valueStyle，或者直接给 div 样式
              formatter={(value) => <span style={{ color: activeTab === 'unpaid' ? '#cf1322' : '#389e0d' }}>{value}</span>}
            />
          </Card>
        </Col>
      </Row>

      <Card 
        title={userRole === 'general_user' ? "💰 我的缴费单" : "🏥 医院收银台"}
        extra={
          <Space>
            {/* 搜索框：方便挂号员查找 */}
            <Input 
              prefix={<SearchOutlined />} 
              placeholder="搜索姓名或订单号" 
              onChange={e => setSearchText(e.target.value)} 
              style={{ width: 200 }}
              allowClear
            />
            <Button icon={<ReloadOutlined />} onClick={fetchData}>刷新</Button>
          </Space>
        }
      >
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab} 
          items={tabItems} 
        />
        
        <Table 
          rowKey="id" 
          dataSource={filteredData} 
          columns={columns} 
          loading={loading}
          pagination={{ pageSize: 6 }} 
        />
      </Card>
    </div>
  );
};

export default Payment;