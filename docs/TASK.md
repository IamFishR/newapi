# Project Management Dashboard Frontend Implementation Guide

## Table of Contents
- [Overview](#overview)
- [Frontend Architecture](#frontend-architecture)
- [Component Structure](#component-structure)
- [API Integration](#api-integration)
- [Implementation Roadmap](#implementation-roadmap)

## Overview

This document provides guidance for implementing a Next.js dashboard frontend for our project management API. The frontend will use Tailwind CSS and ShadCN UI components to create an intuitive and responsive user experience.

## Frontend Architecture

### Tech Stack
- **Framework**: Next.js
- **Styling**: Tailwind CSS
- **UI Components**: ShadCN
- **State Management**: React Context API / React Query for data fetching
- **Authentication**: JWT-based auth with secure HTTP-only cookies

### Project Structure
```
src/
├── app/                   # Next.js app directory
│   ├── (auth)/            # Authentication routes
│   ├── dashboard/         # Dashboard routes
│   │   ├── projects/      # Projects pages
│   │   ├── tasks/         # Tasks pages
│   │   └── sprints/       # Sprints pages
├── components/            # Reusable UI components
│   ├── ui/                # Basic UI components (from ShadCN)
│   ├── projects/          # Project-related components
│   ├── tasks/             # Task-related components
│   ├── sprints/           # Sprint-related components
│   └── shared/            # Shared components like layouts, headers
├── hooks/                 # Custom React hooks
├── lib/                   # Utility functions and API clients
│   ├── api/               # API client functions
│   └── utils/             # Utility functions
└── types/                 # TypeScript type definitions
```

## Component Structure

### Core Components

#### 1. Dashboard Layout
- Main layout with sidebar navigation
- Header with user profile and notifications
- Content area for displaying pages

#### 2. Project Components
- **ProjectList**: Display all projects with search and filters
- **ProjectCard**: Card showing project overview
- **ProjectDetail**: Full project details with metrics
- **ProjectForm**: Create/edit project form

#### 3. Sprint Components
- **SprintList**: List sprints for a project
- **SprintDetail**: View sprint details and progress
- **SprintBoard**: Kanban board for sprint tasks
- **SprintForm**: Create/edit sprint form
- **SprintMetrics**: Charts showing sprint performance

#### 4. Task Components
- **TaskList**: List of tasks with filters and sorting
- **TaskDetail**: Task details with comments and attachments
- **TaskForm**: Create/edit task form
- **TaskComments**: Comments section for tasks
- **TaskAttachments**: File attachments for tasks
- **TaskLabels**: Label management for tasks
- **TaskHistory**: Task activity history
- **TaskTimeTracking**: Time logging interface

#### 5. Shared Components
- **DataTable**: Reusable table with sorting and pagination
- **FilterPanel**: Reusable filters for lists
- **MetricsCard**: Display key metrics in cards
- **SearchInput**: Global search component
- **Pagination**: Reusable pagination component
- **Modal**: Reusable modal dialog

## API Integration

### Authentication

#### API Endpoints
- **POST /api/auth/login**: Authenticate user
- **POST /api/auth/register**: Register new user
- **POST /api/auth/logout**: Log out user

### Projects

#### API Endpoints
- **GET /api/tasks/projects**: List all projects
  - Query params: `page`, `limit`, `search`, `status`, `sort`
- **GET /api/tasks/projects/:id**: Get project details
- **POST /api/tasks/projects**: Create new project
- **PUT /api/tasks/projects/:id**: Update project
- **DELETE /api/tasks/projects/:id**: Delete project
- **GET /api/tasks/projects/:id/metrics**: Get project metrics

#### Project Payload Examples

**Create/Update Project Payload**:
```json
{
  "name": "E-commerce Platform",
  "description": "Building an online shopping platform",
  "start_date": "2023-10-01",
  "end_date": "2024-03-31",
  "status": "in_progress",
  "priority": "high",
  "color": "#4A6FDC"
}
```

**Project Response**:
```json
{
  "status": "success",
  "data": {
    "id": "proj-123",
    "name": "E-commerce Platform",
    "description": "Building an online shopping platform",
    "start_date": "2023-10-01",
    "end_date": "2024-03-31",
    "status": "in_progress",
    "priority": "high",
    "color": "#4A6FDC",
    "created_at": "2023-09-15T10:30:00Z",
    "updated_at": "2023-09-15T10:30:00Z",
    "created_by": "user-123"
  }
}
```

### Sprints

#### API Endpoints
- **GET /api/tasks/projects/:projectId/sprints**: List sprints for a project
  - Query params: `page`, `limit`, `status`
- **GET /api/tasks/sprints/:id**: Get sprint details
- **POST /api/tasks/projects/:projectId/sprints**: Create new sprint
- **PUT /api/tasks/sprints/:id**: Update sprint
- **DELETE /api/tasks/sprints/:id**: Delete sprint
- **GET /api/tasks/sprints/:id/metrics**: Get sprint metrics

#### Sprint Payload Examples

**Create/Update Sprint Payload**:
```json
{
  "name": "Sprint 1 - User Authentication",
  "description": "Implement user login and registration",
  "start_date": "2023-10-01",
  "end_date": "2023-10-14",
  "status": "active"
}
```

**Sprint Response**:
```json
{
  "status": "success",
  "data": {
    "id": "sprint-123",
    "project_id": "proj-123",
    "name": "Sprint 1 - User Authentication",
    "description": "Implement user login and registration",
    "start_date": "2023-10-01",
    "end_date": "2023-10-14",
    "status": "active",
    "created_at": "2023-09-15T10:30:00Z",
    "updated_at": "2023-09-15T10:30:00Z"
  }
}
```

### Tasks

#### API Endpoints
- **GET /api/tasks/tasks**: List all tasks
  - Query params: `page`, `limit`, `search`, `status`, `priority`, `assignee`, `project_id`, `sprint_id`, `label`
- **GET /api/tasks/tasks/:id**: Get task details
- **POST /api/tasks/projects/:projectId/tasks**: Create new task
- **PUT /api/tasks/tasks/:id**: Update task
- **DELETE /api/tasks/tasks/:id**: Delete task
- **POST /api/tasks/tasks/:id/comments**: Add comment to task
- **POST /api/tasks/tasks/:id/attachments**: Add attachment to task
- **POST /api/tasks/tasks/:id/time-logs**: Log time for task
- **POST /api/tasks/tasks/:id/labels/:labelId**: Add label to task
- **DELETE /api/tasks/tasks/:id/labels/:labelId**: Remove label from task
- **POST /api/tasks/tasks/:id/watchers/:userId**: Add watcher to task
- **DELETE /api/tasks/tasks/:id/watchers/:userId**: Remove watcher from task
- **GET /api/tasks/tasks/:id/history**: Get task history
- **GET /api/tasks/tasks/:id/metrics**: Get task metrics

#### Task Payload Examples

**Create/Update Task Payload**:
```json
{
  "title": "Implement user registration",
  "description": "Create API and frontend for user registration",
  "status": "in_progress",
  "priority": "high",
  "due_date": "2023-10-10",
  "estimate_hours": 8,
  "assignee_id": "user-456",
  "sprint_id": "sprint-123"
}
```

**Task Response**:
```json
{
  "status": "success",
  "data": {
    "id": "task-123",
    "project_id": "proj-123",
    "sprint_id": "sprint-123",
    "title": "Implement user registration",
    "description": "Create API and frontend for user registration",
    "status": "in_progress",
    "priority": "high",
    "due_date": "2023-10-10",
    "estimate_hours": 8,
    "actual_hours": 0,
    "assignee_id": "user-456",
    "created_by": "user-123",
    "created_at": "2023-09-15T10:30:00Z",
    "updated_at": "2023-09-15T10:30:00Z",
    "labels": [],
    "watchers": ["user-123"]
  }
}
```

**Add Comment Payload**:
```json
{
  "content": "I've started working on this task"
}
```

**Add Time Log Payload**:
```json
{
  "hours": 2.5,
  "date": "2023-10-05",
  "description": "Implemented API endpoints"
}
```

## Implementation Roadmap

### Phase 1: Setup and Authentication
1. Initialize Next.js project with Tailwind CSS and ShadCN UI
2. Set up project structure and basic components
3. Implement authentication (login, register, logout)
4. Create base layouts and navigation

### Phase 2: Project Management
1. Implement project listing and filtering
2. Build project detail view with metrics
3. Create project creation and editing forms
4. Implement project deletion with confirmation

### Phase 3: Sprint Management
1. Build sprint listing within projects
2. Implement sprint detail view
3. Create sprint board with drag-and-drop functionality
4. Build sprint metrics visualization

### Phase 4: Task Management
1. Implement task listing with advanced filters
2. Build task detail view with all functionality
3. Create task form with validation
4. Implement comments, attachments, and time tracking
5. Build task history and activity feed

### Phase 5: Dashboard and Metrics
1. Create main dashboard with project overview
2. Implement data visualization for key metrics
3. Build user profile and settings pages
4. Add global search functionality

### Phase 6: Polish and Optimization
1. Ensure responsive design for all screen sizes
2. Optimize performance and loading states
3. Implement error handling and fallbacks
4. Add animations and transitions for better UX
5. Conduct thorough testing and bug fixes

## Best Practices

1. **State Management**:
   - Use React Query for data fetching and caching
   - Use Context API for global state where needed

2. **Performance**:
   - Implement virtualization for long lists
   - Use optimistic updates for better UX
   - Lazy load components where appropriate

3. **Code Organization**:
   - Follow modular component design
   - Create reusable hooks for common functionality
   - Maintain consistent naming conventions

4. **Accessibility**:
   - Ensure all components meet WCAG standards
   - Use proper semantic HTML elements
   - Test with keyboard navigation

5. **Error Handling**:
   - Implement robust error boundaries
   - Show user-friendly error messages
   - Log errors for debugging
