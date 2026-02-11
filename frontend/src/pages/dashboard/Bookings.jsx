import { useEffect, useState } from "react";
import {
  Table,
  Card,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  Tag,
  message,
} from "antd";
import {
  PlusOutlined,
  UserOutlined,
  MedicineBoxOutlined,
} from "@ant-design/icons";
import request from "../../utils/request";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [doctors, setDoctors] = useState([]); // 存储所有从后端获取的医生
  const [filteredDoctors, setFilteredDoctors] = useState([]); // 🔥 存储当前选中科室下的医生
  const [selectedDept, setSelectedDept] = useState(null); // 当前选中的科室

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const userRole = localStorage.getItem("role");
  const currentUsername = localStorage.getItem("username");

  // 科室静态列表 (需要与 Users.jsx 保持一致，或者从后端获取)
  const departmentOptions = [
    { label: "内科 (Internal Med)", value: "内科" },
    { label: "外科 (Surgery)", value: "外科" },
    { label: "儿科 (Pediatrics)", value: "儿科" },
    { label: "骨科 (Orthopedics)", value: "骨科" },
    { label: "急诊 (Emergency)", value: "急诊" },
  ];

  // 1. 获取挂号列表
  const fetchBookings = async () => {
    try {
      const res = await request.get("/dashboard/bookings");
      setBookings(res.data || []);
    } catch (error) {
      console.error(error);
      message.error("获取列表失败");
    }
  };

  // 2. 获取医生列表 (包含 department 字段)
  const fetchDoctors = async () => {
    try {
      const res = await request.get("/dashboard/doctors");
      setDoctors(res.data || []);
    } catch (error) {
      console.error("获取医生列表失败", error);
    }
  };

  useEffect(() => {
    const initData = async () => {
      try {
        await Promise.all([fetchBookings(), fetchDoctors()]);
      } catch (err) {
        console.error("初始化数据失败:", err);
      }
    };
    initData();
  }, []);

  // 3. 处理科室变化 (级联逻辑核心)
  const handleDepartmentChange = (value) => {
    setSelectedDept(value);
    // 过滤出该科室的医生
    const targetDocs = doctors.filter((doc) => doc.department === value);
    setFilteredDoctors(targetDocs);

    // 清空已选医生，防止逻辑冲突
    form.setFieldsValue({ doctor_id: null });
  };

  // 打开弹窗
  const handleOpenModal = () => {
    setIsModalOpen(true);
    // 重置级联状态
    setSelectedDept(null);
    setFilteredDoctors([]);

    // 如果是普通用户，强制填入自己的名字
    if (userRole === "general_user") {
      form.setFieldsValue({ patient_name: currentUsername });
    }
  };

  // 提交挂号
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      await request.post("/dashboard/bookings", values);
      message.success("🎉 挂号成功！");
      setIsModalOpen(false);
      form.resetFields();
      fetchBookings();
    } catch (error) {
      console.error(error);
    }
  };

  const columns = [
    { title: "挂号ID", dataIndex: "id", key: "id" },
    {
      title: "患者姓名",
      dataIndex: "patient_name",
      key: "patient_name",
      render: (t) => <b>{t}</b>,
    },
    { title: "年龄", dataIndex: "age", key: "age" },
    { title: "性别", dataIndex: "gender", key: "gender" },
    {
      title: "科室",
      dataIndex: "department",
      key: "department",
      render: (t) => <Tag color="blue">{t}</Tag>,
    },
    {
      title: "指定医生",
      dataIndex: "doctor_id",
      key: "doctor_id",
      render: (id) => {
        const doc = doctors.find((d) => d.id === id);
        return doc ? (
          <Tag icon={<MedicineBoxOutlined />} color="cyan">
            {doc.username}
          </Tag>
        ) : (
          "未指定"
        );
      },
    },
    {
      title: "状态",
      dataIndex: "status",
      key: "status",
      render: (t) => (
        <Tag color={t === "Pending" ? "orange" : "green"}>
          {t === "Pending" ? "候诊中" : "已就诊"}
        </Tag>
      ),
    },
    {
      title: "挂号时间",
      dataIndex: "created_at",
      key: "created_at",
      render: (t) => new Date(t).toLocaleString(),
    },
  ];

  return (
    <Card
      title="🏥 门诊挂号大厅"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenModal}
        >
          {userRole === "general_user" ? "我要挂号" : "现场挂号登记"}
        </Button>
      }
    >
      <Table rowKey="id" dataSource={bookings} columns={columns} />

      <Modal
        title="填写挂号单"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="patient_name"
            label="患者姓名"
            rules={[{ required: true }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="请输入姓名"
              disabled={userRole === "general_user"}
            />
          </Form.Item>

          <Form.Item name="gender" label="性别" rules={[{ required: true }]}>
            <Select
              options={[
                { label: "男", value: "男" },
                { label: "女", value: "女" },
              ]}
            />
          </Form.Item>
          <Form.Item name="age" label="年龄" rules={[{ required: true }]}>
            <InputNumber min={1} max={120} style={{ width: "100%" }} />
          </Form.Item>

          {/* 步骤1：先选科室 */}
          <Form.Item
            name="department"
            label="挂号科室"
            rules={[{ required: true, message: "请先选择科室" }]}
          >
            <Select
              placeholder="请选择科室"
              onChange={handleDepartmentChange}
              options={departmentOptions}
            />
          </Form.Item>

          {/* 步骤2：再选医生 (根据科室过滤) */}
          <Form.Item
            name="doctor_id"
            label="选择医生"
            rules={[{ required: true, message: "请选择医生" }]}
          >
            <Select
              placeholder={
                selectedDept ? "请选择就诊医生" : "🚫 请先选择上方的科室"
              }
              disabled={!selectedDept} // 没选科室前禁用
              options={filteredDoctors.map((doc) => ({
                label: `${doc.username} (ID: ${doc.id})`,
                value: doc.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default Bookings;
