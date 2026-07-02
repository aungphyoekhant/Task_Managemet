# Project: Workspace Project & Task Management System

## Tech Stack

Frontend: React + TypeScript

Backend: Node.js + Express.js + TypeScript

Database: MongoDB + Mongoose / MySQL/ Postgresql

API Integration: Axios

Auth: JWT

---

# Roles

## Owner

First registered user. Can manage workspace, users, projects, and tasks.

## Admin

Can manage projects, tasks, and members, but cannot manage workspace owner.

## Member

Can view assigned projects and update assigned tasks.

---

# Core Hierarchy

```
Workspace
 ├── Users
 ├── Projects
 │    └── Tasks
```

Important rule:

```
Every User, Project, and Task must belong to one workspace.
```

---

# Epic 1: Workspace Registration & Authentication

## US-001: Create Workspace

**As a new user, I want to create a workspace so that I can manage my team and projects.**

### Acceptance Criteria

- User enters workspace name, name, email, and password.
- System creates a workspace.
- System creates the first user.
- First user role is automatically `owner`.
- User is linked to the created workspace.
- JWT token is generated after registration.

### Technical Rules

```
User.role = owner
User.workspaceId = Workspace._id
Workspace.ownerId = User._id
```

---

## US-002: Login

**As a registered user, I want to log in so that I can access my workspace.**

### Acceptance Criteria

- User enters email and password.
- System validates credentials.
- System returns JWT token.
- JWT includes userId, workspaceId, and role.
- User is redirected to dashboard.

### JWT Payload Example

```
{
  "userId":"userId",
  "workspaceId":"workspaceId",
  "role":"owner"
}
```

---

## US-003: Logout

**As a logged-in user, I want to log out so that my account is secure.**

### Acceptance Criteria

- JWT token is removed from frontend storage.
- User is redirected to login page.
- Protected pages are no longer accessible.

---

## US-004: View My Profile

**As a logged-in user, I want to view my profile so that I can see my account information.**

### Acceptance Criteria

- User can see name, email, role, and workspace name.
- Password is never returned.

---

## US-005: Update My Profile

**As a logged-in user, I want to update my profile so that my information stays current.**

### Acceptance Criteria

- User can update name.
- User can update avatar.
- User cannot update role.
- User cannot update workspaceId.

---

# Epic 2: Workspace Management

## US-006: View Workspace Details

**As an Owner, I want to view workspace details so that I can manage my workspace.**

### Acceptance Criteria

- Owner can see workspace name.
- Owner can see total members.
- Owner can see total projects.
- Owner can see total tasks.
- Only data from the current workspace is shown.

---

## US-007: Update Workspace Settings

**As an Owner, I want to update workspace settings so that workspace information stays correct.**

### Acceptance Criteria

- Owner can update workspace name.
- Owner can update workspace logo.
- Admin and Member cannot update workspace settings.
- Workspace update is scoped by authenticated user’s workspaceId.

---

## US-008: Delete Workspace

**As an Owner, I want to delete my workspace when it is no longer needed.**

### Acceptance Criteria

- Only Owner can delete workspace.
- Confirmation is required.
- Related users, projects, tasks, and invitations are deleted or archived.
- Owner cannot delete another workspace.

---

# Epic 3: Member Management

## US-009: Invite User

**As an Owner, I want to invite users to my workspace so that they can collaborate.**

### Acceptance Criteria

- Owner enters email.
- Owner selects role: `admin` or `member`.
- Invitation is linked to Owner’s workspace.
- User cannot be invited twice to the same workspace.
- Invitation status starts as `pending`.

### Technical Rule

```
Invitation.workspaceId = req.user.workspaceId
```

---

## US-010: Admin Invite Member

**As an Admin, I want to invite members so that I can help grow the workspace team.**

### Acceptance Criteria

- Admin can only invite users as `member`.
- Admin cannot invite another `admin`.
- Admin cannot invite `owner`.
- Invitation belongs to Admin’s workspace.

---

## US-011: Accept Invitation

**As an invited user, I want to accept an invitation so that I can join the workspace.**

### Acceptance Criteria

- User opens invitation link.
- User enters name and password.
- System creates user account.
- User role comes from invitation.
- User workspaceId comes from invitation.
- Invitation status changes to `accepted`.

### Technical Rule

```
User.workspaceId = Invitation.workspaceId
User.role = Invitation.role
```

---

## US-012: View Workspace Members

**As an Owner or Admin, I want to view workspace members so that I can manage users.**

### Acceptance Criteria

- Owner/Admin can view members in their workspace.
- Users from other workspaces are not returned.
- List shows name, email, role, and status.

### Technical Rule

```
User.find({ workspaceId:req.user.workspaceId })
```

---

## US-013: Update Member Role

**As an Owner, I want to update member roles so that I can control permissions.**

### Acceptance Criteria

- Owner can promote `member` to `admin`.
- Owner can demote `admin` to `member`.
- Owner cannot change their own role.
- Owner role cannot be assigned to another user in MVP.
- Admin and Member cannot update roles.
- Role update only applies to users in the same workspace.

---

## US-014: Remove Member

**As an Owner or Admin, I want to remove users so that I can manage workspace access.**

### Acceptance Criteria

- Owner can remove Admin or Member.
- Admin can remove Member only.
- Nobody can remove Owner.
- Removed user can no longer access the workspace.
- User must belong to the same workspace.

---

# Epic 4: Project Management

## US-015: Create Project

**As an Owner or Admin, I want to create a project inside my workspace so that work can be organized.**

### Acceptance Criteria

- Project name is required.
- Description is optional.
- Start date and end date are optional.
- Status defaults to `planning`.
- Project is automatically linked to authenticated user’s workspace.
- Frontend does not send workspaceId.
- Member cannot create project.

### Technical Rule

```
Project.workspaceId = req.user.workspaceId
Project.createdBy = req.user.userId
```

---

## US-016: View Projects

**As a user, I want to view projects so that I can see work in my workspace.**

### Acceptance Criteria

- Owner/Admin can see all projects in their workspace.
- Member can see only assigned projects.
- Projects from other workspaces are never returned.

### Technical Rule

```
Project.find({ workspaceId:req.user.workspaceId })
```

---

## US-017: View Project Details

**As a user, I want to view project details so that I can understand project information.**

### Acceptance Criteria

- User can see project name, description, status, dates, members, and tasks.
- User can only view projects inside their workspace.
- Member can only view assigned projects.

---

## US-018: Update Project

**As an Owner or Admin, I want to update project details so that project information stays accurate.**

### Acceptance Criteria

- Owner/Admin can update name, description, status, start date, and end date.
- Member cannot update project details.
- Project must belong to authenticated user’s workspace.

---

## US-019: Delete Project

**As an Owner, I want to delete a project so that unused projects can be removed.**

### Acceptance Criteria

- Only Owner can delete project.
- Confirmation is required.
- Project must belong to Owner’s workspace.
- Related tasks are deleted or archived.

---

## US-020: Assign Members to Project

**As an Owner or Admin, I want to assign workspace members to a project so that they can work on it.**

### Acceptance Criteria

- Owner/Admin can add members to project.
- Owner/Admin can remove members from project.
- Only users from the same workspace can be assigned.
- Project must belong to the same workspace.

---

# Epic 5: Task Management

## US-021: Create Task

**As an Owner or Admin, I want to create tasks under a project so that work can be assigned.**

### Acceptance Criteria

- Task title is required.
- Task belongs to a project.
- Task can be assigned to a workspace member.
- Status defaults to `todo`.
- Project must belong to authenticated user’s workspace.
- Task automatically inherits workspaceId from project.

### Technical Rule

```
Task.projectId = Project._id
Task.workspaceId = Project.workspaceId
```

---

## US-022: View Tasks

**As a user, I want to view tasks so that I can track work.**

### Acceptance Criteria

- Owner/Admin can view all tasks in workspace.
- Member can view assigned tasks.
- Tasks from other workspaces are never returned.
- Tasks show title, assignee, priority, status, and due date.

### Technical Rule

```
Task.find({ workspaceId:req.user.workspaceId })
```

---

## US-023: View Task Details

**As a user, I want to view task details so that I can understand the work.**

### Acceptance Criteria

- User can see title, description, project, assignee, priority, status, and due date.
- Task must belong to authenticated user’s workspace.
- Member can only view assigned tasks or tasks in assigned projects.

---

## US-024: Update Task Details

**As an Owner or Admin, I want to update task details so that task information stays correct.**

### Acceptance Criteria

- Owner/Admin can update title, description, assignee, priority, due date, and status.
- Task must belong to authenticated user’s workspace.
- Assigned user must belong to the same workspace.

---

## US-025: Update My Task Status

**As an assigned Member, I want to update my task status so that I can report progress.**

### Acceptance Criteria

- Assigned Member can update status only.
- Status options are `todo`, `in-progress`, and `done`.
- Member cannot change title, description, priority, due date, or assignee.
- Member can only update tasks assigned to them.

---

## US-026: Delete Task

**As an Owner or Admin, I want to delete tasks so that unnecessary work can be removed.**

### Acceptance Criteria

- Owner/Admin can delete task.
- Member cannot delete task.
- Confirmation is required.
- Task must belong to authenticated user’s workspace.

---

# Epic 6: Dashboard

## US-027: View Owner/Admin Dashboard

**As an Owner or Admin, I want to view workspace statistics so that I can understand team progress.**

### Acceptance Criteria

- Show total members.
- Show total projects.
- Show total tasks.
- Show completed tasks.
- Show pending tasks.
- Show overdue tasks.
- All statistics are scoped by workspaceId.

---

## US-028: View Member Dashboard

**As a Member, I want to view my work summary so that I can track my responsibilities.**

### Acceptance Criteria

- Show assigned projects.
- Show assigned tasks.
- Show completed assigned tasks.
- Show pending assigned tasks.
- Member only sees their own assigned work.

---

# Epic 7: Search & Filters

## US-029: Search Projects

**As a user, I want to search projects by name so that I can quickly find a project.**

### Acceptance Criteria

- Search is case-insensitive.
- Results are scoped by workspaceId.
- Member only sees assigned projects.

---

## US-030: Filter Projects by Status

**As a user, I want to filter projects by status so that I can organize project views.**

### Acceptance Criteria

- Filter options: `planning`, `active`, `completed`.
- Results are scoped by workspaceId.
- Filter works together with search.

---

## US-031: Search Tasks

**As a user, I want to search tasks by title so that I can quickly find work.**

### Acceptance Criteria

- Search is case-insensitive.
- Results are scoped by workspaceId.
- Member only sees assigned tasks.

---

## US-032: Filter Tasks by Status

**As a user, I want to filter tasks by status so that I can focus on specific work.**

### Acceptance Criteria

- Filter options: `todo`, `in-progress`, `done`.
- Results are scoped by workspaceId.
- Filter works together with search.

---

## US-033: Filter Tasks by Assignee

**As an Owner or Admin, I want to filter tasks by assignee so that I can review member workload.**

### Acceptance Criteria

- Owner/Admin can select workspace member.
- System shows tasks assigned to selected member.
- Selected assignee must belong to the same workspace.

---

# Epic 8: Multi-Tenant Workspace Security

## US-034: Protect Workspace Data

**As a system, I must ensure users can only access data from their own workspace.**

### Acceptance Criteria

- All project queries are filtered by workspaceId.
- All task queries are filtered by workspaceId.
- All user queries are filtered by workspaceId.
- Users cannot access another workspace’s data by changing URL params.
- Unauthorized access returns `403 Forbidden`.

---

## US-035: Validate Project Workspace

**As a system, I must validate project ownership before creating or viewing tasks.**

### Acceptance Criteria

- Backend checks project.workspaceId against req.user.workspaceId.
- If project does not belong to user workspace, return `403 Forbidden`.
- Task cannot be created under another workspace’s project.

---

## US-036: Validate User Assignment

**As a system, I must ensure tasks are assigned only to users from the same workspace.**

### Acceptance Criteria

- Assigned user must exist.
- Assigned user must belong to same workspace.
- User from another workspace cannot be assigned.

---

# Epic 9: Optional Features

## US-037: Add Task Comment

**As a user, I want to comment on a task so that I can discuss work with teammates.**

### Acceptance Criteria

- User can comment on accessible tasks.
- Comment stores author and created date.
- Comment belongs to task and workspace.

---

## US-038: View Activity Logs

**As an Owner or Admin, I want to view workspace activity logs so that I can track important actions.**

### Acceptance Criteria

- Log user invited.
- Log project created.
- Log task created.
- Log task status changed.
- Logs are scoped by workspaceId.

---

## US-039: Task Assignment Notification

**As a user, I want to receive notification when a task is assigned to me.**

### Acceptance Criteria

- Notification is created when task is assigned.
- User only sees notifications from their workspace.

---

# Recommended MVP for Interns

## Sprint 1: Auth & Workspace

- US-001 to US-005

## Sprint 2: Workspace Members

- US-006 to US-014

## Sprint 3: Projects

- US-015 to US-020

## Sprint 4: Tasks

- US-021 to US-026

## Sprint 5: Dashboard, Search & Security

- US-027 to US-036

## Bonus Sprint

- US-037 to US-039