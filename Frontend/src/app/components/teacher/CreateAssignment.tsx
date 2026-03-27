import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { Textarea } from '@/app/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Separator } from '@/app/components/ui/separator';
import { Badge } from '@/app/components/ui/badge';
import { ArrowLeft, Plus, Trash2, Save, TestTube, Code } from 'lucide-react';

interface CreateAssignmentProps {
  onBack: () => void;
}

interface TestCase {
  id: string;
  input: string;
  expectedOutput: string;
  points: number;
  isHidden: boolean;
}

export function CreateAssignment({ onBack }: CreateAssignmentProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [course, setCourse] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [deadline, setDeadline] = useState('');
  const [maxScore, setMaxScore] = useState('100');
  const [testCases, setTestCases] = useState<TestCase[]>([
    { id: '1', input: '[5, 2, 8, 1, 9]', expectedOutput: '[1, 2, 5, 8, 9]', points: 25, isHidden: false }
  ]);

  const addTestCase = () => {
    const newId = (testCases.length + 1).toString();
    setTestCases([
      ...testCases,
      { id: newId, input: '', expectedOutput: '', points: 25, isHidden: false }
    ]);
  };

  const removeTestCase = (id: string) => {
    if (testCases.length > 1) {
      setTestCases(testCases.filter(tc => tc.id !== id));
    }
  };

  const updateTestCase = (id: string, field: keyof TestCase, value: any) => {
    setTestCases(testCases.map(tc => 
      tc.id === id ? { ...tc, [field]: value } : tc
    ));
  };

  const handleSave = () => {
    alert('Bài tập đã được tạo thành công!');
    onBack();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Tạo bài tập mới</h1>
          <p className="text-gray-600 mt-1">Điền thông tin và tạo test cases cho bài tập</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Lưu bài tập
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Assignment Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
              <CardDescription>Nhập thông tin chung về bài tập</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề bài tập *</Label>
                <Input
                  id="title"
                  placeholder="VD: Bài tập 1: Sắp xếp mảng"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="course">Môn học *</Label>
                <Select value={course} onValueChange={setCourse}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn môn học" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dsa">Cấu trúc dữ liệu và giải thuật</SelectItem>
                    <SelectItem value="web">Lập trình Web</SelectItem>
                    <SelectItem value="oop">Lập trình hướng đối tượng</SelectItem>
                    <SelectItem value="db">Cơ sở dữ liệu</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="difficulty">Độ khó</Label>
                  <Select value={difficulty} onValueChange={setDifficulty}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="easy">Dễ</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="hard">Khó</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxScore">Điểm tối đa</Label>
                  <Input
                    id="maxScore"
                    type="number"
                    value={maxScore}
                    onChange={(e) => setMaxScore(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Deadline *</Label>
                <Input
                  id="deadline"
                  type="datetime-local"
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Mô tả đề bài *</Label>
                <Textarea
                  id="description"
                  placeholder="Nhập mô tả chi tiết về yêu cầu bài tập..."
                  className="min-h-[150px]"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Test Cases */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <TestTube className="w-5 h-5" />
                    Test Cases
                  </CardTitle>
                  <CardDescription>Tạo các test case để chấm bài tự động</CardDescription>
                </div>
                <Button onClick={addTestCase} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Thêm test case
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {testCases.map((testCase, index) => (
                <div key={testCase.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Test case #{index + 1}</Badge>
                      {testCase.isHidden && <Badge variant="secondary">Ẩn</Badge>}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeTestCase(testCase.id)}
                      disabled={testCases.length === 1}
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Input</Label>
                      <Textarea
                        placeholder="VD: [5, 2, 8, 1, 9]"
                        value={testCase.input}
                        onChange={(e) => updateTestCase(testCase.id, 'input', e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Expected Output</Label>
                      <Textarea
                        placeholder="VD: [1, 2, 5, 8, 9]"
                        value={testCase.expectedOutput}
                        onChange={(e) => updateTestCase(testCase.id, 'expectedOutput', e.target.value)}
                        className="font-mono text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>Điểm</Label>
                      <Input
                        type="number"
                        value={testCase.points}
                        onChange={(e) => updateTestCase(testCase.id, 'points', parseInt(e.target.value))}
                      />
                    </div>
                    <div className="flex items-end">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={testCase.isHidden}
                          onChange={(e) => updateTestCase(testCase.id, 'isHidden', e.target.checked)}
                          className="w-4 h-4"
                        />
                        <span className="text-sm">Ẩn test case này</span>
                      </label>
                    </div>
                  </div>
                </div>
              ))}

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
                <strong>Lưu ý:</strong> Test case ẩn sẽ không hiển thị cho sinh viên khi họ làm bài.
                Điều này giúp đảm bảo sinh viên không thể hardcode output.
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right - Rubric and Settings */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Rubric chấm điểm</CardTitle>
              <CardDescription>Tiêu chí đánh giá bài làm</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Test cases đúng</span>
                  <span className="font-semibold">70%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Chất lượng code (AI)</span>
                  <span className="font-semibold">20%</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Độ phức tạp thuật toán</span>
                  <span className="font-semibold">10%</span>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <Label>Số lần nộp tối đa</Label>
                <Input type="number" defaultValue="5" />
              </div>
              
              <div className="space-y-2">
                <Label>Thời gian chạy tối đa (giây)</Label>
                <Input type="number" defaultValue="2" />
              </div>
              
              <div className="space-y-2">
                <Label>Bộ nhớ tối đa (MB)</Label>
                <Input type="number" defaultValue="128" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Ngôn ngữ cho phép
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {['JavaScript', 'Python', 'Java', 'C++', 'C#'].map((lang) => (
                <label key={lang} className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" defaultChecked className="w-4 h-4" />
                  <span className="text-sm">{lang}</span>
                </label>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tích hợp AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm">Bật Gemini AI feedback</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm">Phát hiện gian lận (plagiarism)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" defaultChecked className="w-4 h-4" />
                <span className="text-sm">Đánh giá độ phức tạp thuật toán</span>
              </label>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
