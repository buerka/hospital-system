import { useEffect, useState } from 'react';
import { Table, Card, Tag, message, Avatar, Button, Popconfirm } from 'antd';
import { UserOutlined, DeleteOutlined } from '@ant-design/icons';
import request from '../../utils/request';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await request.get('/dashboard/users');
      setUsers(res.data || []);
    } catch (error) {
      message.error('获取人员名单失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleDelete = async (id) => {
    try {
        await request.delete(`/dashboard/users/${id}`);
        message.success('删除成功');
        fetchUsers(); 
    } catch (error) {
        console.error(error);
        message.error('删除失败，可能权限不足或接口未重启');
    }
  };

  const roleColors = {
    'global_admin': 'magenta', 'org_admin': 'red', 'doctor': 'blue',
    'nurse': 'cyan', 'registration': 'cyan', 'finance': 'gold',
    'storekeeper': 'purple', 'general_user': 'default'
  };

  const roleNames = {
    'global_admin': '超级管理员', 'org_admin': '院区负责人', 'doctor': '医生',
    'nurse': '护士', 'registration': '挂号员', 'finance': '财务',
    'storekeeper': '库管员', 'general_user': '患者/普通用户'
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: '头像', key: 'avatar', render: () => <Avatar icon={<UserOutlined />} /> },
    { title: '用户名', dataIndex: 'username', key: 'username', render: text => <b>{text}</b> },
    { title: '角色身份', dataIndex: 'role', key: 'role', render: role => <Tag color={roleColors[role] || 'default'}>{roleNames[role] || role}</Tag> },
    { title: '注册时间', dataIndex: 'created_at', key: 'created_at', render: t => t ? new Date(t).toLocaleDateString() : '-' },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Popconfirm title={`确定要删除用户 "${record.username}" 吗？`} onConfirm={() => handleDelete(record.id)} okText="删除" cancelText="取消">
            <Button danger type="text" icon={<DeleteOutlined />}>删除</Button>
        </Popconfirm>
      )
    }
  ];

  return (
    <Card title="👥 医院人员编制管理">
      <Table rowKey="id" dataSource={users} columns={columns} loading={loading} />
    </Card>
  );
};
export default Users;