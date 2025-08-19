import api from '../lib/api';
import { Group, GroupWithMembers, CreateGroupRequest, UpdateGroupRequest, InviteMemberRequest } from '../types';

export const groupService = {
  async getGroups(): Promise<Group[]> {
    const response = await api.get('/groups');
    return response.data;
  },

  async getGroup(id: number): Promise<GroupWithMembers> {
    const response = await api.get(`/groups/${id}`);
    return response.data;
  },

  async createGroup(data: CreateGroupRequest): Promise<GroupWithMembers> {
    const response = await api.post('/groups', data);
    return response.data;
  },

  async updateGroup(id: number, data: UpdateGroupRequest): Promise<GroupWithMembers> {
    const response = await api.put(`/groups/${id}`, data);
    return response.data;
  },

  async deleteGroup(id: number): Promise<void> {
    await api.delete(`/groups/${id}`);
  },

  async addMember(groupId: number, data: InviteMemberRequest): Promise<GroupWithMembers> {
    const response = await api.post(`/groups/${groupId}/members`, data);
    return response.data;
  },

  async removeMember(groupId: number, userId: number): Promise<void> {
    await api.delete(`/groups/${groupId}/members/${userId}`);
  },

  async updateMemberRole(groupId: number, userId: number, role: 'admin' | 'member'): Promise<GroupWithMembers> {
    const response = await api.put(`/groups/${groupId}/members/${userId}/role`, { role });
    return response.data;
  }
};