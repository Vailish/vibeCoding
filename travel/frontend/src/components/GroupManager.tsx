import React, { useState, useEffect } from 'react';
import { groupService } from '../services/group';
import { Group, GroupWithMembers, CreateGroupRequest } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Input } from './ui/Input';
import { Label } from './ui/Label';

export const GroupManager: React.FC = () => {
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<GroupWithMembers | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [newGroup, setNewGroup] = useState<CreateGroupRequest>({
    name: '',
    description: ''
  });

  const [memberEmail, setMemberEmail] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    try {
      setIsLoading(true);
      const data = await groupService.getGroups();
      setGroups(data);
    } catch (err) {
      setError('그룹을 불러오는데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const loadGroupDetails = async (groupId: number) => {
    try {
      const data = await groupService.getGroup(groupId);
      setSelectedGroup(data);
    } catch (err) {
      setError('그룹 상세정보를 불러오는데 실패했습니다.');
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroup.name.trim()) {
      setError('그룹명을 입력해주세요.');
      return;
    }

    try {
      setIsLoading(true);
      const createdGroup = await groupService.createGroup(newGroup);
      setGroups([...groups, createdGroup]);
      setIsCreateModalOpen(false);
      setNewGroup({ name: '', description: '' });
      setError(null);
    } catch (err) {
      setError('그룹 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!confirm('정말로 이 그룹을 삭제하시겠습니까?')) return;

    try {
      await groupService.deleteGroup(groupId);
      setGroups(groups.filter(g => g.id !== groupId));
      if (selectedGroup?.id === groupId) {
        setSelectedGroup(null);
      }
    } catch (err) {
      setError('그룹 삭제에 실패했습니다.');
    }
  };

  const handleRemoveMember = async (userId: number) => {
    if (!selectedGroup) return;
    if (!confirm('정말로 이 멤버를 제거하시겠습니까?')) return;

    try {
      await groupService.removeMember(selectedGroup.id, userId);
      await loadGroupDetails(selectedGroup.id);
    } catch (err) {
      setError('멤버 제거에 실패했습니다.');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !memberEmail.trim()) return;

    try {
      const updatedGroup = await groupService.addMember(selectedGroup.id, {
        user_id: parseInt(memberEmail), // 실제로는 이메일로 사용자를 찾는 API가 필요
        role: 'member'
      });
      setSelectedGroup(updatedGroup);
      setMemberEmail('');
    } catch (err) {
      setError('멤버 추가에 실패했습니다.');
    }
  };

  if (isLoading && groups.length === 0) {
    return <div className="flex justify-center items-center h-64">로딩 중...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">그룹 관리</h2>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          새 그룹 만들기
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 그룹 목록 */}
        <div>
          <h3 className="text-lg font-semibold mb-4">내 그룹</h3>
          <div className="space-y-3">
            {groups.map((group) => (
              <Card key={group.id} className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-medium">{group.name}</h4>
                    {group.description && (
                      <p className="text-sm text-gray-600 mt-1">{group.description}</p>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      생성일: {new Date(group.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadGroupDetails(group.id)}
                    >
                      상세보기
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteGroup(group.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      삭제
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            {groups.length === 0 && (
              <p className="text-gray-500 text-center py-8">아직 그룹이 없습니다.</p>
            )}
          </div>
        </div>

        {/* 그룹 상세정보 */}
        <div>
          {selectedGroup ? (
            <div>
              <h3 className="text-lg font-semibold mb-4">
                {selectedGroup.name} 상세정보
              </h3>
              <Card className="p-4 mb-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">그룹명</label>
                    <p className="text-sm">{selectedGroup.name}</p>
                  </div>
                  {selectedGroup.description && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">설명</label>
                      <p className="text-sm">{selectedGroup.description}</p>
                    </div>
                  )}
                </div>
              </Card>

              <div className="space-y-4">
                <h4 className="font-medium">멤버 ({selectedGroup.members.length}명)</h4>
                
                {/* 멤버 추가 폼 */}
                <form onSubmit={handleAddMember} className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="사용자 ID 입력"
                    value={memberEmail}
                    onChange={(e) => setMemberEmail(e.target.value)}
                    className="flex-1"
                  />
                  <Button type="submit" size="sm">
                    추가
                  </Button>
                </form>

                {/* 멤버 목록 */}
                <div className="space-y-2">
                  {selectedGroup.members.map((member) => (
                    <Card key={member.id} className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium">{member.user_name}</p>
                          <p className="text-sm text-gray-600">{member.user_email}</p>
                          <span className={`inline-block px-2 py-1 text-xs rounded ${
                            member.role === 'admin' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {member.role === 'admin' ? '관리자' : '멤버'}
                          </span>
                        </div>
                        {member.role !== 'admin' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRemoveMember(member.user_id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            제거
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              그룹을 선택해주세요
            </div>
          )}
        </div>
      </div>

      {/* 그룹 생성 모달 */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">새 그룹 만들기</h3>
            <form onSubmit={handleCreateGroup} className="space-y-4">
              <div>
                <Label htmlFor="groupName">그룹명</Label>
                <Input
                  id="groupName"
                  type="text"
                  value={newGroup.name}
                  onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                  placeholder="그룹명을 입력하세요"
                  required
                />
              </div>
              <div>
                <Label htmlFor="groupDescription">설명 (선택)</Label>
                <textarea
                  id="groupDescription"
                  value={newGroup.description}
                  onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                  placeholder="그룹 설명을 입력하세요"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCreateModalOpen(false);
                    setNewGroup({ name: '', description: '' });
                    setError(null);
                  }}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? '생성 중...' : '생성'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
};