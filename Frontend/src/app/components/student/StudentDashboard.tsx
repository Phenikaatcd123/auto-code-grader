import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Badge } from '@/app/components/ui/badge';
import { Button } from '@/app/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs';
import { Progress } from '@/app/components/ui/progress';
import { 
  BookOpen, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Trophy,
  FileCode,
  TrendingUp
} from 'lucide-react';
import { AssignmentDetail } from './AssignmentDetail';
import { useAuth } from '@/app/contexts/AuthContext';

// Mock data
const mockAssignments = [
  {
    id: '1',
    title: 'Bài tập 1: Sắp xếp mảng',
    course: 'Cấu trúc dữ liệu và giải thuật',
    deadline: '2026-01-30T23:59:59',
    status: 'submitted',
    score: 85,
    maxScore: 100,
    difficulty: 'medium',
    description: 'Viết chương trình sắp xếp mảng số nguyên theo thứ tự tăng dần'
  },
  {
    id: '2',
    title: 'Bài tập 2: Tìm kiếm nhị phân',
    course: 'Cấu trúc dữ liệu và giải thuật',
    deadline: '2026-02-05T23:59:59',
    status: 'in_progress',
    score: 0,
    maxScore: 100,
    difficulty: 'hard',
    description: 'Cài đặt thuật toán tìm kiếm nhị phân trên mảng đã sắp xếp'
  },
  {
    id: '3',
    title: 'Bài tập 3: Linked List',
    course: 'Cấu trúc dữ liệu và giải thuật',
    deadline: '2026-02-10T23:59:59',
    status: 'pending',
    score: 0,
    maxScore: 100,
    difficulty: 'medium',
    description: 'Cài đặt danh sách liên kết đơn với các thao tác cơ bản'
  },
  {
    id: '4',
    title: 'Lab 1: Web Server với Node.js',
    course: 'Lập trình Web',
    deadline: '2026-01-28T23:59:59',
    status: 'submitted',
    score: 95,
    maxScore: 100,
    difficulty: 'easy',
    description: 'Tạo một web server đơn giản sử dụng Node.js và Express'
  }
];

export function StudentDashboard() {
  const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
  const { user } = useAuth();

  if (selectedAssignment) {
    const assignment = mockAssignments.find(a => a.id === selectedAssignment);
    return (
      <AssignmentDetail
        assignment={assignment!}
        onBack={() => setSelectedAssignment(null)}
      />
    );
  }

  const submittedCount = mockAssignments.filter(a => a.status === 'submitted').length;
  const averageScore = mockAssignments
    .filter(a => a.status === 'submitted')
    .reduce((sum, a) => sum + a.score, 0) / submittedCount || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Xin chào, {user?.name}!</h1>
        <p className="text-gray-600 mt-1">Chào mừng bạn quay trở lại hệ thống nộp bài</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng bài tập</CardTitle>
            <BookOpen className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockAssignments.length}</div>
            <p className="text-xs text-gray-600 mt-1">Trong học kỳ này</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã nộp</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submittedCount}</div>
            <Progress value={(submittedCount / mockAssignments.length) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Điểm trung bình</CardTitle>
            <Trophy className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageScore.toFixed(1)}</div>
            <p className="text-xs text-gray-600 mt-1">Trên 100 điểm</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sắp đến hạn</CardTitle>
            <Clock className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockAssignments.filter(a => a.status !== 'submitted').length}
            </div>
            <p className="text-xs text-gray-600 mt-1">Bài tập cần nộp</p>
          </CardContent>
        </Card>
      </div>

      {/* Assignments */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">Tất cả</TabsTrigger>
          <TabsTrigger value="pending">Chưa nộp</TabsTrigger>
          <TabsTrigger value="submitted">Đã nộp</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4 mt-4">
          {mockAssignments.map((assignment) => (
            <AssignmentCard
              key={assignment.id}
              assignment={assignment}
              onClick={() => setSelectedAssignment(assignment.id)}
            />
          ))}
        </TabsContent>

        <TabsContent value="pending" className="space-y-4 mt-4">
          {mockAssignments
            .filter(a => a.status !== 'submitted')
            .map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onClick={() => setSelectedAssignment(assignment.id)}
              />
            ))}
        </TabsContent>

        <TabsContent value="submitted" className="space-y-4 mt-4">
          {mockAssignments
            .filter(a => a.status === 'submitted')
            .map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onClick={() => setSelectedAssignment(assignment.id)}
              />
            ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function AssignmentCard({ assignment, onClick }: { assignment: any; onClick: () => void }) {
  const isOverdue = new Date(assignment.deadline) < new Date() && assignment.status !== 'submitted';
  const daysLeft = Math.ceil((new Date(assignment.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={onClick}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <FileCode className="w-5 h-5 text-gray-600" />
              <h3 className="font-semibold text-lg">{assignment.title}</h3>
              <Badge variant={
                assignment.difficulty === 'easy' ? 'default' :
                assignment.difficulty === 'medium' ? 'secondary' : 'destructive'
              }>
                {assignment.difficulty === 'easy' ? 'Dễ' :
                 assignment.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
              </Badge>
            </div>
            <p className="text-sm text-gray-600 mb-3">{assignment.course}</p>
            <p className="text-sm text-gray-700 mb-4">{assignment.description}</p>
            
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1 text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  {isOverdue ? (
                    <span className="text-red-600 font-medium">Quá hạn</span>
                  ) : assignment.status === 'submitted' ? (
                    <span className="text-green-600">Đã nộp</span>
                  ) : (
                    <span>Còn {daysLeft} ngày</span>
                  )}
                </span>
              </div>
              
              {assignment.status === 'submitted' && (
                <div className="flex items-center gap-1">
                  {assignment.score >= 70 ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-600" />
                  )}
                  <span className="font-medium">
                    {assignment.score}/{assignment.maxScore} điểm
                  </span>
                </div>
              )}
            </div>
          </div>

          <Button variant="outline" size="sm">
            {assignment.status === 'submitted' ? 'Xem chi tiết' : 'Nộp bài'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
