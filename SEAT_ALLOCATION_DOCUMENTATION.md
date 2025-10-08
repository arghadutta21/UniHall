# Seat Allocation Process - Complete Documentation

## Overview

This document explains the complete seat allocation process implemented in the UniHall system, from application submission to seat allocation and ongoing management.

---

## Process Flow

```
1. Student Fills Application Form
   ↓
2. Admin Reviews & Sorts by Score
   ↓
3. Admin Selects Candidates for Interview
   ↓
4. System Publishes Interview List
   ↓
5. Students Receive Interview Notifications
   ↓
6. Interviews are Conducted
   ↓
7. Admin Records Interview Results
   ↓
8. Selected Students Make Payment
   ↓
9. Admin Allocates Seats
   ↓
10. Ongoing Management (Vacate Seats, Disciplinary Records)
```

---

## 1. Application Submission (Student Side)

### What Happens:
- Student fills out the application form
- Form fields have **scores** assigned by admin
- System automatically calculates total score based on filled fields

### Score Calculation:
```javascript
// Each form field has a "score" property
// Example:
{
  label: "CGPA",
  type: "number",
  score: 20,  // This field is worth 20 points
  required: true
}

// Total score = sum of scores for all filled fields
```

### Files Involved:
- `src/pages/student/FormFill.jsx` - Student fills the form
- `src/lib/mockApi.js` - `calculateApplicationScore()` function

---

## 2. Admin Reviews Applications

### Features:

#### **Sorting Options:**
- **By Score** (Highest to Lowest) - Default for merit-based selection
- **By Session** - Group students by academic session
- **By Date** - View newest applications first

#### **Status Filters:**
- All Status
- Pending
- Interview Scheduled
- Interview Passed
- Interview Failed
- Approved
- Rejected
- Admitted

#### **Score Display:**
Each application shows:
- Student details (Name, ID, Email)
- Session and Department
- **Total Score** (prominently displayed)
- Payment status
- Current status

### Page:
`src/pages/admin/Applications.jsx`

### Key Functions:
```javascript
// Sort by score (highest first)
apps.sort((a, b) => b.score - a.score)

// Sort by session
apps.sort((a, b) => (a.data?.session || '').localeCompare(b.data?.session || ''))

// Filter by status
apps.filter(app => app.status === filterStatus)
```

---

## 3. Interview Management

### Admin Actions:

#### **Select for Interview:**
1. Admin views applications (sorted by score)
2. Selects multiple candidates using checkboxes
3. Can "Select All" or individually select
4. Fills interview details:
   - Interview Date
   - Interview Time
   - Venue
5. Clicks "Publish Interview List"

#### **What Happens:**
- System creates interview record for each selected candidate
- Updates application status to "Interview Scheduled"
- Sends notification to each student
- Student sees interview details in Notifications page

### Page:
`src/pages/admin/InterviewManagement.jsx`

### Key Functions:
```javascript
api.publishInterviewList({
  hallId: user.hallId,
  selectedApplicationIds: [app1, app2, app3],
  interviewDate: "2025-10-15",
  interviewTime: "10:00 AM",
  venue: "Hall Office"
})

// Creates:
// - Interview records
// - Notifications for students
// - Updates application status
```

---

## 4. Student Receives Notification

### What Students See:

#### **Notifications Page (`/notifications`):**

**Interview Schedule Section:**
```
📅 Your Interview Schedule
┌─────────────────────────────────┐
│ Interview Scheduled             │
│ Date: 2025-10-15                │
│ Time: 10:00 AM                  │
│ Venue: Hall Office              │
│ Status: Scheduled               │
└─────────────────────────────────┘
```

**Regular Notifications:**
- New notifications have blue background
- Unread indicator (blue dot)
- "Mark as read" button
- Timestamp

### Page:
`src/pages/shared/Notifications.jsx`

---

## 5. Interview Conducted & Results

### Admin Records Results:

1. Navigate to "Interview Management" → "Scheduled Interviews" tab
2. For each interview:
   - Click "Record Interview Result"
   - Select result: **Selected** or **Not Selected**
   - Add optional remarks
   - Submit

### What Happens:
- Interview status changes to "Completed"
- Application status updates:
  - **Selected** → "Interview Passed"
  - **Not Selected** → "Interview Failed"
- Students can see result in their notifications

### Page:
`src/pages/admin/InterviewManagement.jsx`

### Data Structure:
```javascript
{
  id: "interview-123",
  applicationId: "app-456",
  userId: "student-789",
  hallId: "hall-muh",
  interviewDate: "2025-10-15",
  interviewTime: "10:00 AM",
  venue: "Hall Office",
  status: "Completed",
  result: "Selected",
  remarks: "Good performance",
  createdAt: "2025-10-04T10:00:00Z"
}
```

---

## 6. Payment Process

### Admin Marks Payment:

In Applications page, admin can:
- Check "Payment Done" checkbox for each application
- Only students with "Interview Passed" status and "Payment Done" become eligible for seat allocation

### Page:
`src/pages/admin/Applications.jsx`

---

## 7. Seat Allocation

### Eligibility Criteria:
- Application status: "Interview Passed"
- Payment status: "Done"
- No existing seat allocation

### Admin Actions:

#### **View Eligible Students:**
Navigate to "Seat Allocation Management"
- See all eligible applicants
- Sorted by score (highest first)
- Can filter by Session and Department

#### **Allocate Seat:**
1. Select a student from the list
2. Enter:
   - **Room Number** (e.g., "101")
   - **Seat Number** (e.g., "A1" or "1")
3. Click "Allocate Seat"

#### **What Happens:**
- Seat allocation record created
- Application status → "Admitted"
- User profile updated with room/seat info
- Notification sent to student

### Page:
`src/pages/admin/SeatAllocationManagement.jsx`

### Views Available:

**1. Allocate Seats Tab:**
- List of eligible students
- Form to allocate seat
- Filters by session/department

**2. Allocated Seats Tab:**
- All currently occupied seats
- Sortable by room number, session, department
- Option to vacate seat

**3. Vacant Seats Tab:**
- Previously allocated but now vacant seats
- History of who occupied the seat
- When it was vacated

### Data Structure:
```javascript
{
  id: "seat-abc123",
  userId: "student-789",
  hallId: "hall-muh",
  roomNumber: "101",
  seatNumber: "A1",
  session: "2024-25",
  department: "CSE",
  status: "Occupied",
  allocatedAt: "2025-10-05T10:00:00Z",
  vacatedAt: null
}
```

---

## 8. Seat Management

### Admin Capabilities:

#### **Sorting & Filtering:**

**Sort By:**
- Room Number (default)
- Session
- Department

**Filter By:**
- Session (e.g., 2024-25, 2023-24)
- Department (e.g., CSE, EEE, BBA)
- Status (Occupied / Vacant)

#### **Vacate Seat:**
1. Find the allocated seat
2. Click "Vacate Seat"
3. Confirm action

**What Happens:**
- Seat status → "Vacant"
- Student's seat info cleared
- Notification sent to student
- Seat becomes available for reallocation

### Use Cases:
- Student leaves the hall
- Disciplinary action
- Graduation
- Transfer to another hall

### Page:
`src/pages/admin/SeatAllocationManagement.jsx`

---

## 9. Disciplinary Records

### Adding a Record:

1. Navigate to "Disciplinary Records"
2. Click "+ Add Record"
3. Fill the form:
   - **Select Student** (dropdown of all hall students)
   - **Offense Type** (e.g., "Noise Violation", "Damage to Property")
   - **Severity:** Minor / Major / Severe
   - **Action Taken** (e.g., "Warning", "Fine $50", "Suspension")
   - **Description** (detailed explanation)
4. Submit

### What Happens:
- Record saved with timestamp
- Notification sent to student
- Record visible to admin

### Features:

#### **Search & Filter:**
- Search by student name, ID, or offense type
- Filter by severity (Minor/Major/Severe)

#### **Color Coding:**
- **Minor** → Yellow badge
- **Major** → Orange badge  
- **Severe** → Red badge

#### **Management:**
- View all records
- Delete records (with confirmation)
- Edit records

### Page:
`src/pages/admin/DisciplinaryRecords.jsx`

### Data Structure:
```javascript
{
  id: "disc-xyz789",
  userId: "student-456",
  hallId: "hall-muh",
  offenseType: "Noise Violation",
  description: "Playing loud music after 10 PM",
  actionTaken: "Written Warning",
  severity: "Minor",
  recordedBy: "admin-123",
  recordedAt: "2025-10-05T15:30:00Z"
}
```

---

## API Functions Reference

### Interview Management:

```javascript
// Calculate application score
api.calculateApplicationScore(application)
// Returns: number (total score)

// Publish interview list
api.publishInterviewList({
  hallId,
  selectedApplicationIds,
  interviewDate,
  interviewTime,
  venue
})
// Creates interviews and notifications

// List interviews
api.listInterviews({ hallId, userId, status })

// Update interview
api.updateInterview(interviewId, {
  status: "Completed",
  result: "Selected",
  remarks: "Good performance"
})
```

### Seat Allocation:

```javascript
// Allocate seat
api.allocateSeat({
  userId,
  hallId,
  roomNumber,
  seatNumber,
  session,
  department
})
// Creates allocation, updates user, sends notification

// List allocations
api.listSeatAllocations({
  hallId,
  session,
  department,
  status,
  userId
})

// Vacate seat
api.vacateSeat(allocationId)
// Updates status, clears user info, sends notification
```

### Disciplinary Records:

```javascript
// Add record
api.addDisciplinaryRecord({
  userId,
  hallId,
  offenseType,
  description,
  actionTaken,
  severity,
  recordedBy
})

// List records
api.listDisciplinaryRecords({ hallId, userId, severity })

// Update record
api.updateDisciplinaryRecord(recordId, updates)

// Delete record
api.deleteDisciplinaryRecord(recordId)
```

---

## Admin Dashboard Integration

### New Menu Items:

The Admin Dashboard (`/admin`) now includes:

1. **Interview Management** - Schedule and manage interviews
2. **Seat Allocation** - Allocate seats to admitted students
3. **Disciplinary Records** - Manage student records

### Navigation:
- Admin Dashboard shows all management cards
- Each card links to respective page
- Color-coded borders for visual distinction

---

## Student Dashboard View

### What Students See:

1. **Notifications Page:**
   - Interview schedule (if scheduled)
   - Interview results (when available)
   - Seat allocation confirmation
   - Disciplinary notifications

2. **Application Status:**
   - Current status visible in their dashboard
   - Score visible (if admin configured)
   - Payment status

---

## Data Flow Diagram

```
┌─────────────┐
│   STUDENT   │
└──────┬──────┘
       │ Submits Application
       ↓
┌─────────────────────────┐
│  APPLICATION (Pending)  │
│  Score: Auto-calculated │
└──────────┬──────────────┘
           │
           ↓
    ┌──────────────┐
    │    ADMIN     │
    │  Sorts by    │
    │    Score     │
    └──────┬───────┘
           │ Selects for Interview
           ↓
┌─────────────────────────┐
│ INTERVIEW SCHEDULED     │
│ Notification → Student  │
└──────────┬──────────────┘
           │
           ↓
    ┌──────────────┐
    │  INTERVIEW   │
    │  CONDUCTED   │
    └──────┬───────┘
           │ Admin Records Result
           ↓
┌─────────────────────────┐
│  INTERVIEW PASSED       │
│  Student Pays           │
└──────────┬──────────────┘
           │
           ↓
    ┌──────────────┐
    │    ADMIN     │
    │  Allocates   │
    │     Seat     │
    └──────┬───────┘
           │
           ↓
┌─────────────────────────┐
│     ADMITTED            │
│  Seat: Room 101, Seat A1│
│  Notification → Student │
└─────────────────────────┘
           │
           ↓
    ┌──────────────┐
    │   ONGOING    │
    │  MANAGEMENT  │
    └──────────────┘
    - Vacate Seat
    - Add Disciplinary Record
    - Filter by Session/Dept
```

---

## Testing the Complete Flow

### Step-by-Step Test:

1. **Create a Form** (`/admin/forms`)
   - Add fields with scores
   - e.g., "CGPA" = 20 points, "Extracurricular" = 10 points

2. **Student Applies** (`/student/form`)
   - Fill all fields
   - Submit application

3. **Admin Reviews** (`/admin/applications`)
   - Sort by score
   - Check student's total score

4. **Schedule Interview** (`/admin/interviews`)
   - Select student(s)
   - Set date, time, venue
   - Publish

5. **Student Checks** (`/notifications`)
   - See interview schedule
   - Note date/time/venue

6. **Record Result** (`/admin/interviews` → Scheduled Interviews tab)
   - Select "Selected"
   - Add remarks
   - Submit

7. **Mark Payment** (`/admin/applications`)
   - Check "Payment Done"

8. **Allocate Seat** (`/admin/seat-allocation`)
   - Select student
   - Enter room & seat number
   - Allocate

9. **Verify** (`/admin/seat-allocation` → Allocated Seats tab)
   - See allocated seat
   - Filter by session/department

10. **Add Disciplinary Record** (Optional) (`/admin/disciplinary`)
    - Select student
    - Add offense details
    - Submit

11. **Vacate Seat** (Optional) (`/admin/seat-allocation`)
    - Find allocated seat
    - Click "Vacate Seat"
    - Confirm

---

## Key Features Summary

### ✅ Implemented Features:

1. **Score-based Application Sorting**
   - Automatic score calculation
   - Sort by score, session, department
   - Filter by multiple statuses

2. **Interview Management**
   - Select multiple candidates
   - Publish interview list
   - Send automatic notifications
   - Record interview results

3. **Student Notifications**
   - Interview schedule display
   - Read/unread indicators
   - Interview results
   - Seat allocation confirmation

4. **Seat Allocation**
   - Eligibility check (passed interview + paid)
   - Room and seat assignment
   - Session and department tracking
   - Automatic notifications

5. **Seat Management**
   - Sort by room, session, department
   - Filter by status
   - Vacate seats
   - Track vacant seats

6. **Disciplinary Records**
   - Add/view/delete records
   - Severity levels (Minor/Major/Severe)
   - Search and filter
   - Automatic notifications

---

## Files Modified/Created

### New Files:
1. `src/pages/admin/InterviewManagement.jsx`
2. `src/pages/admin/SeatAllocationManagement.jsx`
3. `src/pages/admin/DisciplinaryRecords.jsx`
4. `SEAT_ALLOCATION_DOCUMENTATION.md` (this file)

### Modified Files:
1. `src/lib/mockApi.js` - Added new API functions
2. `src/App.jsx` - Added new routes
3. `src/pages/admin/AdminDashboard.jsx` - Added new menu items
4. `src/pages/admin/Applications.jsx` - Added score display and sorting
5. `src/pages/shared/Notifications.jsx` - Enhanced with interview display

---

## Notes

- All data is stored in localStorage (mock backend)
- No actual deployment/build done (as requested)
- All features are fully functional
- Ready for testing and further development

---

## Next Steps (Future Enhancements)

Potential future additions:
- Email notifications (real)
- SMS notifications
- Document upload for applications
- Print interview call letters
- Export seat allocation reports
- Bulk seat allocation
- Seat swap functionality
- Appeals process for rejected applications
