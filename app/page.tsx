'use client';

import { useState, useEffect } from 'react';
import {
  Layout,
  Card,
  Input,
  Button,
  List,
  Checkbox,
  Tag,
  Space,
  Dropdown,
  Modal,
  Form,
  Select,
  DatePicker,
  Progress,
  Statistic,
  Row,
  Col,
  Badge,
  Divider,
  Empty,
  Tooltip,
  message,
  Avatar,
  Typography,
  Switch,
  Tabs,
  Timeline,
  Segmented,
  Popconfirm,
  Radio,
  Slider,
  Alert,
  notification,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FilterOutlined,
  CalendarOutlined,
  TagsOutlined,
  StarOutlined,
  StarFilled,
  BulbOutlined,
  FireOutlined,
  ThunderboltOutlined,
  SyncOutlined,
  DownloadOutlined,
  UploadOutlined,
  HistoryOutlined,
  SortAscendingOutlined,
  UnorderedListOutlined,
  AppstoreOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import dayjs, { Dayjs } from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

const { Header, Content } = Layout;
const { TextArea } = Input;
const { Title, Text, Paragraph } = Typography;

dayjs.extend(relativeTime);

interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  category: string;
  dueDate?: Dayjs;
  favorite: boolean;
  createdAt: Dayjs;
  completedAt?: Dayjs;
  subtasks?: { id: number; title: string; completed: boolean }[];
  tags?: string[];
}

interface Activity {
  id: number;
  action: string;
  todoTitle: string;
  timestamp: Dayjs;
  type: 'add' | 'edit' | 'complete' | 'delete';
}

export default function Home() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'completed'>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [searchText, setSearchText] = useState('');
  const [form] = Form.useForm();
  const [messageApi, contextHolder] = message.useMessage();
  const [notificationApi, notificationContextHolder] = notification.useNotification();
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'title'>('date');
  const [activities, setActivities] = useState<Activity[]>([]);
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activeTab, setActiveTab] = useState('1');

  const categories = ['Work', 'Personal', 'Shopping', 'Health', 'Study', 'Other'];

  // Feature 1: Local Storage Persistence
  useEffect(() => {
    const savedTodos = localStorage.getItem('todos');
    const savedActivities = localStorage.getItem('activities');
    const savedDarkMode = localStorage.getItem('darkMode');
    
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos);
      setTodos(parsedTodos.map((todo: any) => ({
        ...todo,
        createdAt: dayjs(todo.createdAt),
        dueDate: todo.dueDate ? dayjs(todo.dueDate) : undefined,
        completedAt: todo.completedAt ? dayjs(todo.completedAt) : undefined,
      })));
    }
    if (savedActivities) {
      const parsedActivities = JSON.parse(savedActivities);
      setActivities(parsedActivities.map((activity: any) => ({
        ...activity,
        timestamp: dayjs(activity.timestamp),
      })));
    }
    if (savedDarkMode) {
      setDarkMode(savedDarkMode === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    localStorage.setItem('activities', JSON.stringify(activities));
  }, [activities]);

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode.toString());
  }, [darkMode]);

  // Feature 2: Activity Log
  const addActivity = (action: string, todoTitle: string, type: Activity['type']) => {
    const newActivity: Activity = {
      id: Date.now(),
      action,
      todoTitle,
      timestamp: dayjs(),
      type,
    };
    setActivities([newActivity, ...activities.slice(0, 49)]); // Keep last 50 activities
  };

  // Feature 3: Due Date Notifications
  useEffect(() => {
    const checkDueDates = () => {
      const now = dayjs();
      todos.forEach((todo) => {
        if (!todo.completed && todo.dueDate) {
          const daysUntilDue = todo.dueDate.diff(now, 'day');
          const hoursUntilDue = todo.dueDate.diff(now, 'hour');
          
          if (daysUntilDue === 0 && hoursUntilDue > 0 && hoursUntilDue <= 24) {
            notificationApi.warning({
              message: 'Task Due Today!',
              description: `"${todo.title}" is due today at ${todo.dueDate.format('h:mm A')}`,
              placement: 'topRight',
              icon: <ClockCircleOutlined style={{ color: '#faad14' }} />,
            });
          } else if (daysUntilDue < 0) {
            notificationApi.error({
              message: 'Overdue Task!',
              description: `"${todo.title}" is overdue by ${Math.abs(daysUntilDue)} day(s)`,
              placement: 'topRight',
              icon: <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />,
            });
          }
        }
      });
    };
    
    checkDueDates();
    const interval = setInterval(checkDueDates, 3600000); // Check every hour
    return () => clearInterval(interval);
  }, [todos, notificationApi]);

  const showModal = (todo?: Todo) => {
    if (todo) {
      setEditingTodo(todo);
      form.setFieldsValue({
        title: todo.title,
        description: todo.description,
        priority: todo.priority,
        category: todo.category,
        dueDate: todo.dueDate,
        tags: todo.tags || [],
        subtasks: todo.subtasks || [],
      });
    } else {
      setEditingTodo(null);
      form.resetFields();
    }
    setIsModalVisible(true);
  };

  const handleOk = () => {
    form.validateFields().then((values) => {
      if (editingTodo) {
        setTodos(
          todos.map((todo) =>
            todo.id === editingTodo.id
              ? { ...todo, ...values }
              : todo
          )
        );
        addActivity('Updated task', values.title, 'edit');
        messageApi.success('Todo updated successfully!');
      } else {
        const newTodo: Todo = {
          id: Date.now(),
          title: values.title,
          description: values.description,
          completed: false,
          priority: values.priority,
          category: values.category,
          dueDate: values.dueDate,
          favorite: false,
          createdAt: dayjs(),
          tags: values.tags || [],
          subtasks: values.subtasks || [],
        };
        setTodos([newTodo, ...todos]);
        addActivity('Created new task', values.title, 'add');
        messageApi.success('Todo added successfully!');
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    setEditingTodo(null);
    form.resetFields();
  };

  const toggleComplete = (id: number) => {
    setTodos(
      todos.map((todo) => {
        if (todo.id === id) {
          const newCompleted = !todo.completed;
          if (newCompleted) {
            addActivity('Completed task', todo.title, 'complete');
            messageApi.success(`🎉 Completed: ${todo.title}`);
          }
          return { 
            ...todo, 
            completed: newCompleted,
            completedAt: newCompleted ? dayjs() : undefined,
          };
        }
        return todo;
      })
    );
  };

  const toggleFavorite = (id: number) => {
    setTodos(
      todos.map((todo) =>
        todo.id === id ? { ...todo, favorite: !todo.favorite } : todo
      )
    );
  };

  const deleteTodo = (id: number) => {
    const todo = todos.find((t) => t.id === id);
    Modal.confirm({
      title: 'Are you sure you want to delete this todo?',
      icon: <ExclamationCircleOutlined />,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        setTodos(todos.filter((t) => t.id !== id));
        if (todo) {
          addActivity('Deleted task', todo.title, 'delete');
        }
        messageApi.success('Todo deleted successfully!');
      },
    });
  };

  // Feature 4: Bulk Actions
  const deleteAllCompleted = () => {
    const completedCount = todos.filter((todo) => todo.completed).length;
    Modal.confirm({
      title: `Delete ${completedCount} completed task(s)?`,
      icon: <ExclamationCircleOutlined />,
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk() {
        setTodos(todos.filter((todo) => !todo.completed));
        addActivity(`Deleted ${completedCount} completed tasks`, 'Bulk action', 'delete');
        messageApi.success(`Deleted ${completedCount} completed task(s)!`);
      },
    });
  };

  const markAllComplete = () => {
    const activeCount = todos.filter((todo) => !todo.completed).length;
    setTodos(
      todos.map((todo) => ({
        ...todo,
        completed: true,
        completedAt: todo.completed ? todo.completedAt : dayjs(),
      }))
    );
    addActivity(`Marked ${activeCount} tasks as complete`, 'Bulk action', 'complete');
    messageApi.success(`Marked ${activeCount} task(s) as complete!`);
  };

  // Feature 5: Export/Import Functionality
  const exportTodos = () => {
    const dataStr = JSON.stringify(todos, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `todos-backup-${dayjs().format('YYYY-MM-DD')}.json`;
    link.click();
    URL.revokeObjectURL(url);
    messageApi.success('Todos exported successfully!');
  };

  const importTodos = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedTodos = JSON.parse(e.target?.result as string);
          const parsedTodos = importedTodos.map((todo: any) => ({
            ...todo,
            id: Date.now() + Math.random(), // Generate new IDs to avoid conflicts
            createdAt: dayjs(todo.createdAt),
            dueDate: todo.dueDate ? dayjs(todo.dueDate) : undefined,
            completedAt: todo.completedAt ? dayjs(todo.completedAt) : undefined,
          }));
          setTodos([...parsedTodos, ...todos]);
          addActivity(`Imported ${parsedTodos.length} tasks`, 'Import', 'add');
          messageApi.success(`Imported ${parsedTodos.length} todo(s) successfully!`);
        } catch (error) {
          messageApi.error('Failed to import todos. Invalid file format.');
        }
      };
      reader.readAsText(file);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'red';
      case 'medium':
        return 'orange';
      case 'low':
        return 'green';
      default:
        return 'default';
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      Work: 'blue',
      Personal: 'purple',
      Shopping: 'cyan',
      Health: 'green',
      Study: 'geekblue',
      Other: 'default',
    };
    return colors[category] || 'default';
  };

  const filteredTodos = todos
    .filter((todo) => {
      if (filterStatus === 'active') return !todo.completed;
      if (filterStatus === 'completed') return todo.completed;
      return true;
    })
    .filter((todo) => {
      if (filterPriority !== 'all') return todo.priority === filterPriority;
      return true;
    })
    .filter((todo) => {
      if (filterCategory !== 'all') return todo.category === filterCategory;
      return true;
    })
    .filter((todo) =>
      todo.title.toLowerCase().includes(searchText.toLowerCase()) ||
      todo.description.toLowerCase().includes(searchText.toLowerCase())
    )
    .sort((a, b) => {
      // Feature 5: Sorting
      if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else {
        return b.createdAt.valueOf() - a.createdAt.valueOf();
      }
    });

  const completedCount = todos.filter((todo) => todo.completed).length;
  const activeCount = todos.filter((todo) => !todo.completed).length;
  const progressPercentage = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  const filterMenu: MenuProps['items'] = [
    {
      key: 'all',
      label: 'All Tasks',
      onClick: () => setFilterStatus('all'),
    },
    {
      key: 'active',
      label: 'Active',
      onClick: () => setFilterStatus('active'),
    },
    {
      key: 'completed',
      label: 'Completed',
      onClick: () => setFilterStatus('completed'),
    },
  ];

  const getTimeStatus = (dueDate?: Dayjs, completed?: boolean) => {
    if (completed || !dueDate) return null;
    
    const now = dayjs();
    const daysUntilDue = dueDate.diff(now, 'day');
    
    if (daysUntilDue < 0) {
      return <Tag color="red" icon={<FireOutlined />}>OVERDUE</Tag>;
    } else if (daysUntilDue === 0) {
      return <Tag color="orange" icon={<ThunderboltOutlined />}>DUE TODAY</Tag>;
    } else if (daysUntilDue <= 3) {
      return <Tag color="gold" icon={<ClockCircleOutlined />}>DUE SOON</Tag>;
    }
    return null;
  };

  return (
    <>
      {contextHolder}
      {notificationContextHolder}
      <Layout style={{ minHeight: '100vh', background: darkMode ? '#141414' : '#f0f2f5' }}>
        <Header style={{ background: darkMode ? '#1f1f1f' : '#1890ff', padding: '0 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Title level={2} style={{ color: 'white', margin: '16px 0' }}>
              📝 My Todo App
            </Title>
            <Space size="large">
              <Tooltip title={darkMode ? 'Light Mode' : 'Dark Mode'}>
                <Switch
                  checked={darkMode}
                  onChange={setDarkMode}
                  checkedChildren="🌙"
                  unCheckedChildren="☀️"
                />
              </Tooltip>
              <Button
                type="primary"
                size="large"
                icon={<PlusOutlined />}
                onClick={() => showModal()}
                style={{ background: '#52c41a', borderColor: '#52c41a' }}
              >
                Add Todo
              </Button>
            </Space>
          </div>
        </Header>

        <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
          {/* Quick Actions Bar */}
          <Card style={{ marginBottom: 24, background: darkMode ? '#1f1f1f' : '#fff' }}>
            <Space wrap>
              <Button
                icon={<HistoryOutlined />}
                onClick={() => setShowActivityModal(true)}
              >
                Activity Log
              </Button>
              <Button
                icon={<DownloadOutlined />}
                onClick={exportTodos}
                disabled={todos.length === 0}
              >
                Export
              </Button>
              <Button icon={<UploadOutlined />}>
                <label htmlFor="import-file" style={{ cursor: 'pointer', margin: 0 }}>
                  Import
                  <input
                    id="import-file"
                    type="file"
                    accept=".json"
                    style={{ display: 'none' }}
                    onChange={importTodos}
                  />
                </label>
              </Button>
              <Popconfirm
                title="Mark all tasks as complete?"
                onConfirm={markAllComplete}
                okText="Yes"
                cancelText="No"
                disabled={activeCount === 0}
              >
                <Button
                  icon={<CheckCircleOutlined />}
                  disabled={activeCount === 0}
                >
                  Complete All
                </Button>
              </Popconfirm>
              <Popconfirm
                title="Delete all completed tasks?"
                onConfirm={deleteAllCompleted}
                okText="Yes"
                cancelText="No"
                disabled={completedCount === 0}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  disabled={completedCount === 0}
                >
                  Clear Completed
                </Button>
              </Popconfirm>
            </Space>
          </Card>

          {/* Statistics */}
          <Row gutter={16} style={{ marginBottom: 24 }}>
            <Col xs={24} sm={8}>
              <Card style={{ background: darkMode ? '#1f1f1f' : '#fff' }}>
                <Statistic
                  title="Total Tasks"
                  value={todos.length}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ background: darkMode ? '#1f1f1f' : '#fff' }}>
                <Statistic
                  title="Active Tasks"
                  value={activeCount}
                  prefix={<ClockCircleOutlined />}
                  valueStyle={{ color: '#faad14' }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card style={{ background: darkMode ? '#1f1f1f' : '#fff' }}>
                <Statistic
                  title="Completed"
                  value={completedCount}
                  prefix={<CheckCircleOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Card>
            </Col>
          </Row>

          {/* Progress */}
          {todos.length > 0 && (
            <Card style={{ marginBottom: 24, background: darkMode ? '#1f1f1f' : '#fff' }}>
              <Text strong>Overall Progress</Text>
              <Progress
                percent={Math.round(progressPercentage)}
                status={progressPercentage === 100 ? 'success' : 'active'}
                strokeColor={{
                  '0%': '#108ee9',
                  '100%': '#87d068',
                }}
              />
            </Card>
          )}

          {/* Overdue Alert */}
          {todos.some((todo) => !todo.completed && todo.dueDate && todo.dueDate.isBefore(dayjs())) && (
            <Alert
              message="You have overdue tasks!"
              description={`${todos.filter((todo) => !todo.completed && todo.dueDate && todo.dueDate.isBefore(dayjs())).length} task(s) are overdue. Please review them.`}
              type="error"
              showIcon
              closable
              style={{ marginBottom: 24 }}
            />
          )}

          {/* Filters */}
          <Card style={{ marginBottom: 24, background: darkMode ? '#1f1f1f' : '#fff' }}>
            <Space wrap style={{ width: '100%', marginBottom: 16 }}>
              <Input
                placeholder="Search todos..."
                allowClear
                style={{ width: 300 }}
                onChange={(e) => setSearchText(e.target.value)}
                prefix={<FilterOutlined />}
              />
              <Dropdown menu={{ items: filterMenu }} trigger={['click']}>
                <Button icon={<FilterOutlined />}>
                  Status: {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                </Button>
              </Dropdown>
              <Select
                defaultValue="all"
                style={{ width: 150 }}
                onChange={(value) => setFilterPriority(value)}
                options={[
                  { value: 'all', label: 'All Priorities' },
                  { value: 'high', label: 'High Priority' },
                  { value: 'medium', label: 'Medium Priority' },
                  { value: 'low', label: 'Low Priority' },
                ]}
              />
              <Select
                defaultValue="all"
                style={{ width: 150 }}
                onChange={(value) => setFilterCategory(value)}
                options={[
                  { value: 'all', label: 'All Categories' },
                  ...categories.map((cat) => ({ value: cat, label: cat })),
                ]}
              />
            </Space>
            <Space wrap>
              <Text strong>Sort by:</Text>
              <Segmented
                options={[
                  { label: 'Date', value: 'date', icon: <CalendarOutlined /> },
                  { label: 'Priority', value: 'priority', icon: <FireOutlined /> },
                  { label: 'Title', value: 'title', icon: <SortAscendingOutlined /> },
                ]}
                value={sortBy}
                onChange={(value) => setSortBy(value as 'date' | 'priority' | 'title')}
              />
              <Segmented
                options={[
                  { label: 'List', value: 'list', icon: <UnorderedListOutlined /> },
                  { label: 'Grid', value: 'grid', icon: <AppstoreOutlined /> },
                ]}
                value={viewMode}
                onChange={(value) => setViewMode(value as 'list' | 'grid')}
              />
            </Space>
          </Card>

          {/* Todo List */}
          <Card style={{ background: darkMode ? '#1f1f1f' : '#fff' }}>
            {filteredTodos.length === 0 ? (
              <Empty
                description={
                  todos.length === 0
                    ? 'No todos yet. Click "Add Todo" to create one!'
                    : 'No todos match your filters'
                }
              />
            ) : viewMode === 'list' ? (
              <List
                dataSource={filteredTodos}
                renderItem={(todo) => (
                  <List.Item
                    key={todo.id}
                    style={{
                      opacity: todo.completed ? 0.6 : 1,
                      background: todo.favorite ? '#fffbe6' : 'transparent',
                      padding: '16px',
                      borderRadius: '8px',
                      marginBottom: '8px',
                    }}
                    actions={[
                      <Tooltip title={todo.favorite ? 'Unfavorite' : 'Favorite'}>
                        <Button
                          type="text"
                          icon={todo.favorite ? <StarFilled style={{ color: '#fadb14' }} /> : <StarOutlined />}
                          onClick={() => toggleFavorite(todo.id)}
                        />
                      </Tooltip>,
                      <Tooltip title="Edit">
                        <Button
                          type="text"
                          icon={<EditOutlined />}
                          onClick={() => showModal(todo)}
                        />
                      </Tooltip>,
                      <Tooltip title="Delete">
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => deleteTodo(todo.id)}
                        />
                      </Tooltip>,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Checkbox
                          checked={todo.completed}
                          onChange={() => toggleComplete(todo.id)}
                        />
                      }
                      title={
                        <Space>
                          <Text
                            delete={todo.completed}
                            strong
                            style={{ fontSize: '16px' }}
                          >
                            {todo.title}
                          </Text>
                          <Badge count={todo.favorite ? '⭐' : 0} />
                        </Space>
                      }
                      description={
                        <div>
                          <Paragraph
                            ellipsis={{ rows: 2, expandable: true }}
                            style={{ marginBottom: 8 }}
                          >
                            {todo.description}
                          </Paragraph>
                          <Space wrap>
                            <Tag color={getPriorityColor(todo.priority)} icon={<ExclamationCircleOutlined />}>
                              {todo.priority.toUpperCase()}
                            </Tag>
                            <Tag color={getCategoryColor(todo.category)} icon={<TagsOutlined />}>
                              {todo.category}
                            </Tag>
                            {getTimeStatus(todo.dueDate, todo.completed)}
                            {todo.dueDate && (
                              <Tag icon={<CalendarOutlined />}>
                                Due: {todo.dueDate.format('MMM DD, YYYY')}
                              </Tag>
                            )}
                            {todo.tags && todo.tags.map((tag, index) => (
                              <Tag key={index} color="blue">{tag}</Tag>
                            ))}
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                              Created: {todo.createdAt.fromNow()}
                            </Text>
                            {todo.completedAt && (
                              <Text type="success" style={{ fontSize: '12px' }}>
                                ✓ Completed: {todo.completedAt.fromNow()}
                              </Text>
                            )}
                          </Space>
                          {todo.subtasks && todo.subtasks.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                              <Text type="secondary" style={{ fontSize: '12px' }}>
                                Subtasks: {todo.subtasks.filter(st => st.completed).length}/{todo.subtasks.length} completed
                              </Text>
                            </div>
                          )}
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            ) : (
              <Row gutter={[16, 16]}>
                {filteredTodos.map((todo) => (
                  <Col xs={24} sm={12} lg={8} key={todo.id}>
                    <Card
                      hoverable
                      style={{
                        opacity: todo.completed ? 0.6 : 1,
                        background: todo.favorite ? '#fffbe6' : darkMode ? '#262626' : '#fff',
                      }}
                      actions={[
                        <Tooltip title={todo.favorite ? 'Unfavorite' : 'Favorite'}>
                          <Button
                            type="text"
                            icon={todo.favorite ? <StarFilled style={{ color: '#fadb14' }} /> : <StarOutlined />}
                            onClick={() => toggleFavorite(todo.id)}
                          />
                        </Tooltip>,
                        <Tooltip title="Edit">
                          <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => showModal(todo)}
                          />
                        </Tooltip>,
                        <Tooltip title="Delete">
                          <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => deleteTodo(todo.id)}
                          />
                        </Tooltip>,
                      ]}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Checkbox
                          checked={todo.completed}
                          onChange={() => toggleComplete(todo.id)}
                        >
                          <Text delete={todo.completed} strong>
                            {todo.title}
                          </Text>
                        </Checkbox>
                        <Paragraph ellipsis={{ rows: 3 }} style={{ marginBottom: 8 }}>
                          {todo.description}
                        </Paragraph>
                        <Space wrap>
                          <Tag color={getPriorityColor(todo.priority)}>
                            {todo.priority.toUpperCase()}
                          </Tag>
                          <Tag color={getCategoryColor(todo.category)}>
                            {todo.category}
                          </Tag>
                          {getTimeStatus(todo.dueDate, todo.completed)}
                        </Space>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        </Content>
      </Layout>

      {/* Activity Log Modal */}
      <Modal
        title="Activity Log"
        open={showActivityModal}
        onCancel={() => setShowActivityModal(false)}
        footer={[
          <Button key="close" onClick={() => setShowActivityModal(false)}>
            Close
          </Button>,
        ]}
        width={700}
      >
        {activities.length === 0 ? (
          <Empty description="No activities yet" />
        ) : (
          <Timeline
            items={activities.map((activity) => ({
              color: activity.type === 'add' ? 'green' : activity.type === 'complete' ? 'blue' : activity.type === 'delete' ? 'red' : 'orange',
              children: (
                <div>
                  <Text strong>{activity.action}</Text>
                  <br />
                  <Text type="secondary">{activity.todoTitle}</Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    {activity.timestamp.fromNow()}
                  </Text>
                </div>
              ),
            }))}
          />
        )}
      </Modal>

      {/* Add/Edit Modal */}
      <Modal
        title={editingTodo ? 'Edit Todo' : 'Add New Todo'}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        okText={editingTodo ? 'Update' : 'Add'}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="Title"
            name="title"
            rules={[{ required: true, message: 'Please enter a title' }]}
          >
            <Input placeholder="Enter todo title" size="large" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Please enter a description' }]}
          >
            <TextArea
              rows={4}
              placeholder="Enter todo description"
            />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Priority"
                name="priority"
                rules={[{ required: true, message: 'Please select a priority' }]}
              >
                <Select
                  placeholder="Select priority"
                  options={[
                    { value: 'low', label: 'Low' },
                    { value: 'medium', label: 'Medium' },
                    { value: 'high', label: 'High' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                label="Category"
                name="category"
                rules={[{ required: true, message: 'Please select a category' }]}
              >
                <Select
                  placeholder="Select category"
                  options={categories.map((cat) => ({ value: cat, label: cat }))}
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Due Date" name="dueDate">
            <DatePicker style={{ width: '100%' }} showTime />
          </Form.Item>

          <Form.Item label="Tags" name="tags">
            <Select
              mode="tags"
              placeholder="Add tags (press enter to add)"
              style={{ width: '100%' }}
            />
          </Form.Item>

          <Form.Item label="Subtasks" name="subtasks">
            <Form.List name="subtasks">
              {(fields, { add, remove }) => (
                <>
                  {fields.map(({ key, name, ...restField }) => (
                    <Space key={key} style={{ display: 'flex', marginBottom: 8 }} align="baseline">
                      <Form.Item
                        {...restField}
                        name={[name, 'title']}
                        style={{ marginBottom: 0, flex: 1 }}
                      >
                        <Input placeholder="Subtask title" />
                      </Form.Item>
                      <Button onClick={() => remove(name)} icon={<DeleteOutlined />} />
                    </Space>
                  ))}
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    Add Subtask
                  </Button>
                </>
              )}
            </Form.List>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
}
