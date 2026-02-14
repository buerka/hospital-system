import { useEffect, useState } from 'react';
import { Card, Col, Row, Statistic, Alert } from 'antd';
import { UserOutlined, MedicineBoxOutlined, AccountBookOutlined, TeamOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const Overview = () => {
  const [stats, setStats] = useState({ income: 0, patients: 0, doctors: 0, meds: 0 });
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const role = user.role || 'general_user';

  const fetchStats = async () => {
    try {
      if (role !== 'general_user') {
        const res = await request.get('/dashboard/stats');
        setStats(res); 
      }
    } catch (error) {
      console.error("获取统计失败", error);
    }
  };

  useEffect(() => { fetchStats(); }, []);

  const WelcomeCard = () => (
    <Card style={{ marginTop: 20, textAlign: 'center', height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>
            <h1 style={{ color: '#1890ff' }}>Welcome, {user.username}!</h1>
            <p style={{ color: '#999' }}>当前身份：{role} | 祝您工作愉快</p>
        </div>
    </Card>
  );

  const IncomeCard = () => (
    <Col span={6}>
      <Card hoverable>
        <Statistic title="累计营收 (Total Income)" value={stats.income} precision={2} valueStyle={{ color: '#3f8600', fontWeight: 'bold' }} prefix={<AccountBookOutlined />} suffix="元" />
      </Card>
    </Col>
  );

  const PatientCard = () => (
    <Col span={6}>
      <Card hoverable>
        <Statistic title="接诊患者 (Patients)" value={stats.patients} valueStyle={{ color: '#1890ff' }} prefix={<UserOutlined />} suffix="人次" />
      </Card>
    </Col>
  );

  const MedicineCard = () => (
    <Col span={6}>
      <Card hoverable>
        <Statistic title="药品库存种类 (Medicines)" value={stats.meds} prefix={<MedicineBoxOutlined />} suffix="种" />
      </Card>
    </Col>
  );

  const DoctorCard = () => (
    <Col span={6}>
      <Card hoverable>
        <Statistic title="在岗医生 (Doctors)" value={stats.doctors} prefix={<TeamOutlined />} suffix="人" />
      </Card>
    </Col>
  );

  const renderCardsByRole = () => {
    if (role === 'global_admin' || role === 'org_admin') return <>{IncomeCard()}{PatientCard()}{DoctorCard()}{MedicineCard()}</>;
    if (role === 'finance' || role === 'money') return <>{IncomeCard()}</>;
    if (role === 'doctor' || role === 'doc') return <>{PatientCard()}{MedicineCard()}</>;
    if (role === 'storekeeper' || role === 'store') return <>{MedicineCard()}</>;
    if (role === 'registration' || role === 'nurse') return <>{PatientCard()}</>;
    
    if (role === 'general_user') {
      return (
        <Col span={12}>
          <Card title="🎓 我的服务" bordered={false} hoverable>
             <p style={{ fontSize: '16px' }}>您好，欢迎使用智慧医疗自助服务。</p>
             <p style={{ color: '#666' }}>您可以点击左侧菜单进行 <b style={{ color: '#1890ff', margin: '0 5px' }}>预约挂号</b> 或 <b style={{ color: '#52c41a', margin: '0 5px' }}>查询/缴纳账单</b>。</p>
          </Card>
        </Col>
      );
    }
    return <Col span={24}><Alert message="暂无数据权限" type="info" showIcon /></Col>;
  };

  return (
    <div className="site-statistic-demo-card">
      <h2 style={{ marginBottom: 20 }}>📊 运营概览 (Role: {role})</h2>
      <Row gutter={16}>{renderCardsByRole()}</Row>
      <WelcomeCard />
    </div>
  );
};
export default Overview;