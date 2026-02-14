# University Exam System API Documentation

## Overview

This API provides a comprehensive backend system for managing university exams with role-based access control. The system supports two primary roles: **Students** and **Staff/Administrators**, each with distinct permissions and capabilities.

---

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Authentication](#authentication)
3. [API Endpoints](#api-endpoints)
   - [Authentication Endpoints](#authentication-endpoints)
   - [User Profile Endpoints](#user-profile-endpoints)
   - [Student Exam Endpoints](#student-exam-endpoints)
   - [Staff Exam Management](#staff-exam-management)
   - [Question Management](#question-management)
   - [Exam Attempt Endpoints](#exam-attempt-endpoints)
   - [Results Management](#results-management)
   - [Advanced Staff Features](#advanced-staff-features)
4. [Data Models](#data-models)
5. [Error Handling](#error-handling)
6. [Request/Response Examples](#requestresponse-examples)

---

## System Architecture

### Roles and Permissions

#### Student Role
- View published exams within the allowed time window
- Attempt exams during the scheduled exam time
- Automatic submission when exam time ends
- View personal profile information
- View exam results and performance metrics

#### Staff/Admin Role
- Create, edit, and delete exams (before exam start time)
- Add questions to exams (MCQ, Multiple Choice, Descriptive, Coding)
- Publish and unpublish exams
- Evaluate descriptive and coding questions
- Auto-evaluate MCQ questions
- Generate and manage exam results
- View detailed analytics and performance metrics
- Grant exam time extensions to students
- Bulk assign feedback to multiple results
- Export and filter results with advanced criteria
- Detect code plagiarism in coding questions

---

## Authentication

### JWT (JSON Web Token)

The API uses **JWT** for authentication. Include the token in the `Authorization` header for all protected endpoints:

```
Authorization: Bearer <jwt_token>
```

### Token Structure
- **Issued at**: Login endpoint
- **Validity**: Configurable (typically 24-48 hours)
- **Payload**: User ID, role, email, permissions

---

## API Endpoints

### Authentication Endpoints

#### Register User
```
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password",
  "first_name": "John",
  "last_name": "Doe",
  "role": "student"  // or "staff"
}
```

**Response (201 Created):**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "student",
  "created_at": "2024-01-15T10:30:00Z"
}
```

---

#### Login
```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "secure_password"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "Bearer",
  "expires_in": 86400,
  "user": {
    "id": "user_123",
    "email": "user@example.com",
    "role": "student"
  }
}
```

---

### User Profile Endpoints

#### Get User Profile
```
GET /api/users/profile
```

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response (200 OK):**
```json
{
  "id": "user_123",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "role": "student",
  "phone": "+1234567890",
  "date_joined": "2024-01-15T10:30:00Z",
  "last_login": "2024-01-20T14:45:00Z"
}
```

---

### Student Exam Endpoints

#### Get Available Exams
```
GET /api/exams/available
```

**Query Parameters:**
- `page` (optional): Pagination page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search by exam title

**Response (200 OK):**
```json
{
  "count": 5,
  "next": "/api/exams/available?page=2",
  "previous": null,
  "results": [
    {
      "id": "exam_001",
      "title": "Data Structures Mid-Term",
      "description": "Comprehensive exam covering arrays, linked lists, trees",
      "duration_minutes": 120,
      "total_marks": 100,
      "start_time": "2024-02-05T10:00:00Z",
      "end_time": "2024-02-05T12:00:00Z",
      "is_published": true,
      "question_count": 50,
      "status": "upcoming"
    }
  ]
}
```

---

#### Get Exam Details
```
GET /api/exams/:exam_id
```

**Response (200 OK):**
```json
{
  "id": "exam_001",
  "title": "Data Structures Mid-Term",
  "description": "Comprehensive exam covering arrays, linked lists, trees",
  "duration_minutes": 120,
  "total_marks": 100,
  "start_time": "2024-02-05T10:00:00Z",
  "end_time": "2024-02-05T12:00:00Z",
  "is_published": true,
  "instructions": "Read all questions carefully...",
  "passing_marks": 40,
  "question_count": 50
}
```

---

#### Start Exam Attempt
```
POST /api/exams/:exam_id/attempt
```

**Response (201 Created):**
```json
{
  "attempt_id": "attempt_789",
  "exam_id": "exam_001",
  "student_id": "user_123",
  "started_at": "2024-02-05T10:00:00Z",
  "time_remaining_seconds": 7200,
  "questions": [
    {
      "id": "q_001",
      "type": "mcq",
      "text": "What is a data structure?",
      "marks": 2,
      "options": [
        {"id": "opt_1", "text": "A way to organize data"},
        {"id": "opt_2", "text": "A programming language"},
        {"id": "opt_3", "text": "A software framework"},
        {"id": "opt_4", "text": "A database"}
      ]
    }
  ]
}
```

---

#### Submit Exam
```
POST /api/exams/:exam_id/submit
```

**Request Body:**
```json
{
  "attempt_id": "attempt_789"
}
```

**Response (200 OK):**
```json
{
  "message": "Exam submitted successfully",
  "submitted_at": "2024-02-05T12:00:00Z",
  "attempt_id": "attempt_789"
}
```

---

### Staff Exam Management

#### List All Exams (Staff)
```
GET /api/staff/exams
```

**Query Parameters:**
- `page` (optional): Pagination page number
- `limit` (optional): Items per page
- `status` (optional): Filter by status (draft, published, completed)
- `search` (optional): Search by title

**Response (200 OK):**
```json
{
  "count": 10,
  "results": [
    {
      "id": "exam_001",
      "title": "Data Structures Mid-Term",
      "status": "published",
      "question_count": 50,
      "total_marks": 100,
      "start_time": "2024-02-05T10:00:00Z",
      "end_time": "2024-02-05T12:00:00Z",
      "student_count": 145,
      "created_by": "staff_123",
      "created_at": "2024-01-20T10:00:00Z"
    }
  ]
}
```

---

#### Create Exam
```
POST /api/staff/exams
```

**Request Body:**
```json
{
  "title": "Advanced Algorithms",
  "description": "Comprehensive exam on sorting, searching, and optimization",
  "duration_minutes": 180,
  "total_marks": 100,
  "passing_marks": 40,
  "start_time": "2024-03-15T10:00:00Z",
  "end_time": "2024-03-15T13:00:00Z",
  "instructions": "Read all questions carefully...",
  "is_published": false
}
```

**Response (201 Created):**
```json
{
  "id": "exam_002",
  "title": "Advanced Algorithms",
  "description": "Comprehensive exam on sorting, searching, and optimization",
  "duration_minutes": 180,
  "total_marks": 100,
  "passing_marks": 40,
  "start_time": "2024-03-15T10:00:00Z",
  "end_time": "2024-03-15T13:00:00Z",
  "instructions": "Read all questions carefully...",
  "is_published": false,
  "created_at": "2024-02-03T10:00:00Z"
}
```

---

#### Get Exam Details (Staff)
```
GET /api/staff/exams/:exam_id
```

**Response (200 OK):**
```json
{
  "id": "exam_001",
  "title": "Data Structures Mid-Term",
  "description": "Comprehensive exam covering arrays, linked lists, trees",
  "duration_minutes": 120,
  "total_marks": 100,
  "passing_marks": 40,
  "start_time": "2024-02-05T10:00:00Z",
  "end_time": "2024-02-05T12:00:00Z",
  "is_published": true,
  "instructions": "Read all questions carefully...",
  "question_count": 50,
  "student_attempts": 145,
  "created_at": "2024-01-20T10:00:00Z",
  "updated_at": "2024-02-03T10:00:00Z"
}
```

---

#### Update Exam
```
PUT /api/staff/exams/:exam_id
```

**Restrictions:** Only modifiable before exam start time

**Request Body:**
```json
{
  "title": "Data Structures Mid-Term (Updated)",
  "description": "Updated description",
  "duration_minutes": 130,
  "total_marks": 100,
  "instructions": "Updated instructions..."
}
```

**Response (200 OK):**
```json
{
  "id": "exam_001",
  "title": "Data Structures Mid-Term (Updated)",
  "updated_at": "2024-02-03T11:00:00Z"
}
```

---

#### Delete Exam
```
DELETE /api/staff/exams/:exam_id
```

**Restrictions:** Only deletable before exam start time

**Response (204 No Content)**

---

#### Publish Exam
```
POST /api/staff/exams/:exam_id/publish
```

**Response (200 OK):**
```json
{
  "id": "exam_001",
  "title": "Data Structures Mid-Term",
  "is_published": true,
  "published_at": "2024-02-03T11:00:00Z"
}
```

---

#### Unpublish Exam
```
POST /api/staff/exams/:exam_id/unpublish
```

**Response (200 OK):**
```json
{
  "id": "exam_001",
  "title": "Data Structures Mid-Term",
  "is_published": false,
  "unpublished_at": "2024-02-03T11:00:00Z"
}
```

---

### Question Management

#### Get Questions for Exam
```
GET /api/staff/exams/:exam_id/questions
```

**Query Parameters:**
- `page` (optional): Pagination page number
- `limit` (optional): Items per page
- `type` (optional): Filter by question type (mcq, multiple_mcq, descriptive, coding)

**Response (200 OK):**
```json
{
  "count": 50,
  "results": [
    {
      "id": "q_001",
      "exam_id": "exam_001",
      "type": "mcq",
      "text": "What is a data structure?",
      "marks": 2,
      "options": [
        {"id": "opt_1", "text": "A way to organize data", "is_correct": true},
        {"id": "opt_2", "text": "A programming language", "is_correct": false}
      ],
      "correct_answer": "opt_1",
      "created_at": "2024-01-20T10:00:00Z"
    }
  ]
}
```

---

#### Add Question
```
POST /api/staff/exams/:exam_id/questions
```

**Request Body (MCQ):**
```json
{
  "type": "mcq",
  "text": "What is a linked list?",
  "marks": 2,
  "options": [
    {"text": "A sequential data structure", "is_correct": false},
    {"text": "A non-sequential data structure with pointers", "is_correct": true},
    {"text": "A type of array", "is_correct": false},
    {"text": "A database table", "is_correct": false}
  ]
}
```

**Request Body (Descriptive):**
```json
{
  "type": "descriptive",
  "text": "Explain the difference between arrays and linked lists",
  "marks": 10,
  "expected_answer": "Arrays are contiguous in memory with fixed size, while linked lists use pointers and dynamic allocation..."
}
```

**Request Body (Coding):**
```json
{
  "type": "coding",
  "text": "Write a function to reverse a linked list",
  "marks": 15,
  "language": "python",
  "test_cases": [
    {
      "input": "[1, 2, 3, 4, 5]",
      "expected_output": "[5, 4, 3, 2, 1]"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "id": "q_051",
  "exam_id": "exam_001",
  "type": "mcq",
  "text": "What is a linked list?",
  "marks": 2,
  "created_at": "2024-02-03T11:00:00Z"
}
```

---

#### Update Question
```
PUT /api/staff/questions/:question_id
```

**Restrictions:** Only modifiable before exam start time

**Response (200 OK)**

---

#### Delete Question
```
DELETE /api/staff/questions/:question_id
```

**Restrictions:** Only deletable before exam start time

**Response (204 No Content)**

---

### Exam Attempt Endpoints

#### Get Questions and Answers for Ongoing Attempt
```
GET /api/exams/:exam_id/attempt/answers
```

**Response (200 OK):**
```json
{
  "attempt_id": "attempt_789",
  "exam_id": "exam_001",
  "time_remaining_seconds": 3600,
  "questions": [
    {
      "id": "q_001",
      "type": "mcq",
      "text": "What is a data structure?",
      "marks": 2,
      "options": [
        {"id": "opt_1", "text": "A way to organize data"},
        {"id": "opt_2", "text": "A programming language"}
      ],
      "student_answer": "opt_1",
      "answered": true
    }
  ]
}
```

---

#### Save Answer
```
POST /api/exams/:exam_id/attempt/answers
```

**Request Body:**
```json
{
  "question_id": "q_001",
  "answer": "opt_1"
}
```

**Response (200 OK):**
```json
{
  "message": "Answer saved successfully",
  "question_id": "q_001",
  "saved_at": "2024-02-05T10:15:00Z"
}
```

---

#### Final Submit Exam
```
POST /api/exams/:exam_id/attempt/final-submit
```

**Response (200 OK):**
```json
{
  "message": "Exam submitted successfully",
  "submitted_at": "2024-02-05T12:00:00Z",
  "attempt_id": "attempt_789",
  "preliminary_score": 75
}
```

---

### Results Management

#### Get Exam Results (Staff)
```
GET /api/staff/exams/:exam_id/results
```

**Query Parameters:**
- `page` (optional): Pagination page number
- `limit` (optional): Items per page
- `sort` (optional): Sort by score, name (default: score descending)

**Response (200 OK):**
```json
{
  "count": 145,
  "results": [
    {
      "id": "result_001",
      "exam_id": "exam_001",
      "student_id": "user_001",
      "student_name": "John Doe",
      "obtained_marks": 75,
      "total_marks": 100,
      "percentage": 75.0,
      "status": "passed",
      "submitted_at": "2024-02-05T12:00:00Z",
      "evaluation_status": "partially_evaluated"
    }
  ]
}
```

---

#### Generate Results
```
POST /api/staff/exams/:exam_id/results/generate
```

**Response (200 OK):**
```json
{
  "message": "Results generated successfully",
  "exam_id": "exam_001",
  "total_attempts": 145,
  "results_generated": 145,
  "generated_at": "2024-02-05T14:00:00Z"
}
```

---

#### Update Result (For Manual Evaluation)
```
PUT /api/staff/results/:result_id
```

**Request Body:**
```json
{
  "obtained_marks": 80,
  "evaluation_notes": "Good explanation with minor errors"
}
```

**Response (200 OK):**
```json
{
  "id": "result_001",
  "exam_id": "exam_001",
  "obtained_marks": 80,
  "updated_at": "2024-02-05T14:30:00Z"
}
```

---

#### Get Student Results
```
GET /api/results/my-results
```

**Response (200 OK):**
```json
{
  "count": 5,
  "results": [
    {
      "id": "result_001",
      "exam_id": "exam_001",
      "exam_title": "Data Structures Mid-Term",
      "obtained_marks": 75,
      "total_marks": 100,
      "percentage": 75.0,
      "status": "passed",
      "submitted_at": "2024-02-05T12:00:00Z",
      "feedback": "Good attempt with room for improvement"
    }
  ]
}
```

---

### Advanced Staff Features

#### Evaluate Specific Question
```
POST /api/staff/exams/:exam_id/questions/:question_id/evaluate
```

**Request Body:**
```json
{
  "attempt_id": "attempt_123",
  "score": 8.5,
  "feedback": "Good explanation with minor logical gaps"
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Question evaluated successfully",
  "answer_id": "answer_123",
  "score": 8.5,
  "feedback": "Good explanation with minor logical gaps"
}
```

---

#### Get Result Answer Details
```
GET /api/staff/results/:result_id/answers
```

**Response (200 OK):**
```json
{
  "result_id": "result_001",
  "exam_title": "Data Structures Mid-Term",
  "student_name": "John Doe",
  "student_enrollment_id": "ST001234",
  "total_marks": 100,
  "obtained_marks": 75,
  "percentage": 75.0,
  "status": "pass",
  "submitted_at": "2024-02-05T12:00:00Z",
  "answers": [
    {
      "id": "answer_001",
      "question_text": "What is a data structure?",
      "question_type": "mcq",
      "max_points": 2,
      "answer": "opt_2",
      "score": 2,
      "feedback": "Correct!",
      "correct_answer": "A way to organize data"
    },
    {
      "id": "answer_002",
      "question_text": "Explain recursion",
      "question_type": "descriptive",
      "max_points": 10,
      "answer": "A function that calls itself...",
      "score": 8.5,
      "feedback": "Good explanation with minor gaps",
      "correct_answer": "Sample answer..."
    }
  ]
}
```

---

#### Get Exam Analytics
```
GET /api/staff/exams/:exam_id/analytics
```

**Response (200 OK):**
```json
{
  "exam_title": "Data Structures Mid-Term",
  "exam_id": "exam_001",
  "total_attempts": 150,
  "submitted_attempts": 148,
  "average_score": 72.5,
  "highest_score": 98,
  "lowest_score": 22,
  "pass_count": 112,
  "fail_count": 36,
  "pass_percentage": 74.67,
  "question_statistics": [
    {
      "question_id": "q_001",
      "question_text": "What is a data structure?",
      "question_type": "mcq",
      "max_points": 2,
      "total_answers": 148,
      "average_score": 1.8,
      "correct_count": 135
    },
    {
      "question_id": "q_002",
      "question_text": "Explain recursion",
      "question_type": "descriptive",
      "max_points": 10,
      "total_answers": 148,
      "average_score": 7.2,
      "correct_count": null
    }
  ],
  "generated_at": "2024-02-05T14:00:00Z"
}
```

---

#### Extend Exam Time for Student
```
POST /api/staff/exams/:exam_id/extend-time
```

**Request Body:**
```json
{
  "student": "student_uuid",
  "additional_minutes": 30,
  "reason": "Medical grounds - doctor's appointment"
}
```

**Response (201 Created):**
```json
{
  "id": "extension_001",
  "student": "student_uuid",
  "student_name": "John Doe",
  "additional_minutes": 30,
  "reason": "Medical grounds - doctor's appointment",
  "approved_by": "staff_123",
  "approved_by_name": "Dr. Smith",
  "approved_at": "2024-02-05T09:00:00Z",
  "created_at": "2024-02-05T09:00:00Z"
}
```

---

#### List Exam Time Extensions
```
GET /api/staff/exams/:exam_id/extensions
```

**Query Parameters:**
- `page` (optional): Pagination page number
- `limit` (optional): Items per page

**Response (200 OK):**
```json
{
  "count": 5,
  "results": [
    {
      "id": "extension_001",
      "student": "student_uuid",
      "student_name": "John Doe",
      "additional_minutes": 30,
      "reason": "Medical grounds",
      "approved_by_name": "Dr. Smith",
      "approved_at": "2024-02-05T09:00:00Z"
    }
  ]
}
```

---

#### Bulk Assign Feedback
```
POST /api/staff/exams/:exam_id/bulk-feedback
```

**Request Body:**
```json
{
  "result_ids": ["result_001", "result_002", "result_003"],
  "feedback_template": "Review the fundamentals and practice more problems."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Feedback assigned to 12 answers",
  "results_updated": 3,
  "answers_updated": 12
}
```

---

#### Get Bulk Results with Filters
```
GET /api/staff/exams/:exam_id/bulk-results?min_percentage=70&status=pass&department=CSE&limit=100
```

**Query Parameters:**
- `min_percentage` (optional): Minimum percentage threshold
- `max_percentage` (optional): Maximum percentage threshold
- `status` (optional): Filter by pass/fail
- `department` (optional): Filter by department
- `limit` (optional): Maximum results (1-1000, default: 100)

**Response (200 OK):**
```json
{
  "count": 85,
  "next": "...",
  "previous": "...",
  "results": [
    {
      "id": "result_001",
      "student_name": "John Doe",
      "enrollment_id": "ST001234",
      "total_marks": 100,
      "obtained_marks": 85,
      "percentage": 85.0,
      "status": "pass",
      "submitted_at": "2024-02-05T12:00:00Z"
    }
  ]
}
```

---

#### Check Code Plagiarism
```
GET /api/staff/exams/:exam_id/plagiarism-check
```

**Query Parameters:**
- `page` (optional): Pagination page number
- `limit` (optional): Items per page

**Response (200 OK):**
```json
{
  "count": 3,
  "results": [
    {
      "id": "report_001",
      "student1_name": "John Doe",
      "student2_name": "Jane Smith",
      "question_text": "Write a function to find the maximum element in an array",
      "similarity_score": 92.5,
      "risk_level": "high",
      "report": "Similarity: 92.50% between students",
      "created_at": "2024-02-05T14:00:00Z"
    },
    {
      "id": "report_002",
      "student1_name": "Bob Johnson",
      "student2_name": "Alice Brown",
      "question_text": "Write a function to sort an array",
      "similarity_score": 68.3,
      "risk_level": "medium",
      "report": "Similarity: 68.30% between students",
      "created_at": "2024-02-05T14:00:00Z"
    }
  ]
}
```

**Risk Levels:**
- `low`: 60-70% similarity
- `medium`: 70-90% similarity
- `high`: 90%+ similarity

---

## Data Models

### User
```json
{
  "id": "string (UUID)",
  "email": "string (unique)",
  "password_hash": "string",
  "first_name": "string",
  "last_name": "string",
  "role": "enum (student, staff)",
  "phone": "string (optional)",
  "is_active": "boolean",
  "date_joined": "timestamp",
  "last_login": "timestamp"
}
```

### Exam
```json
{
  "id": "string (UUID)",
  "title": "string",
  "description": "text",
  "duration_minutes": "integer",
  "total_marks": "integer",
  "passing_marks": "integer",
  "start_time": "timestamp",
  "end_time": "timestamp",
  "instructions": "text",
  "is_published": "boolean",
  "created_by": "string (User ID)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Question
```json
{
  "id": "string (UUID)",
  "exam_id": "string (UUID)",
  "type": "enum (mcq, multiple_mcq, descriptive, coding)",
  "text": "text",
  "marks": "integer",
  "options": "array (for MCQ questions)",
  "correct_answer": "string (for MCQ)",
  "expected_answer": "text (for descriptive)",
  "test_cases": "array (for coding questions)",
  "language": "string (for coding questions)",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### ExamAttempt
```json
{
  "id": "string (UUID)",
  "exam_id": "string (UUID)",
  "student_id": "string (UUID)",
  "started_at": "timestamp",
  "submitted_at": "timestamp (nullable)",
  "status": "enum (in_progress, submitted, auto_submitted)",
  "is_auto_submitted": "boolean"
}
```

### Answer
```json
{
  "id": "string (UUID)",
  "attempt_id": "string (UUID)",
  "question_id": "string (UUID)",
  "student_answer": "string/text",
  "is_correct": "boolean (for MCQ)",
  "marks_obtained": "integer",
  "created_at": "timestamp",
  "updated_at": "timestamp"
}
```

### Result
```json
{
  "id": "string (UUID)",
  "exam_id": "string (UUID)",
  "student_id": "string (UUID)",
  "obtained_marks": "integer",
  "total_marks": "integer",
  "percentage": "float",
  "status": "enum (passed, failed)",
  "evaluation_status": "enum (auto_evaluated, pending_evaluation, evaluated)",
  "submitted_at": "timestamp",
  "evaluated_at": "timestamp (nullable)",
  "feedback": "text (optional)"
}
```

---

## Error Handling

### Standard Error Response Format
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (optional)"
  }
}
```

### Common Error Codes

| HTTP Status | Code | Message | Description |
|-------------|------|---------|-------------|
| 400 | INVALID_REQUEST | Invalid request data | Request validation failed |
| 401 | UNAUTHORIZED | Unauthorized | Missing or invalid authentication token |
| 403 | FORBIDDEN | Access denied | User lacks required permissions |
| 404 | NOT_FOUND | Resource not found | Requested resource does not exist |
| 409 | CONFLICT | Exam already started | Action not allowed at current state |
| 429 | RATE_LIMITED | Too many requests | Rate limit exceeded |
| 500 | INTERNAL_ERROR | Internal server error | Unexpected server error |

### Example Error Response
```json
{
  "error": {
    "code": "EXAM_NOT_PUBLISHED",
    "message": "Cannot attempt unpublished exam",
    "details": {
      "exam_id": "exam_001"
    }
  }
}
```

---

## Request/Response Examples

### Complete Exam Workflow Example

**1. Student Views Available Exams**
```
GET /api/exams/available
Authorization: Bearer <token>

Response: 200 OK
[List of available exams]
```

**2. Student Starts Exam Attempt**
```
POST /api/exams/exam_001/attempt
Authorization: Bearer <token>

Response: 201 Created
{
  "attempt_id": "attempt_789",
  "questions": [...],
  "time_remaining_seconds": 7200
}
```

**3. Student Saves Answer**
```
POST /api/exams/exam_001/attempt/answers
Authorization: Bearer <token>
Content-Type: application/json

{
  "question_id": "q_001",
  "answer": "opt_2"
}

Response: 200 OK
{
  "message": "Answer saved successfully"
}
```

**4. Student Submits Exam**
```
POST /api/exams/exam_001/attempt/final-submit
Authorization: Bearer <token>

Response: 200 OK
{
  "message": "Exam submitted successfully",
  "submitted_at": "2024-02-05T12:00:00Z"
}
```

**5. Staff Reviews Results**
```
GET /api/staff/exams/exam_001/results
Authorization: Bearer <token>

Response: 200 OK
{
  "count": 145,
  "results": [...]
}
```

---

## Best Practices

### Authentication
- Always use HTTPS for all API requests
- Store JWT tokens securely (HTTP-only cookies recommended)
- Implement token refresh mechanism
- Validate tokens on every protected endpoint

### Rate Limiting
- Implement rate limiting to prevent abuse
- Standard limit: 100 requests per minute per user
- Higher limits for staff users during result evaluation

### Pagination
- Use pagination for list endpoints to reduce response size
- Default page size: 10 items
- Maximum page size: 100 items

### Caching
- Cache exam details for 5 minutes
- Cache published exam list for 1 minute
- Clear cache on exam publish/unpublish

### Data Validation
- Validate all input on the server side
- Enforce minimum/maximum values
- Validate email formats and file uploads
- Sanitize text inputs to prevent XSS

---

## Support and Feedback

For API issues or feature requests, contact the development team or submit an issue in the project repository.

**Last Updated:** February 5, 2026
**API Version:** 1.1.0
