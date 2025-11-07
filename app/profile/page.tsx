'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Typography,
  Space,
  App,
  Select,
  Avatar,
} from 'antd';
import {
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  HomeOutlined,
  SaveOutlined,
  ArrowLeftOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { Content } = Layout;
const { Option } = Select;

function ProfileSettingsContent() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState('');
  const router = useRouter();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        router.push('/login');
        return;
      }

      setUserEmail(user.email || '');

      // Load profile data
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
      } else if (profile) {
        form.setFieldsValue({
          username: profile.username,
          firstName: profile.first_name,
          lastName: profile.last_name,
          phone: profile.phone,
          country: profile.country,
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const onFinish = async (values: any) => {
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        message.error('Please login first');
        router.push('/login');
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username: values.username,
          first_name: values.firstName,
          last_name: values.lastName,
          phone: values.phone,
          country: values.country,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (error) {
        message.error('Failed to update profile: ' + error.message);
      } else {
        message.success('Profile updated successfully!');
      }
    } catch (error: any) {
      message.error('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#f0f2f5' }}>
      <Content style={{ padding: '50px' }}>
        <Card
          style={{ maxWidth: 800, margin: '0 auto' }}
          title={
            <Space>
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />} 
                onClick={() => router.push('/')}
              />
              <Title level={3} style={{ margin: 0 }}>Profile Settings</Title>
            </Space>
          }
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Avatar size={80} icon={<UserOutlined />} />
              <div style={{ marginTop: 16 }}>
                <Text strong>Email: </Text>
                <Text>{userEmail}</Text>
              </div>
            </div>

            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              autoComplete="off"
            >
              <Form.Item
                label="Username"
                name="username"
                rules={[{ required: true, message: 'Please enter your username' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Username" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="First Name"
                name="firstName"
                rules={[{ required: true, message: 'Please enter your first name' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="First Name" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Last Name"
                name="lastName"
                rules={[{ required: true, message: 'Please enter your last name' }]}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Last Name" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Phone"
                name="phone"
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="+1234567890" 
                  size="large"
                />
              </Form.Item>

              <Form.Item
                label="Country"
                name="country"
              >
                <Select 
                  size="large"
                  placeholder="Select your country"
                  suffixIcon={<HomeOutlined />}
                  showSearch
                  filterOption={(input, option) =>
                    ((option?.label || option?.children) as string)?.toLowerCase().includes(input.toLowerCase())
                  }
                >
                  <Option value="USA">United States</Option>
                  <Option value="UK">United Kingdom</Option>
                  <Option value="Canada">Canada</Option>
                  <Option value="Australia">Australia</Option>
                  <Option value="Germany">Germany</Option>
                  <Option value="France">France</Option>
                  <Option value="Japan">Japan</Option>
                  <Option value="China">China</Option>
                  <Option value="India">India</Option>
                  <Option value="Brazil">Brazil</Option>
                  <Option value="Other">Other</Option>
                </Select>
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  icon={<SaveOutlined />}
                  loading={loading}
                  block
                >
                  Save Changes
                </Button>
              </Form.Item>
            </Form>
          </Space>
        </Card>
      </Content>
    </Layout>
  );
}

export default function ProfileSettingsPage() {
  return (
    <App>
      <ProfileSettingsContent />
    </App>
  );
}
