import React, { useState, useEffect } from 'react';
import { Card, Image, Spin, Row, Col, Typography, Divider } from 'antd';
import { PictureOutlined } from '@ant-design/icons';
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
    <Card title="医院简介" style={{ maxWidth: 800, margin: '20px auto' }}>
      <Paragraph>
        仁心医院成立于2007年，秉承"以患者为中心"理念，提供专业医疗服务。
      </Paragraph>
      
      <Divider orientation="left">
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <PictureOutlined /> 环境展示
        </span>
      </Divider>
      
      {loading ? (
        <Spin style={{ display: 'block', margin: '40px auto' }} />
      ) : images.length > 0 ? (
        <Row gutter={[16, 16]}>
          {images.map(img => (
            <Col xs={24} sm={8} key={img.id}>
              <Image src={img.url} alt={img.title} height={120} style={{ objectFit: 'cover' }} />
              <Text style={{ display: 'block', textAlign: 'center', marginTop: 4, fontSize: 12 }}>
                {img.title}
              </Text>
            </Col>
          ))}
        </Row>
      ) : (
        <Text type="secondary" style={{ display: 'block', textAlign: 'center', padding: '20px 0' }}>
          暂无环境图片
        </Text>
      )}
    </Card>
  );
};

export default About;
