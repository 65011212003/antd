'use client';

import { useState } from 'react';
import {
  Layout,
  Card,
  Form,
  Input,
  Button,
  Checkbox,
  Typography,
  Space,
  Divider,
  message,
  Row,
  Col,
  Avatar,
  Steps,
  Select,
  DatePicker,
  Upload,
  Progress,
} from 'antd';
import {
  UserOutlined,
  LockOutlined,
  MailOutlined,
  PhoneOutlined,
  SafetyOutlined,
  CheckCircleOutlined,
  EyeTwoTone,
  EyeInvisibleOutlined,
  GoogleOutlined,
  GithubOutlined,
  UploadOutlined,
  HomeOutlined,
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';

const { Title, Text, Link } = Typography;
const { Content } = Layout;
const { Option } = Select;

export default function RegisterPage() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const router = useRouter();

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/\d/.test(password)) strength += 15;
    if (/[^a-zA-Z\d]/.test(password)) strength += 10;
    return Math.min(strength, 100);
  };

  const onPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    const strength = calculatePasswordStrength(password);
    setPasswordStrength(strength);
  };

  const getPasswordStrengthStatus = () => {
    if (passwordStrength < 40) return { status: 'exception' as const, color: '#ff4d4f', text: 'Weak' };
    if (passwordStrength < 70) return { status: 'normal' as const, color: '#faad14', text: 'Medium' };
    return { status: 'success' as const, color: '#52c41a', text: 'Strong' };
  };

  const onFinish = async (values: any) => {
    setLoading(true);
    console.log('Register values:', values);

    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      message.success('Registration successful! Redirecting to login...');
      
      // Redirect to login page
      setTimeout(() => {
        router.push('/login');
      }, 1500);
    }, 2000);
  };

  const handleSocialRegister = (provider: string) => {
    message.info(`${provider} registration coming soon!`);
  };

  const nextStep = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1);
    }).catch((error) => {
      message.error('Please fill in all required fields!');
    });
  };

  const prevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const steps = [
    {
      title: 'Account',
      icon: <UserOutlined />,
    },
    {
      title: 'Profile',
      icon: <HomeOutlined />,
    },
    {
      title: 'Complete',
      icon: <CheckCircleOutlined />,
    },
  ];

  const strengthStatus = getPasswordStrengthStatus();

  return (
    <Layout style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Content style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '24px' }}>
        <Card
          style={{
            width: '100%',
            maxWidth: 600,
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            borderRadius: '16px',
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            {/* Header */}
            <div style={{ textAlign: 'center' }}>
              <Avatar
                size={64}
                icon={<SafetyOutlined />}
                style={{ backgroundColor: '#52c41a', marginBottom: 16 }}
              />
              <Title level={2} style={{ margin: 0 }}>
                Create Account
              </Title>
              <Text type="secondary">Join us today and start managing your tasks</Text>
            </div>

            {/* Steps */}
            <Steps current={currentStep} items={steps} />

            {/* Registration Form */}
            <Form
              form={form}
              name="register"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              scrollToFirstError
            >
              {/* Step 1: Account Information */}
              {currentStep === 0 && (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Form.Item
                    name="email"
                    rules={[
                      { required: true, message: 'Please input your email!' },
                      { type: 'email', message: 'Please enter a valid email!' },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined style={{ color: '#1890ff' }} />}
                      placeholder="Email address"
                      autoComplete="email"
                    />
                  </Form.Item>

                  <Form.Item
                    name="username"
                    rules={[
                      { required: true, message: 'Please input your username!' },
                      { min: 3, message: 'Username must be at least 3 characters!' },
                      { max: 20, message: 'Username must be less than 20 characters!' },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined style={{ color: '#1890ff' }} />}
                      placeholder="Username"
                      autoComplete="username"
                    />
                  </Form.Item>

                  <Form.Item
                    name="password"
                    rules={[
                      { required: true, message: 'Please input your password!' },
                      { min: 8, message: 'Password must be at least 8 characters!' },
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                      placeholder="Password"
                      onChange={onPasswordChange}
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                      autoComplete="new-password"
                    />
                  </Form.Item>

                  {passwordStrength > 0 && (
                    <div style={{ marginTop: -16, marginBottom: 16 }}>
                      <Progress
                        percent={passwordStrength}
                        status={strengthStatus.status}
                        strokeColor={strengthStatus.color}
                        showInfo={false}
                        size="small"
                      />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Password strength: <Text strong style={{ color: strengthStatus.color }}>{strengthStatus.text}</Text>
                      </Text>
                    </div>
                  )}

                  <Form.Item
                    name="confirmPassword"
                    dependencies={['password']}
                    rules={[
                      { required: true, message: 'Please confirm your password!' },
                      ({ getFieldValue }) => ({
                        validator(_, value) {
                          if (!value || getFieldValue('password') === value) {
                            return Promise.resolve();
                          }
                          return Promise.reject(new Error('The passwords do not match!'));
                        },
                      }),
                    ]}
                  >
                    <Input.Password
                      prefix={<LockOutlined style={{ color: '#1890ff' }} />}
                      placeholder="Confirm password"
                      iconRender={(visible) =>
                        visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />
                      }
                      autoComplete="new-password"
                    />
                  </Form.Item>

                  <Button
                    type="primary"
                    onClick={nextStep}
                    block
                    size="large"
                    style={{ height: '48px', marginTop: 8 }}
                  >
                    Next Step
                  </Button>
                </Space>
              )}

              {/* Step 2: Profile Information */}
              {currentStep === 1 && (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <Row gutter={12}>
                    <Col span={12}>
                      <Form.Item
                        name="firstName"
                        rules={[{ required: true, message: 'Required!' }]}
                      >
                        <Input placeholder="First name" />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name="lastName"
                        rules={[{ required: true, message: 'Required!' }]}
                      >
                        <Input placeholder="Last name" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item
                    name="phone"
                    rules={[
                      { required: true, message: 'Please input your phone number!' },
                      { pattern: /^[0-9]{10,}$/, message: 'Please enter a valid phone number!' },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined style={{ color: '#1890ff' }} />}
                      placeholder="Phone number"
                      autoComplete="tel"
                    />
                  </Form.Item>

                  <Form.Item
                    name="country"
                    rules={[{ required: true, message: 'Please select your country!' }]}
                  >
                    <Select placeholder="Select country" showSearch>
                      <Option value="us">United States</Option>
                      <Option value="uk">United Kingdom</Option>
                      <Option value="ca">Canada</Option>
                      <Option value="au">Australia</Option>
                      <Option value="in">India</Option>
                      <Option value="other">Other</Option>
                    </Select>
                  </Form.Item>

                  <Form.Item name="birthdate" label="Date of Birth">
                    <DatePicker style={{ width: '100%' }} />
                  </Form.Item>

                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Button onClick={prevStep} size="large">
                      Previous
                    </Button>
                    <Button
                      type="primary"
                      onClick={nextStep}
                      size="large"
                    >
                      Next Step
                    </Button>
                  </Space>
                </Space>
              )}

              {/* Step 3: Terms and Submit */}
              {currentStep === 2 && (
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 16 }} />
                    <Title level={4}>Almost there!</Title>
                    <Text type="secondary">Please review and accept our terms</Text>
                  </div>

                  <Form.Item
                    name="agreement"
                    valuePropName="checked"
                    rules={[
                      {
                        validator: (_, value) =>
                          value
                            ? Promise.resolve()
                            : Promise.reject(new Error('You must accept the terms and conditions')),
                      },
                    ]}
                  >
                    <Checkbox>
                      I agree to the{' '}
                      <Link href="#" strong>
                        Terms and Conditions
                      </Link>{' '}
                      and{' '}
                      <Link href="#" strong>
                        Privacy Policy
                      </Link>
                    </Checkbox>
                  </Form.Item>

                  <Form.Item
                    name="newsletter"
                    valuePropName="checked"
                    initialValue={true}
                  >
                    <Checkbox>
                      Subscribe to our newsletter for updates and tips
                    </Checkbox>
                  </Form.Item>

                  <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Button onClick={prevStep} size="large">
                      Previous
                    </Button>
                    <Button
                      type="primary"
                      htmlType="submit"
                      loading={loading}
                      size="large"
                      style={{ minWidth: 150 }}
                    >
                      {loading ? 'Creating Account...' : 'Create Account'}
                    </Button>
                  </Space>
                </Space>
              )}
            </Form>

            {/* Social Registration - Show only on first step */}
            {currentStep === 0 && (
              <>
                <Divider plain>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    OR REGISTER WITH
                  </Text>
                </Divider>

                <Row gutter={12}>
                  <Col span={12}>
                    <Button
                      icon={<GoogleOutlined />}
                      block
                      size="large"
                      onClick={() => handleSocialRegister('Google')}
                    >
                      Google
                    </Button>
                  </Col>
                  <Col span={12}>
                    <Button
                      icon={<GithubOutlined />}
                      block
                      size="large"
                      onClick={() => handleSocialRegister('GitHub')}
                    >
                      GitHub
                    </Button>
                  </Col>
                </Row>
              </>
            )}

            {/* Login Link */}
            <div style={{ textAlign: 'center', marginTop: 16 }}>
              <Text type="secondary">
                Already have an account?{' '}
                <Link href="/login" strong>
                  Login here
                </Link>
              </Text>
            </div>
          </Space>
        </Card>
      </Content>
    </Layout>
  );
}
