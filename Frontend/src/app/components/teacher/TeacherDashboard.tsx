import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Badge } from '@/app/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  Plus,
  Eye,
  Edit,
  BarChart3
} from 'lucide-react';
import { useAuth } from '@/app/contexts/AuthContext';
import { CreateAssignment } from './CreateAssignment';
import { ViewSubmissions } from './ViewSubmissions';

const mockAssignments = [
  {
    id: '1',
    title: 'Bài tập 1: Sắp xếp mảng',
    course: 'Cấu trúc dữ liệu và giải thuật',
    deadline: '2026-01-30T23:59:59',
    totalStudents: 45,
    submitted: 38,
    graded: 35,
    averageScore: 78.5,
    status: 'active'
  },
  {
    id: '2',
    title: 'Bài tập 2: Tìm kiếm nhị phân',
    course: 'Cấu trúc dữ liệu và giải thuật',
    deadline: '2026-02-05T23:59:59',
    totalStudents: 45,
    submitted: 12,
    graded: 0,
    averageScore: 0,
    status: 'active'
  },
  {
    id: '3',
    title: 'Lab 1: Web Server với Node.js',
    course: 'Lập trình Web',
    deadline: '2026-01-28T23:59:59',
    totalStudents: 52,
    submitted: 50,
    graded: 50,
    averageScore: 85.2,
    status: 'closed'
  }
];

export function TeacherDashboard() {
  const { user } = useAuth();
  const [view, setView] = useState<'dashboard' | 'create' | 'submissions'>('dashboard');
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);

  if (view === 'create') {
    return <CreateAssignment onBack={() => setView('dashboard')} />;
  }

  if (view === 'submissions' && selectedAssignment) {
    const assignment = mockAssignments.find(a => a.id === selectedAssignment);
    return (
      <ViewSubmissions
        assignment={assignment!}
        onBack={() => {
          setView('dashboard');
          setSelectedAssignment(null);
        }}
      />
    );
  }

  const totalStudents = mockAssignments.reduce((sum, a) => sum + a.totalStudents, 0);
  const totalSubmissions = mockAssignments.reduce((sum, a) => sum + a.submitted, 0);
  const needsGrading = mockAssignments.reduce((sum, a) => sum + (a.submitted - a.graded), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý bài tập</h1>
          <p className="text-gray-600 mt-1">Xin chào, {user?.name}</p>
        </div>
        <Button onClick={() => setView('create')}>
          <Plus className="w-4 h-4 mr-2" />
          Tạo bài tập mới
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng bài tập</CardTitle>
            <FileText className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAssignments.length}</div>
            <p className="text-xs text-gray-600 mt-1">Trong học kỳ này</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng sinh viên</CardTitle>
            <Users className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-gray-600 mt-1">Đã đăng ký môn học</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bài nộp</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions}</div>
            <p className="text-xs text-gray-600 mt-1">Tổng số bài đã nộp</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cần chấm</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{needsGrading}</div>
            <p className="text-xs text-gray-600 mt-1">Bài đang chờ chấm</p>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Tất cả bài tập</TabsTrigger>
          <TabsTrigger value="active">Đang mở</TabsTrigger>
          <TabsTrigger value="closed">Đã đóng</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {mockAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onView={() => {
                setSelectedAssignment(assignment.id);
                setView('submissions');
              }}
              onEdit={() => setView('create')}
            />
          ))}
        </TabsContent>

        <TabsContent value="active" className="space-y-4 mt-4">
          {mockAssignments
            .filter(a => a.status === 'active')
            .map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onView={() => {
                  setSelectedAssignment(assignment.id);
                  setView('submissions');
                }}
                onEdit={() => setView('create')}
              />
            ))}
        </TabsContent>

        <TabsContent value="closed" className="space-y-4 mt-4">
          {mockAssignments
            .filter(a => a.status === 'closed')
            .map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onView={() => {
                  setSelectedAssignment(assignment.id);
                  setView('submissions');
                }}
                onEdit={() => setView('create')}
              />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AssignmentCard({ assignment, onView, onEdit }: { assignment: any; onView: () => void; onEdit: () => void }) {
  const submissionRate = Math.round((assignment.submitted / assignment.totalStudents) * 100);
  const gradingProgress = assignment.submitted > 0 ? Math.round((assignment.graded / assignment.submitted) * 100) : 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{assignment.title}</h3>
              <Badge variant={assignment.status === 'active' ? 'default' : 'secondary'}>
                {assignment.status === 'active' ? 'Đang mở' : 'Đã đóng'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-4">{assignment.course}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div>
                <div className="text-sm text-gray-600">Sinh viên</div>
                <div className="text-lg font-semibold">{assignment.totalStudents}</div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Đã nộp</div>
                <div className="text-lg font-semibold text-green-600">
                  {assignment.submitted} ({submissionRate}%)
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Đã chấm</div>
                <div className="text-lg font-semibold text-blue-600">
                  {assignment.graded} ({gradingProgress}%)
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-600">Điểm TB</div>
                <div className="text-lg font-semibold">
                  {assignment.averageScore > 0 ? assignment.averageScore.toFixed(1) : '-'}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4" />
              <span>Hạn nộp: {new Date(assignment.deadline).toLocaleString('vi-VN')}</span>
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <Button variant="outline" size="sm" onClick={onView}>
              <Eye className="w-4 h-4 mr-2" />
              Xem bài nộp
            </Button>
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
