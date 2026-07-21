import { Role, ProjectStatus, TaskStatus, Priority, InvitationStatus } from "../generated/prisma/client";
// 1. Auth Payloads
export type RegisterPayload = {
  email: string;
  password: string;
  name: string;
};

export type ComparePassword = {
  password: string;
  hash: string;
};

export type UpdateTokenPayload = {
  userId: number;
  token: string | null;
};

export type RefreshTokenPayload = {
  id: number;
  token: string;
};

export type AccessPayload = {
  id: number;
  email: string;
  role: Role;
};

export type InvitationTokenPayload = {
  invitationId: number;
  email: string;
};

export type RefreshPayload = {
  id: number;
};

export type UserResponse = {
  id: number;
  email: string;
  name: string | null;
  role: Role;
};

// 2. Workspace & Member Management
export type AddMemberPayload = {
  userId: number;
  workspaceId: number;
  role: Role;
};


export type CreateProjectPayload = {
  workspaceId: number;
  createBy: number;
  name: string;
  description?: string;
  status?: ProjectStatus;
  startDate?: string | Date; 
  endDate?: string | Date;
};

// 4. Task Management
export type CreateTaskPayload = {
  workspaceId: number;
  projectId: number;
  title: string;
  description?: string;
  priority?: Priority;
  status?: TaskStatus;
  dueDate?: Date;
};
export type AssignTaskPayload = {
  taskId: number;
  userIdToAssign: number; // assignedTo အစား ဤသို့ပြောင်းပါ
  workspaceId: number;
  projectId: number;
};

// 5. Invitation
export type CreateInvitationPayload = {
  workspaceId: number;
  email: string;
  role: Role;
  invitedBy: number;
};

// 6. Comment & Notification
export type CreateCommentPayload = {
  workspaceId: number;
  taskId: number;
  authorId: number;
  content: string;
};

export type UpdateInvitationPayload = {
  id: number;
  status: InvitationStatus;
};

export type UpsertProfileData = {
  name: string;
  avatar: string;
  jobTitle?: string;
  bio?: string;
  phone?: string;
  workspaceId?: number;
};

export type WorkspaceUserRole = {
  workspaceId: number;
  role: Role;
  userId: number;
};
export type WorkspaceUser = {
  workspaceId : number,
  userId: number
}
export type WorkspaceUserParams = {
  userId: number;
  workspaceId: number;
};
