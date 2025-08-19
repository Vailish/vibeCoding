import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Label } from '../components/ui/Label';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import { authService } from '../services/auth';
import { useAuthStore } from '../stores/auth';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      login(data.user, data.token);
      navigate('/');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || '로그인에 실패했습니다.');
    }
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: () => {
      alert('회원가입이 완료되었습니다. 로그인해주세요.');
      setIsRegister(false);
      setName('');
      setPassword('');
    },
    onError: (error: any) => {
      alert(error.response?.data?.message || '회원가입에 실패했습니다.');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isRegister) {
      if (!name || !email || !password) {
        alert('모든 필드를 입력해주세요.');
        return;
      }
      registerMutation.mutate({ name, email, password });
    } else {
      if (!email || !password) {
        alert('이메일과 비밀번호를 입력해주세요.');
        return;
      }
      loginMutation.mutate({ email, password });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">
              Travel Planner
            </CardTitle>
            <p className="text-muted-foreground">
              {isRegister ? '새 계정을 만드세요' : '계정에 로그인하세요'}
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="이름을 입력하세요"
                    required={isRegister}
                  />
                </div>
              )}
              <div>
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={loginMutation.isPending || registerMutation.isPending}
              >
                {loginMutation.isPending || registerMutation.isPending 
                  ? '처리중...' 
                  : isRegister ? '회원가입' : '로그인'}
              </Button>
            </form>
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setName('');
                  setPassword('');
                }}
                className="text-primary hover:underline"
              >
                {isRegister 
                  ? '이미 계정이 있으신가요? 로그인' 
                  : '계정이 없으신가요? 회원가입'}
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default LoginPage