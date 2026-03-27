import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Input } from '@/app/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import {
  Users,
  GraduationCap,
  BookOpen,
  TrendingUp,
  Plus,
  Search,
  Edit,
  Trash2,
  BarChart3,
  Activity,
  FileText,
  Award
} from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';

const mockUsers = [
  {
    id: '1',
    name: 'Nguyễn Văn A',
    email: 'student1@edu.vn',
    role: 'student',
    status: 'active',
    joinedAt: '2025-09-01',
    lastActive: '2026-01-23'
  },
  {
    id: '2',
    name: 'Trần Thị B',
    email: 'student2@edu.vn',
    role: 'student',
    status: 'active',
    joinedAt: '2025-09-01',
    lastActive: '2026-01-22'
  },
  {
    id: '3',
    name: 'TS. Lê Văn C',
    email: 'teacher1@edu.vn',
    role: 'teacher',
    status: 'active',
    joinedAt: '2020-01-15',
    lastActive: '2026-01-23'
  },
  {
    id: '4',
    name: 'PGS. Phạm Thị D',
    email: 'teacher2@edu.vn',
    role: 'teacher',
    status: 'active',
    joinedAt: '2018-03-20',
    lastActive: '2026-01-21'
  }
];

const mockStats = {
  totalUsers: 247,
  totalStudents: 235,
  totalTeachers: 12,
  totalAssignments: 48,
  totalSubmissions: 3842,
  activeToday: 156,
  systemUptime: 99.8,
  avgResponseTime: 0.3
};

const mockCourses = [
  {
    id: '1',
    name: 'Cấu trúc dữ liệu và giải thuật',
    code: 'CS201',
    teacher: 'TS. Lê Văn C',
    students: 45,
    assignments: 8
  },
  {
    id: '2',
    name: 'Lập trình Web',
    code: 'CS301',
    teacher: 'PGS. Phạm Thị D',
    students: 52,
    assignments: 6
  },
  {
    id: '3',
    name: 'Lập trình hướng đối tượng',
    code: 'CS202',
    teacher: 'TS. Lê Văn C',
    students: 48,
    assignments: 7
  }
];

export function AdminDashboard() {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');

  const filteredUsers = mockUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Xin chào, {user?.name}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng người dùng</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalUsers}</div>
            <p className="text-xs text-gray-600 mt-1">
              <span className="text-green-600">+12</span> trong tuần này
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sinh viên</CardTitle>
            <GraduationCap className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalStudents}</div>
            <p className="text-xs text-gray-600 mt-1">{mockStats.totalTeachers} giảng viên</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bài tập</CardTitle>
            <FileText className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.totalAssignments}</div>
            <p className="text-xs text-gray-600 mt-1">{mockStats.totalSubmissions} bài nộp</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoạt động hôm nay</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockStats.activeToday}</div>
            <p className="text-xs text-gray-600 mt-1">Người dùng online</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Người dùng</TabsTrigger>
          <TabsTrigger value="courses">Môn học</TabsTrigger>
          <TabsTrigger value="analytics">Thống kê</TabsTrigger>
          <TabsTrigger value="system">Hệ thống</TabsTrigger>
        </TabsList>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quản lý người dùng</CardTitle>
                  <CardDescription>Danh sách tất cả người dùng trong hệ thống</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm người dùng
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Tìm kiếm người dùng..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={selectedRole} onValueChange={setSelectedRole}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả vai trò</SelectItem>
                    <SelectItem value="student">Sinh viên</SelectItem>
                    <SelectItem value="teacher">Giảng viên</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="border rounded-lg">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Tên</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Email</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Vai trò</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Trạng thái</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Hoạt động</th>
                      <th className="text-left p-4 text-sm font-medium text-gray-600">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-t hover:bg-gray-50">
                        <td className="p-4 font-medium">{user.name}</td>
                        <td className="p-4 text-sm text-gray-600">{user.email}</td>
                        <td className="p-4">
                          <Badge variant={
                            user.role === 'admin' ? 'destructive' :
                            user.role === 'teacher' ? 'default' : 'secondary'
                          }>
                            {user.role === 'student' ? 'Sinh viên' :
                             user.role === 'teacher' ? 'Giảng viên' : 'Admin'}
                          </Badge>
                        </td>
                        <td className="p-4">
                          <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                            {user.status === 'active' ? 'Hoạt động' : 'Không hoạt động'}
                          </Badge>
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          {new Date(user.lastActive).toLocaleDateString('vi-VN')}
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Trash2 className="w-4 h-4 text-red-600" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Courses Tab */}
        <TabsContent value="courses" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Quản lý môn học</CardTitle>
                  <CardDescription>Danh sách các môn học trong hệ thống</CardDescription>
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm môn học
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockCourses.map((course) => (
                  <Card key={course.id}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <BookOpen className="w-5 h-5 text-blue-600" />
                            <h3 className="font-semibold text-lg">{course.name}</h3>
                            <Badge variant="outline">{course.code}</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">Giảng viên: {course.teacher}</p>
                          <div className="flex gap-6 text-sm">
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span>{course.students} sinh viên</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="w-4 h-4 text-gray-500" />
                              <span>{course.assignments} bài tập</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 mr-2" />
                            Chỉnh sửa
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Thống kê nộp bài
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Tuần này</span>
                      <span className="text-sm font-medium">423 bài</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-600 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Tuần trước</span>
                      <span className="text-sm font-medium">385 bài</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-green-600 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-gray-600">Tháng này</span>
                      <span className="text-sm font-medium">1847 bài</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-600 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Top sinh viên
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Trần Thị B', score: 95.5, rank: 1 },
                    { name: 'Nguyễn Văn A', score: 92.3, rank: 2 },
                    { name: 'Phạm Văn E', score: 89.7, rank: 3 },
                    { name: 'Hoàng Thị F', score: 87.2, rank: 4 }
                  ].map((student) => (
                    <div key={student.rank} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          student.rank === 1 ? 'bg-yellow-100 text-yellow-700' :
                          student.rank === 2 ? 'bg-gray-100 text-gray-700' :
                          student.rank === 3 ? 'bg-orange-100 text-orange-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          #{student.rank}
                        </div>
                        <span className="font-medium">{student.name}</span>
                      </div>
                      <span className="font-semibold text-green-600">{student.score}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Thống kê tổng quan</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Tỷ lệ nộp đúng hạn</div>
                  <div className="text-2xl font-bold text-green-600">87%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Điểm trung bình</div>
                  <div className="text-2xl font-bold text-blue-600">78.5</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Tỷ lệ đạt</div>
                  <div className="text-2xl font-bold text-purple-600">92%</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Bài tập khó nhất</div>
                  <div className="text-sm font-semibold">Tìm kiếm nhị phân</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Hiệu suất hệ thống</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Uptime</span>
                    <span className="text-sm font-medium text-green-600">{mockStats.systemUptime}%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-green-600 rounded-full" style={{ width: `${mockStats.systemUptime}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Response time</span>
                    <span className="text-sm font-medium">{mockStats.avgResponseTime}s</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">CPU Usage</span>
                    <span className="text-sm font-medium">42%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-600 rounded-full" style={{ width: '42%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-gray-600">Memory Usage</span>
                    <span className="text-sm font-medium">68%</span>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-600 rounded-full" style={{ width: '68%' }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hoạt động gần đây</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { action: 'Sinh viên Nguyễn Văn A nộp bài', time: '2 phút trước' },
                    { action: 'Giảng viên TS. Lê Văn C tạo bài tập mới', time: '15 phút trước' },
                    { action: 'Sinh viên Trần Thị B nộp bài', time: '23 phút trước' },
                    { action: 'Admin thêm người dùng mới', time: '1 giờ trước' },
                    { action: 'Hệ thống tự động backup dữ liệu', time: '2 giờ trước' }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className="w-2 h-2 bg-blue-600 rounded-full mt-2"></div>
                      <div className="flex-1">
                        <p className="text-sm">{activity.action}</p>
                        <p className="text-xs text-gray-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Cấu hình hệ thống</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">AI Auto-grading</h4>
                    <p className="text-sm text-gray-600">Tự động chấm điểm bằng Gemini AI</p>
                  </div>
                  <Badge variant="default">Đang bật</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Email Notifications</h4>
                    <p className="text-sm text-gray-600">Gửi thông báo qua email</p>
                  </div>
                  <Badge variant="default">Đang bật</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">Auto Backup</h4>
                    <p className="text-sm text-gray-600">Tự động backup mỗi 6 giờ</p>
                  </div>
                  <Badge variant="default">Đang bật</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
