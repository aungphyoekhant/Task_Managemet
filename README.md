# Task Backend

Task Backend က workspace အခြေပြု task management system အတွက် Node.js backend API project ဖြစ်ပါတယ်။ User account, login/logout, workspace, profile, invitation, project, member role management တွေကို Express + Prisma + PostgreSQL နဲ့ရေးထားပါတယ်။

## Project စတင်ခဲ့သောနေ့

ဒီ repo ရဲ့ git history အရ project ကို **2026-06-22** မှာ `first commit` နဲ့စတင်ထားပါတယ်။

## အသုံးပြုထားသောနည်းပညာများ

- **Runtime / Language**: Node.js, TypeScript
- **Backend Framework**: Express 5
- **Database ORM**: Prisma 7
- **Database**: PostgreSQL
- **Database Adapter**: `@prisma/adapter-pg`, `pg`
- **Authentication**: JWT (`jsonwebtoken`)
- **Password Hashing**: `bcrypt`
- **Email Sending**: Nodemailer Gmail transporter
- **Logging**: Winston, Morgan
- **Environment Config**: dotenv
- **Dev Runner**: `tsx watch`
- **Seeder / Fake Data**: `@faker-js/faker`

## Project ဖွဲ့စည်းပုံ

```txt
task_backend/
├── controllers/       # Request/response handling
├── services/          # Business logic နှင့် Prisma query logic
├── routes/            # API route definitions
├── middlewares/       # Auth, role, permission, request logger
├── lib/               # Prisma client, logger, nodemailer setup
├── prisma/            # Prisma schema နှင့် migrations
├── seed/              # Seed data scripts
├── logs/              # Winston log files
├── index.ts           # Express app entry point
├── route.ts           # Root route aggregator
├── package.json       # Scripts/dependencies
└── tsconfig.json      # TypeScript config
```

## Database Design

Prisma schema ထဲမှာ အောက်ပါ main models တွေရှိပါတယ်။

- `User`: user account, email, password, role, refresh token
- `Profile`: user profile name/avatar
- `Workspace`: workspace data, owner, logo
- `WorkspaceUser`: workspace membership နှင့် role
- `Project`: workspace အောက်က project
- `ProjectUser`: project member relation
- `Task`: project task model
- `Comment`: task comment model
- `Notification`: workspace notification model
- `UserNoti`: user-notification relation
- `ActivityLog`: workspace activity log
- `Invitation`: workspace invite record

Enums:

- `Role`: `OWNER`, `ADMIN`, `MEMBER`
- `ProjectStatus`: `PENDING`, `ACTIVE`, `COMPLETED`
- `TaskStatus`: `PENDING`, `IN_PROGRESS`, `COMPLETED`
- `Priority`: `LOW`, `MEDIUM`, `HIGH`
- `InvitationStatus`: `PENDING`, `ACCEPTED`, `REJECTED`

## API Features ရေးထားပြီးသောအပိုင်းများ

### Authentication

- User login/logout
- Access token / refresh token generation
- Password hash စစ်ခြင်း
- Auth middleware ဖြင့် JWT verify လုပ်ခြင်း
- Invitation-aware register/login flow

Main routes:

- `POST /userAuth/register`
- `POST /userAuth/login`
- `DELETE /userAuth/logout`
- `POST /users/login`
- `POST /users/refresh`
- `POST /users/logout`

မှတ်ချက်: Auth route နှစ်စုံ (`/userAuth` နှင့် `/users`) ရှိနေပြီး နောက်ပိုင်းမှာ naming/behavior ကိုတစ်မျိုးတည်းဖြစ်အောင်ပြန်ညှိသင့်ပါတယ်။

### Profile

- Authenticated user profile ကြည့်ခြင်း
- Profile create/update ကို upsert နဲ့ရေးထားခြင်း

Routes:

- `GET /users/profile`
- `POST /users/profile`

### Workspace

- Workspace list ကြည့်ခြင်း
- Workspace detail ကြည့်ခြင်း
- Workspace create/update/delete
- Workspace create လုပ်တဲ့အချိန် `WorkspaceUser` relation ပါ transaction နဲ့ထည့်ခြင်း

Routes:

- `GET /users/workspaces`
- `GET /users/workspace/:id`
- `POST /users/workspace`
- `PUT /users/workspace/:id`
- `DELETE /users/workspace/:id`

### Invitation

- Workspace ထဲကို email နဲ့ invite ပို့ခြင်း
- Invite token generate လုပ်ခြင်း
- Nodemailer နဲ့ invite email ပို့ခြင်း
- Invite accept လုပ်တဲ့အခါ existing user ဆို workspace member အဖြစ်ထည့်ခြင်း
- New user ဆို register လုပ်ရန် response ပြန်ခြင်း
- Owner/Admin permission checking ပါရှိခြင်း

Routes:

- `POST /users/workspace/invited`
- `POST /users/accept`

### Role / Permission

- JWT auth middleware
- Owner-only middleware
- Invite permission middleware
- Project create permission middleware
- Workspace member role update
- Member delete permission

Routes:

- `POST /users/updateRole`
- `DELETE /workspaces/:workspaceId/members/:userId`

### Project

- Workspace အောက်မှာ project create လုပ်ခြင်း
- Start date / end date validation
- Admin/Owner permission စစ်ခြင်း
- Service layer ထဲမှာ get/update/delete project methods တွေပါရှိပေမယ့် route အနေနဲ့ create route ပဲချိတ်ထားသေးပါတယ်။

Route:

- `POST /users/:workspaceId/projects`

### Logging

- Morgan request log ကို Winston ထဲ write လုပ်ထားပါတယ်။
- Log files:
  - `logs/combined.log`
  - `logs/error.log`
  - `logs/exceptions.log`

## နေ့အလိုက်ရေးထားသောအလုပ်များ

### 2026-06-22 - Project setup / database foundation

Git commit: `ebeceb9 first commit`

ပြီးထားသောအပိုင်းများ:

- Node.js + TypeScript project setup
- Express server entry (`index.ts`)
- Prisma config/schema/migrations စတင်ရေးခြင်း
- PostgreSQL connection setup (`lib/prisma.ts`)
- Winston logger setup
- Morgan request logger middleware
- Basic route/controller/service structure စတင်ခြင်း
- User/Profile route အခြေခံများ
- Seeder setup နှင့် owner seed user

### 2026-06-23 - Login/logout, workspace, profile, invitation foundation

Git commit: `704a579 Login/Logout/workspacecreate/profileowner/workspaceadmi-invited/`

ပြီးထားသောအပိုင်းများ:

- User login/logout logic
- Refresh token save/remove flow
- Profile get/upsert
- Workspace CRUD
- Workspace owner role middleware
- Workspace invite controller/service
- Nodemailer email setup
- Workspace invitation route
- Prisma schema/migration updates

### 2026-06-24 - Invitation accept / auth refinement

Git commit: `614e72e invitatin`

ပြီးထားသောအပိုင်းများ:

- `/userAuth/register`, `/userAuth/login`, `/userAuth/logout`
- Invitation token accept flow
- Existing user ကို workspace member အဖြစ်ထည့်ခြင်း
- New user ကို register လုပ်ရန် response ပြန်ခြင်း
- Invitation status update
- Invitation-aware login/register
- Profile/user/workspace invitation logic update

### 2026-06-25 မှ 2026-06-26 - လက်ရှိ working tree ထဲရှိ ထပ်ရေးထားသောအပိုင်းများ

Git commit မတင်ရသေးသော local changes အရ ထပ်တိုးထားသောအပိုင်းများ:

- Root route aggregator (`route.ts`)
- `authMiddleware.ts` အသစ်
- Invite permission middleware (`inviteAuth.ts`)
- Project permission middleware (`projectAuth.ts`)
- Project create controller/service/route
- Member delete controller/service/route
- Role update controller/service/route
- Workspace/member permission logic refinement
- Prisma migration `20260624133842_init`

## လက်ရှိပြီးစီးမှုခန့်မှန်းချက်

Project backend အနေနဲ့ core foundation တော်တော်များများပြီးနေပြီဖြစ်ပြီး **ခန့်မှန်းပြီးစီးမှု 60% - 70% ဝန်းကျင်** လို့သတ်မှတ်နိုင်ပါတယ်။

ပြီးထားသော core features:

- Auth/Login/Logout
- JWT middleware
- Workspace CRUD
- Profile get/upsert
- Workspace invitation
- Invitation accept
- Role/permission checks
- Project create
- Member remove
- Role update
- Prisma schema/migrations
- Logging
- Seed script

မပြီးသေးသော/ဆက်ရေးရန်လိုသောအပိုင်းများ:

- Task API CRUD မရေးရသေးပါ။
- Comment API မရေးရသေးပါ။
- Notification API မရေးရသေးပါ။
- Activity log ကို actual service flow တွေထဲမှာမချိတ်ရသေးပါ။
- Project get/update/delete service ရှိပေမယ့် route/controller endpoint မစုံသေးပါ။
- Refresh token route မှာ DB ထဲက token နဲ့ compare/validate အပိုင်းပိုခိုင်မာအောင်ရေးရန်လိုပါသည်။
- Role middleware က unauthorized role ဖြစ်ရင် response ပြန်ပေးတဲ့ branch မပြည့်စုံသေးပါ။
- Input validation ကို centralized validation library နဲ့မရေးရသေးပါ။
- Test cases မရှိသေးပါ။
- API documentation/Postman collection မရှိသေးပါ။
- Logs folder ကို git ထဲမထည့်ဘဲ runtime artifact အဖြစ်ထားရန် `.gitignore` ပြင်သင့်ပါတယ်။

## Run လုပ်ရန်

Dependencies install:

```bash
npm install
```

Environment variables ထည့်ရန်:

```env
DATABASE_URL="postgresql://..."
PORT=3000
ACCESS_TOKEN_SECRET="..."
REFRESH_TOKEN_SECRET="..."
INVITATION_SECRET="..."
EMAIL_USER="..."
EMAIL_PASS="..."
LOG_LEVEL="info"
NODE_ENV="development"
```

Prisma migration run:

```bash
npm run migrate
```

Prisma client generate:

```bash
npm run build
```

Seed data ထည့်ရန်:

```bash
npm run seed
```

Development server run:

```bash
npm run dev
```

Server default port:

```txt
http://localhost:3000
```

## Package Scripts

- `npm run dev`: `tsx watch index.ts` နဲ့ development server run
- `npm run seed`: seed data run
- `npm run migrate`: Prisma migration create/run
- `npm run remove`: Prisma migrate reset
- `npm run build`: Prisma client generate

## နောက်ဆက်ရေးရန် Roadmap

1. Project routes ကို CRUD အပြည့်ချိတ်ရန်
2. Task CRUD API ရေးရန်
3. Comment API ရေးရန်
4. Notification API ရေးရန်
5. Activity log tracking ချိတ်ရန်
6. Auth route naming ကိုတစ်မျိုးတည်းဖြစ်အောင်ပြန်ညှိရန်
7. Request validation ထည့်ရန်
8. Unit/integration tests ထည့်ရန်
9. API documentation ထည့်ရန်
10. Production deployment config ပြင်ရန်
