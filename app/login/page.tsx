'use client';

import {
  LockOutlined,
  MobileOutlined,
  UserOutlined,
  GoogleOutlined,
  GithubOutlined,
  UserAddOutlined,
} from '@ant-design/icons';
import {
  LoginFormPage,
  ProConfigProvider,
  ProFormCaptcha,
  ProFormCheckbox,
  ProFormText,
} from '@ant-design/pro-components';
import { Button, Divider, Space, Tabs, App, theme } from 'antd';
import type { CSSProperties } from 'react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';

type LoginType = 'phone' | 'account';

const iconStyles: CSSProperties = {
  color: 'rgba(0, 0, 0, 0.2)',
  fontSize: '18px',
  verticalAlign: 'middle',
  cursor: 'pointer',
};

const Page = () => {
  const { message } = App.useApp();
  const [loginType, setLoginType] = useState<LoginType>('account');
  const [loading, setLoading] = useState(false);
  const { token } = theme.useToken();
  const router = useRouter();

  const handleSubmit = async (values: any) => {
    setLoading(true);
    
    try {
      if (loginType === 'account') {
        // Email/Password login
        const { data, error } = await supabase.auth.signInWithPassword({
          email: values.username,
          password: values.password,
        });

        if (error) {
          // Provide helpful error messages
          let errorMessage = error.message;
          
          if (error.message.includes('Invalid login credentials')) {
            errorMessage = 'Invalid email or password. Please try again.';
          } else if (error.message.includes('Email not confirmed')) {
            errorMessage = 'Please confirm your email before logging in. Check your inbox for the confirmation link.';
          } else if (error.message.includes('Anonymous sign-ins are disabled')) {
            errorMessage = 'Email login is not enabled. Please enable Email authentication in Supabase Dashboard.';
          }
          
          message.error({
            content: errorMessage,
            duration: 5,
          });
          return;
        }

        if (data.user) {
          message.success('登录成功！');
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userEmail', data.user.email || '');
          router.push('/');
        }
      } else {
        // Phone login
        message.info('手机号登录功能即将推出！');
      }
    } catch (error: any) {
      message.error(`登录失败: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        message.error(`${provider} 登录失败: ${error.message}`);
      }
    } catch (error: any) {
      message.error(`登录失败: ${error.message}`);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'white',
        height: '100vh',
      }}
    >
      <LoginFormPage
        backgroundImageUrl="https://mdn.alipayobjects.com/huamei_gcee1x/afts/img/A*y0ZTS6WLwvgAAAAAAAAAAAAADml6AQ/fmt.webp"
        logo="https://github.githubassets.com/favicons/favicon.png"
        backgroundVideoUrl="https://gw.alipayobjects.com/v/huamei_gcee1x/afts/video/jXRBRK_VAwoAAAAAAAAAAAAAK4eUAQBr"
        title="Todo App"
        containerStyle={{
          backgroundColor: 'rgba(0, 0, 0,0.65)',
          backdropFilter: 'blur(4px)',
        }}
        subTitle="使用 Supabase 进行身份验证"
        onFinish={handleSubmit}
        submitter={{
          searchConfig: {
            submitText: loading ? '登录中...' : '登录',
          },
          submitButtonProps: {
            loading: loading,
            size: 'large',
            style: {
              width: '100%',
            },
          },
        }}
        activityConfig={{
          style: {
            boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.2)',
            color: token.colorTextHeading,
            borderRadius: 8,
            backgroundColor: 'rgba(255,255,255,0.25)',
            backdropFilter: 'blur(4px)',
          },
          title: '活动标题，可配置图片',
          subTitle: '活动介绍说明文字',
          action: (
            <Button
              size="large"
              style={{
                borderRadius: 20,
                background: token.colorBgElevated,
                color: token.colorPrimary,
                width: 120,
              }}
            >
              去看看
            </Button>
          ),
        }}
        actions={
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <Divider plain>
              <span
                style={{
                  color: token.colorTextPlaceholder,
                  fontWeight: 'normal',
                  fontSize: 14,
                }}
              >
                其他登录方式
              </span>
            </Divider>
            <Space direction="vertical" style={{ width: '100%' }} size="middle">
              <Button
                size="large"
                block
                icon={<GoogleOutlined />}
                onClick={() => handleSocialLogin('google')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '48px',
                  fontSize: '16px',
                }}
              >
                使用 Google 登录
              </Button>
              <Button
                size="large"
                block
                icon={<GithubOutlined />}
                onClick={() => handleSocialLogin('github')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '48px',
                  fontSize: '16px',
                  background: '#24292e',
                  borderColor: '#24292e',
                  color: 'white',
                }}
              >
                使用 GitHub 登录
              </Button>
            </Space>
            <Divider plain />
            <Button
              size="large"
              block
              type="dashed"
              icon={<UserAddOutlined />}
              onClick={() => router.push('/register')}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '48px',
                fontSize: '16px',
                color: token.colorPrimary,
                borderColor: token.colorPrimary,
              }}
            >
              没有账号？立即注册
            </Button>
          </div>
        }
      >
        <Tabs
          centered
          activeKey={loginType}
          onChange={(activeKey) => setLoginType(activeKey as LoginType)}
          items={[
            {
              key: 'account',
              label: '账号密码登录',
            },
            {
              key: 'phone',
              label: '手机号登录',
            },
          ]}
        />
        {loginType === 'account' && (
          <>
            <ProFormText
              name="username"
              fieldProps={{
                size: 'large',
                prefix: (
                  <UserOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={'prefixIcon'}
                  />
                ),
              }}
              placeholder={'邮箱地址'}
              rules={[
                {
                  required: true,
                  message: '请输入邮箱!',
                },
                {
                  type: 'email',
                  message: '请输入有效的邮箱地址!',
                },
              ]}
            />
            <ProFormText.Password
              name="password"
              fieldProps={{
                size: 'large',
                prefix: (
                  <LockOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={'prefixIcon'}
                  />
                ),
              }}
              placeholder={'密码: ant.design'}
              rules={[
                {
                  required: true,
                  message: '请输入密码！',
                },
              ]}
            />
          </>
        )}
        {loginType === 'phone' && (
          <>
            <ProFormText
              fieldProps={{
                size: 'large',
                prefix: (
                  <MobileOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={'prefixIcon'}
                  />
                ),
              }}
              name="mobile"
              placeholder={'手机号'}
              rules={[
                {
                  required: true,
                  message: '请输入手机号！',
                },
                {
                  pattern: /^1\d{10}$/,
                  message: '手机号格式错误！',
                },
              ]}
            />
            <ProFormCaptcha
              fieldProps={{
                size: 'large',
                prefix: (
                  <LockOutlined
                    style={{
                      color: token.colorText,
                    }}
                    className={'prefixIcon'}
                  />
                ),
              }}
              captchaProps={{
                size: 'large',
              }}
              placeholder={'请输入验证码'}
              captchaTextRender={(timing: boolean, count: number) => {
                if (timing) {
                  return `${count} ${'获取验证码'}`;
                }
                return '获取验证码';
              }}
              name="captcha"
              rules={[
                {
                  required: true,
                  message: '请输入验证码！',
                },
              ]}
              onGetCaptcha={async () => {
                message.success('获取验证码成功！验证码为：1234');
              }}
            />
          </>
        )}
        <div
          style={{
            marginBlockEnd: 24,
          }}
        >
          <ProFormCheckbox noStyle name="autoLogin">
            自动登录
          </ProFormCheckbox>
          <a
            style={{
              float: 'right',
            }}
          >
            忘记密码
          </a>
        </div>
      </LoginFormPage>
    </div>
  );
};

export default () => {
  return (
    <App>
      <ProConfigProvider dark>
        <Page />
      </ProConfigProvider>
    </App>
  );
};