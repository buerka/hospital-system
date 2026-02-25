import React, { useState, useEffect } from 'react';
import { Card, Image, Spin, Row, Col, Typography, Divider, Tag, Space } from 'antd';
import {
  PictureOutlined,
  CheckCircleOutlined,
  HomeOutlined,
  UsergroupAddOutlined,
  SafetyCertificateOutlined
} from '@ant-design/icons';
import request from '../utils/request';

const { Title, Text, Paragraph } = Typography;

const About = () => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    request.get('/hospital/images')
      .then(res => setImages(res.data?.slice(0, 3) || []))
      .catch(() => setImages([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{
      background: '#f0f2f5',
      minHeight: '100vh',
      padding: '40px 20px'
    }}>
      <div style={{ maxWidth: 1000, margin: '0 auto' }}>

        {/* --- 顶部简介卡片 --- */}
        <Card
          bordered={false}
          style={{
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
            marginBottom: 24,
            textAlign: 'center',
            padding: '40px 20px'
          }}
        >
          <div style={{ fontSize: 48, color: '#1677ff', marginBottom: 16 }}>
            <HomeOutlined />
          </div>
          <Title level={2} style={{ marginBottom: 12, color: '#1f1f1f' }}>仁心医院</Title>
          <Paragraph style={{ fontSize: 16, color: '#666', maxWidth: 600, margin: '0 auto', lineHeight: 1.8 }}>
            成立于2007年，秉承<span style={{ color: '#1677ff', fontWeight: 600 }}>“以患者为中心”</span>理念，
            集医疗、教学、科研于一体。我们拥有先进的设备和专业的医护团队，致力于为您提供最优质的医疗服务。
          </Paragraph>

          {/* 核心数据标签 */}
          <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
            <Tag icon={<UsergroupAddOutlined />} color="blue" style={{ fontSize: 14, padding: '6px 12px' }}>300+ 专家团队</Tag>
            <Tag icon={<SafetyCertificateOutlined />} color="green" style={{ fontSize: 14, padding: '6px 12px' }}>三级甲等医院</Tag>
            <Tag icon={<CheckCircleOutlined />} color="cyan" style={{ fontSize: 14, padding: '6px 12px' }}>24h 急诊服务</Tag>
          </div>
        </Card>

        {/* --- 环境展示卡片 --- */}
        <Card
          title={
            <Space size={8}>
              <PictureOutlined style={{ color: '#1677ff' }} />
              <span style={{ fontSize: 18, fontWeight: 600 }}>医院环境</span>
            </Space>
          }
          bordered={false}
          style={{
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
          }}
        >
          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center' }}>
              <Spin size="large" />
              <div style={{ marginTop: 16, color: '#999' }}>正在加载精美图片...</div>
            </div>
          ) : images.length > 0 ? (
            <Row gutter={[24, 24]}>
              {images.map(img => (
                <Col xs={24} sm={8} key={img.id}>
                  <div style={{
                    borderRadius: 12,
                    overflow: 'hidden',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    cursor: 'pointer'
                  }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-5px)';
                      e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
                    }}
                  >
                    <Image
                      src={img.url}
                      alt={img.title}
                      height={200}
                      style={{
                        objectFit: 'cover',
                        width: '100%',
                        display: 'block'
                      }}
                      fallback="https://via.placeholder.com/400x300?text=Image+Error"
                    />
                    <div style={{
                      padding: '12px',
                      textAlign: 'center',
                      background: '#fff',
                      borderBottomLeftRadius: 12,
                      borderBottomRightRadius: 12
                    }}>
                      <Text strong style={{ fontSize: 15, color: '#333' }}>{img.title}</Text>
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#999' }}>
              <PictureOutlined style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }} />
              <div>暂无环境图片，敬请期待</div>
            </div>
          )}
        </Card>

      </div>
    </div>
  );
};

export default About;