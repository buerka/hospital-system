import { useState } from "react";
import {
    Form,
    Input,
    Button,
    Card,
    Typography,
    message,
    Row,
    Col,
    Alert,
} from "antd";
import {
    UserOutlined,
    LockOutlined,
    ArrowLeftOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import request from "../utils/request";

const { Title, Text } = Typography;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const [loginError, setLoginError] = useState(null);
    const [failCount, setFailCount] = useState(0);
    const navigate = useNavigate();

    // 提交登录表单
    const onFinish = async (values) => {
        setLoading(true);
        setLoginError(null);
        try {
            const { token, user } = await request.post("/login", values);

            localStorage.setItem("token", token);
            localStorage.setItem("role", user.role);
            localStorage.setItem("username", user.username);

            message.success("登录成功");
            setFailCount(0);

            // 根据角色跳转逻辑保持不变
            if (user.role === "registration") {
                navigate("/dashboard/bookings");
            } else {
                navigate("/dashboard/overview");
            }
        } catch (error) {
            const newFailCount = failCount + 1;
            setFailCount(newFailCount);

            const errorMsg =
                error.response?.data?.error || "用户名或密码错误，请重试";
            const hint =
                newFailCount >= 3
                    ? "多次登录失败，请确认您的用户名和密码是否正确，或联系管理员重置密码。"
                    : null;

            setLoginError({ message: errorMsg, hint });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                background: "#f0f2f5",
            }}
        >
            <Card
                style={{
                    width: 400,
                    borderRadius: 12,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.1)",
                }}
            >
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                    <Title level={2} style={{ color: "#1677ff", marginBottom: 8 }}>
                        欢迎登录
                    </Title>
                    <Text type="secondary">智慧医疗管理系统</Text>
                </div>

                <Form
                    name="login_form"
                    initialValues={{ remember: true }}
                    onFinish={onFinish}
                    size="large"
                >
                    <Form.Item
                        name="username"
                        rules={[{ required: true, message: "请输入用户名" }]}
                    >
                        <Input prefix={<UserOutlined />} placeholder="用户名" />
                    </Form.Item>

                    <Form.Item
                        name="password"
                        rules={[{ required: true, message: "请输入密码" }]}
                    >
                        <Input.Password prefix={<LockOutlined />} placeholder="密码" />
                    </Form.Item>

                    {loginError && (
                        <Form.Item>
                            <Alert
                                type="error"
                                message={loginError.message}
                                description={loginError.hint}
                                showIcon
                                closable
                                onClose={() => setLoginError(null)}
                            />
                        </Form.Item>
                    )}

                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>
                            立即登录
                        </Button>
                    </Form.Item>

                    <Row justify="space-between">
                        <Col>
                            <Button
                                type="link"
                                icon={<ArrowLeftOutlined />}
                                onClick={() => navigate("/")}
                                size="small"
                            >
                                返回首页
                            </Button>
                        </Col>
                        <Col>
                            <Button
                                type="link"
                                onClick={() => navigate("/register")}
                                size="small"
                            >
                                没有账号？去注册
                            </Button>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </div>
    );
};

export default Login;
