// Simple in-browser mock API using localStorage to simulate backend
// Data model keys
const KEYS = {
  users: 'uh_users',
  session: 'uh_session',
  forms: 'uh_forms',
  applications: 'uh_applications',
  seats: 'uh_seats',
  waitlist: 'uh_waitlist',
  complaints: 'uh_complaints',
  notifications: 'uh_notifications',
  renewals: 'uh_renewals',
  halls: 'uh_halls',
  results: 'uh_results',
  seatPlanUploads: 'uh_seat_plan_uploads',
  interviews: 'uh_interviews',
  seatAllocations: 'uh_seat_allocations',
  disciplinaryRecords: 'uh_disciplinary_records'
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function ensureSeedData() {
  // NSTU Halls of Residence (official data from nstu.edu.bd)
  const masterHalls = [
    { id: 'hall-ash', name: 'Basha Shaheed Abdus Salam Hall', shortName: 'ASH', category: 'Male', capacity: 400, established: 2006,
      localImg: '/halls/ASH.jpg', img: 'https://nstu.edu.bd/assets/images/accommodation/ASH.jpg', fallbackImg: 'https://images.unsplash.com/photo-1520637736862-4d197d17c155?w=800',
      provost: { name: 'Md. Farid Dewan', phone: '+8801717386048', email: 'provost.ash@nstu.edu.bd' },
      address: 'Basha Shaheed Abdus Salam Hall, NSTU Campus, Sonapur, Noakhali-3814' },
    { id: 'hall-muh', name: 'Bir Muktijuddha Abdul Malek Ukil Hall', shortName: 'MUH', category: 'Male', capacity: 350, established: 2010,
      localImg: '/halls/MUH.jpg', img: 'https://nstu.edu.bd/assets/images/accommodation/MUH.jpg', fallbackImg: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800',
      provost: { name: 'Hall Provost', phone: '+880-XXXX-XXXXXX', email: 'provost.muh@nstu.edu.bd' },
      address: 'Bir Muktijuddha Abdul Malek Ukil Hall, NSTU Campus, Sonapur, Noakhali-3814' },
    { id: 'hall-bkh', name: 'Hazrat Bibi Khadiza Hall', shortName: 'BKH', category: 'Female', capacity: 300, established: 2008,
      localImg: '/halls/BKH.jpg', img: 'https://nstu.edu.bd/assets/images/accommodation/BKH.jpg', fallbackImg: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800',
      provost: { name: 'Hall Provost', phone: '+880-XXXX-XXXXXX', email: 'provost.bkh@nstu.edu.bd' },
      address: 'Hazrat Bibi Khadiza Hall, NSTU Campus, Sonapur, Noakhali-3814' },
    { id: 'hall-jsh', name: 'July Shaheed Smriti Chhatri Hall', shortName: 'JSH', category: 'Female', capacity: 280, established: 2012,
      localImg: '/halls/BMH.jpg', img: 'https://nstu.edu.bd/assets/images/accommodation/JSH.jpg', fallbackImg: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800',
      provost: { name: 'Hall Provost', phone: '+880-XXXX-XXXXXX', email: 'provost.jsh@nstu.edu.bd' },
      address: 'July Shaheed Smriti Chhatri Hall, NSTU Campus, Sonapur, Noakhali-3814' },
    { id: 'hall-nfh', name: 'Nabab Foyzunnessa Choudhurani Hall', shortName: 'NFH', category: 'Female', capacity: 320, established: 2014,
      localImg: '/halls/FMH.jpg', img: 'https://nstu.edu.bd/assets/images/accommodation/NFH.jpg', fallbackImg: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=800',
      provost: { name: 'Hall Provost', phone: '+880-XXXX-XXXXXX', email: 'provost.nfh@nstu.edu.bd' },
      address: 'Nabab Foyzunnessa Choudhurani Hall, NSTU Campus, Sonapur, Noakhali-3814' }
  ]
  if (!read(KEYS.halls)) {
    write(KEYS.halls, masterHalls)
  }
  // Normalize/upgrade existing halls to ensure local images and correct codes are set
  let hallsNow = read(KEYS.halls, [])
  if (Array.isArray(hallsNow) && hallsNow.length) {
    let changed = false
    // Normalize existing and ensure all master halls are present
    const normalized = hallsNow.map(h => {
      const sn = h.shortName || ''
      const expectedLocal = sn === 'JSH' ? '/halls/BMH.jpg' : sn === 'NFH' ? '/halls/FMH.jpg' : (sn ? `/halls/${sn}.jpg` : (h.localImg || ''))
      const expectedRemote = sn ? `https://nstu.edu.bd/assets/images/accommodation/${sn}.jpg` : (h.img || '')
      const next = { ...h }
      if (expectedLocal && next.localImg !== expectedLocal) { next.localImg = expectedLocal; changed = true }
      if (expectedRemote && next.img !== expectedRemote) { next.img = expectedRemote; changed = true }
      return next
    })
    
    // Merge with master halls and deduplicate
    const byShort = new Map()
    const masterByShort = new Map(masterHalls.map(m => [m.shortName, m]))
    
    const combined = [...normalized, ...masterHalls]
    combined.forEach(h => {
      if (!h.shortName) return
      const m = masterByShort.get(h.shortName) || {}
      const merged = { ...m, ...h, id: m.id || h.id }
      const prev = byShort.get(merged.shortName)
      if (!prev || (merged.localImg && !prev.localImg)) {
        byShort.set(merged.shortName, merged)
      }
    })
    
    const deduped = masterHalls.map(m => byShort.get(m.shortName)).filter(Boolean)
    if (changed || deduped.length !== hallsNow.length) {
      write(KEYS.halls, deduped)
      changed = true
    }
  }
  const existingUsers = read(KEYS.users)
  if (!existingUsers) {
    const halls = read(KEYS.halls, [])
    write(KEYS.users, [
      // Admin credentials for each hall
    { id: 'admin-ash', name: 'Admin - Abdus Salam Hall', email: 'admin.ash@nstu.edu.bd', role: 'admin', hallId: 'hall-ash', password: 'ash123' },
    { id: 'admin-muh', name: 'Admin - Abdul Malek Ukil Hall', email: 'admin.muh@nstu.edu.bd', role: 'admin', hallId: 'hall-muh', password: 'muh123' },
    { id: 'admin-bkh', name: 'Admin - Bibi Khadiza Hall', email: 'admin.bkh@nstu.edu.bd', role: 'admin', hallId: 'hall-bkh', password: 'bkh123' },
      { id: 'admin-jsh', name: 'Admin - July Shaheed Hall', email: 'admin.jsh@nstu.edu.bd', role: 'admin', hallId: 'hall-jsh', password: 'jsh123' },
      { id: 'admin-nfh', name: 'Admin - Foyzunnessa Hall', email: 'admin.nfh@nstu.edu.bd', role: 'admin', hallId: 'hall-nfh', password: 'nfh123' },
      
      // Student credentials for each hall
    { id: 'student-ash', name: 'Ahmed Rahman', email: 'student.ash@nstu.edu.bd', role: 'student', hallId: 'hall-ash', password: 'student123' },
    { id: 'student-muh', name: 'Karim Ahmed', email: 'student.muh@nstu.edu.bd', role: 'student', hallId: 'hall-muh', password: 'student123' },
    { id: 'student-bkh', name: 'Fatima Khan', email: 'student.bkh@nstu.edu.bd', role: 'student', hallId: 'hall-bkh', password: 'student123' },
      { id: 'student-jsh', name: 'Ayesha Ali', email: 'student.jsh@nstu.edu.bd', role: 'student', hallId: 'hall-jsh', password: 'student123' },
      { id: 'student-nfh', name: 'Nasreen Begum', email: 'student.nfh@nstu.edu.bd', role: 'student', hallId: 'hall-nfh', password: 'student123' },

      // Other roles
      { id: 'exam-1', name: 'Exam Controller', email: 'exam@nstu.edu.bd', role: 'examcontroller', password: 'exam123' },
      { id: 'staff-1', name: 'Hall Staff', email: 'staff@nstu.edu.bd', role: 'staff', hallId: 'hall-ash', password: 'staff123' }
    ])
  } else {
    // Ensure all hall admins exist
    const halls = read(KEYS.halls, [])
    const users = Array.isArray(existingUsers) ? existingUsers : []
    
    // Add missing hall admins
    const hallAdmins = [
    { id: 'admin-ash', name: 'Admin - Abdus Salam Hall', email: 'admin.ash@nstu.edu.bd', role: 'admin', hallId: 'hall-ash', password: 'ash123' },
    { id: 'admin-muh', name: 'Admin - Abdul Malek Ukil Hall', email: 'admin.muh@nstu.edu.bd', role: 'admin', hallId: 'hall-muh', password: 'muh123' },
    { id: 'admin-bkh', name: 'Admin - Bibi Khadiza Hall', email: 'admin.bkh@nstu.edu.bd', role: 'admin', hallId: 'hall-bkh', password: 'bkh123' },
      { id: 'admin-jsh', name: 'Admin - July Shaheed Hall', email: 'admin.jsh@nstu.edu.bd', role: 'admin', hallId: 'hall-jsh', password: 'jsh123' },
      { id: 'admin-nfh', name: 'Admin - Foyzunnessa Hall', email: 'admin.nfh@nstu.edu.bd', role: 'admin', hallId: 'hall-nfh', password: 'nfh123' }
    ]
    
    hallAdmins.forEach(admin => {
      if (!users.some(u => u.email === admin.email)) {
        users.push(admin)
      }
    })
    
    // Add other essential users if missing
    if (!users.some(u => u.email === 'exam@nstu.edu.bd')) {
      users.push({ id: `exam-${Date.now()}`, name: 'Exam Controller', email: 'exam@nstu.edu.bd', role: 'examcontroller', password: 'exam123' })
    }
    if (!users.some(u => u.email === 'staff@nstu.edu.bd')) {
      users.push({ id: `staff-${Date.now()}`, name: 'Hall Staff', email: 'staff@nstu.edu.bd', role: 'staff', hallId: 'hall-ash', password: 'staff123' })
    }
    
    write(KEYS.users, users)
  }
  if (!read(KEYS.forms)) {
    const defaultForm = {
      id: 'form-1', name: 'Hall Admission Form', active: true, hallId: null, createdAt: Date.now(),
      schema: [
        { id: 'f1', label: 'Full Name', type: 'text', required: true },
        { id: 'f2', label: 'Student ID', type: 'text', required: true },
        { id: 'f3', label: 'Department', type: 'dropdown', options: ['CSE','EEE','ICE','BBA'], required: true },
        { id: 'f4', label: 'Session (e.g., 2019-20)', type: 'text', required: true },
        { id: 'f5', label: 'Date of Birth', type: 'date' },
        { id: 'f6', label: 'Guardian Contact', type: 'text' },
        { id: 'f7', label: 'Quota', type: 'checkbox', options: ['Freedom Fighter','Tribal','None'] }
      ]
    }
    write(KEYS.forms, [defaultForm])
  }
  if (!read(KEYS.seats)) {
    // Seed different seat maps for each hall to make them look distinct
    const halls = read(KEYS.halls, [])
    const seats = []
    halls.forEach((hall, idx) => {
      // Each hall has different number of floors, rooms, and bed configurations
      const floors = idx === 0 ? 3 : idx === 1 ? 4 : idx === 2 ? 2 : idx === 3 ? 3 : 2 // ASH:3, MUH:4, BKH:2, JSH:3, NFH:2
      const roomsPerFloor = idx === 0 ? 4 : idx === 1 ? 5 : idx === 2 ? 3 : idx === 3 ? 4 : 3
      const bedsPerRoom = idx % 2 === 0 ? 2 : 3 // Alternate 2 and 3 beds per room
      
      for (let floor = 1; floor <= floors; floor++) {
        const roomStart = floor * 100 + 1
        for (let room = roomStart; room < roomStart + roomsPerFloor; room++) {
          for (let bed = 1; bed <= bedsPerRoom; bed++) {
            // Vary the status to make halls look different
            const statusOptions = ['Available', 'Available', 'Available', 'Occupied', 'Reserved']
            const status = Math.random() > 0.7 ? statusOptions[3 + idx % 2] : 'Available'
            seats.push({ 
              id: `${hall.id}-${floor}-${room}-${bed}`, 
              hallId: hall.id, 
              floor, 
              room, 
              bed, 
              status, 
              studentId: status === 'Occupied' ? `student-${hall.shortName}-${Math.floor(Math.random()*100)}` : null 
            })
          }
        }
      }
    })
    write(KEYS.seats, seats)
  }
  if (!read(KEYS.notifications)) {
    const halls = read(KEYS.halls, [])
    const notifications = []
    halls.forEach((hall, idx) => {
      // Different notifications for each hall
      const notifContent = [
        { title: 'Admission Open', body: 'Hall admission applications are now being accepted for the new session.' },
        { title: 'Seat Allocation Complete', body: 'Room assignments have been posted. Check your dashboard.' },
        { title: 'Maintenance Notice', body: 'Scheduled maintenance on 2nd floor next week.' },
        { title: 'Cultural Program', body: 'Annual cultural program registration is now open.' },
        { title: 'Fee Reminder', body: 'Hall fees for this semester are due by end of month.' }
      ]
      const content = notifContent[idx % notifContent.length]
      notifications.push({ 
        id: `n-${hall.id}`, 
        title: `${hall.shortName}: ${content.title}`, 
        body: content.body, 
        date: Date.now() - (idx * 86400000), // Stagger dates
        hallId: hall.id 
      })
    })
    write(KEYS.notifications, notifications)
  }
  if (!read(KEYS.applications)) {
    // Seed sample applications for different halls
    const halls = read(KEYS.halls, [])
    const users = read(KEYS.users, [])
    const applications = []
    
    halls.forEach((hall, hallIdx) => {
      // Each hall gets 3-5 sample applications with different statuses
      const appCount = 3 + (hallIdx % 3)
      for (let i = 0; i < appCount; i++) {
        const statuses = ['Submitted', 'Under Review', 'Approved', 'Rejected']
        const status = statuses[i % statuses.length]
        const student = users.find(u => u.role === 'student' && u.hallId === hall.id)
        
        applications.push({
          id: `app-${hall.id}-${i}`,
          userId: student?.id || `student-${hall.shortName}-${i}`,
          formId: 'form-1',
          data: {
            fullName: `Student ${hall.shortName} ${i+1}`,
            studentId: `${hall.shortName}202${4+hallIdx}-000${i+1}`,
            department: ['CSE', 'EEE', 'ICE', 'BBA'][i % 4],
            session: `202${4+hallIdx}-2${5+hallIdx}`
          },
          attachments: {},
          status,
          createdAt: Date.now() - ((hallIdx * 10 + i) * 86400000),
          paymentDone: status === 'Approved' && i % 2 === 0,
          hallId: hall.id
        })
      }
    })
    
    write(KEYS.applications, applications)
  }
  
  // Seed demo complaints with actions/status (force reseed if empty)
  const existingComplaints = read(KEYS.complaints, [])
  if (existingComplaints.length === 0) {
    const halls = read(KEYS.halls, [])
    const users = read(KEYS.users, [])
    const complaints = []
    
    halls.forEach((hall) => {
      const student = users.find(u => u.role === 'student' && u.hallId === hall.id)
      const hallAdmin = users.find(u => u.role === 'admin' && u.hallId === hall.id)
      const day = 86400000
      const primaryStudentId = student?.id || `student-${hall.shortName}-1`
      const secondaryStudentId = student?.id || `student-${hall.shortName}-2`

      const resolvedCreatedAt = Date.now() - (7 * day)
      const resolvedWorkingAt = resolvedCreatedAt + (3 * day)
      const resolvedAt = Date.now() - (2 * day)

      complaints.push({
        id: `complaint-${hall.id}-1`,
        userId: primaryStudentId,
        hallId: hall.id,
        title: 'Water Supply Issue',
        body: 'There is no water supply in the 3rd floor bathroom for the last 2 days.',
        attachments: ['maintenance-ticket.pdf'],
        status: 'Resolved',
        reviewNotes: 'Water pump has been fixed. Supply restored on 2nd Oct.',
        createdAt: resolvedCreatedAt,
        updatedAt: resolvedAt,
        reviewedBy: hallAdmin?.id || null,
        history: [
          { status: 'Pending', timestamp: resolvedCreatedAt, actorId: primaryStudentId, notes: 'Complaint submitted by student.' },
          { status: 'Working', timestamp: resolvedWorkingAt, actorId: hallAdmin?.id || null, notes: 'Maintenance team assigned to investigate.' },
          { status: 'Resolved', timestamp: resolvedAt, actorId: hallAdmin?.id || null, notes: 'Water pump repaired and supply restored.' }
        ]
      })
      
      const workingCreatedAt = Date.now() - (1 * day)
      const workingUpdatedAt = workingCreatedAt + (12 * 60 * 60 * 1000) // 12 hours later

      complaints.push({
        id: `complaint-${hall.id}-2`,
        userId: secondaryStudentId,
        hallId: hall.id,
        title: 'Electricity Problem in Room 305',
        body: 'Power socket not working. Need urgent repair for study purposes.',
        attachments: ['room-305-socket.jpg'],
        status: 'Working',
        reviewNotes: 'Electrician has been notified. Will be fixed within 24 hours.',
        createdAt: workingCreatedAt,
        updatedAt: workingUpdatedAt,
        reviewedBy: hallAdmin?.id || null,
        history: [
          { status: 'Pending', timestamp: workingCreatedAt, actorId: secondaryStudentId, notes: 'Complaint submitted by student.' },
          { status: 'Working', timestamp: workingUpdatedAt, actorId: hallAdmin?.id || null, notes: 'Electrician scheduled to visit the room.' }
        ]
      })
    })
    
    write(KEYS.complaints, complaints)
  }
  
  // Seed demo renewals (force reseed if empty)
  const existingRenewals = read(KEYS.renewals, [])
  if (existingRenewals.length === 0) {
    const halls = read(KEYS.halls, [])
    const users = read(KEYS.users, [])
    const renewals = []
    const day = 86400000
    const sampleReasons = [
      'Need additional semester to complete research project and thesis documentation.',
      'Awaiting internship completion certificate that is required for graduation clearance.',
      'Medical treatment schedule overlaps with current semester; require accommodation for recovery period.'
    ]
    const sampleDocs = [
      ['project-extension-letter.pdf'],
      ['internship-offer-letter.jpg', 'department-endorsement.pdf'],
      ['medical-report.pdf']
    ]

    halls.forEach(hall => {
      const students = users.filter(u => u.role === 'student' && u.hallId === hall.id)
      if (students.length === 0) return

      for (let idx = 0; idx < 3; idx += 1) {
        const student = students[idx % students.length]
        const status = idx === 0 ? 'Approved' : idx === 1 ? 'Pending' : 'Rejected'
        const requestedAt = Date.now() - ((idx + 1) * 4 * day)
        const reviewedAt = status === 'Pending' ? null : requestedAt + (2 * day)
        renewals.push({
          id: `renewal-${hall.id}-${idx}`,
          userId: student.id,
          hallId: hall.id,
          status,
          reason: sampleReasons[idx],
          proofDocuments: sampleDocs[idx],
          requestedAt,
          updatedAt: reviewedAt || requestedAt,
          reviewedAt,
          reviewedBy: status === 'Pending' ? null : (users.find(u => u.role === 'admin' && u.hallId === hall.id)?.id || null),
          reviewNotes: status === 'Approved'
            ? 'Reviewed and approved. Student has cleared dues and provided supporting documents.'
            : status === 'Rejected'
              ? 'Rejected due to insufficient documentation. Please resubmit with complete medical report.'
              : ''
        })
      }
    })

    write(KEYS.renewals, renewals)
  }
  
  // Seed demo waitlist entries (force reseed if empty)
  const existingWaitlist = read(KEYS.waitlist, [])
  if (existingWaitlist.length === 0) {
    const halls = read(KEYS.halls, [])
    const waitlist = []
    
    halls.forEach((hall, hallIdx) => {
      // Add 2-3 waitlist entries per hall
      for (let i = 0; i < 2; i++) {
        waitlist.push({
          id: `waitlist-${hall.id}-${i}`,
          studentName: `Waitlist Student ${hall.shortName} ${i+1}`,
          studentId: `${hall.shortName}202${5+hallIdx}-W00${i+1}`,
          email: `waitlist${i+1}.${hall.shortName.toLowerCase()}@student.nstu.edu.bd`,
          phone: `017${hallIdx}${i}000000`,
          department: ['CSE', 'EEE', 'ICE', 'BBA', 'MBA'][i % 5],
          session: `202${5+hallIdx}-2${6+hallIdx}`,
          position: i + 1,
          hallId: hall.id,
          addedAt: Date.now() - ((i + 1) * 3 * 86400000) // Staggered dates
        })
      }
    })
    
    write(KEYS.waitlist, waitlist)
  }
  
  if (!read(KEYS.results)) write(KEYS.results, [])
  if (!read(KEYS.seatPlanUploads)) write(KEYS.seatPlanUploads, [])

  // Seed a default student for quick testing
  const usersNow = read(KEYS.users, [])
  if (!usersNow.some(u => u.email === 'student1@student.nstu.edu.bd')) {
    const studentId = 'MUH2025-0001'
    const hallId = HALL_PREFIX_MAP['MUH']
    usersNow.push({ id: `u-${Date.now()}`, name: 'Test Student', email: 'student1@student.nstu.edu.bd', role: 'student', password: 'student123', studentId, hallId })
    write(KEYS.users, usersNow)
  }
}

export function resetDemoData() {
  // Clear all application keys to reseed
  Object.values(KEYS).forEach(k => localStorage.removeItem(k))
  localStorage.removeItem('uh_pending_registration')
  ensureSeedData()
}

export function getSessionUser() {
  // Return session, enriched with latest user info (hallId, studentId) if missing
  const sess = read(KEYS.session, null)
  if (!sess) return null
  if (sess.hallId && sess.studentId !== undefined) return sess
  const users = read(KEYS.users, [])
  const u = users.find(x => x.id === sess.id || x.email === sess.email)
  if (!u) return sess
  const enriched = { ...sess, hallId: u.hallId ?? sess.hallId, studentId: u.studentId ?? sess.studentId }
  write(KEYS.session, enriched)
  return enriched
}
export function logout() {
  localStorage.removeItem(KEYS.session)
}
export async function login(email, password) {
  const users = read(KEYS.users, [])
  const u = users.find(x => x.email === email && x.password === password)
  if (!u) throw new Error('Invalid credentials')
  // Persist hallId and studentId to enable hall-scoped UI (e.g., backgrounds)
  write(KEYS.session, { id: u.id, name: u.name, role: u.role, email: u.email, hallId: u.hallId ?? null, studentId: u.studentId })
  return getSessionUser()
}
export async function register({ name, email, password }) {
  const users = read(KEYS.users, [])
  if (users.some(u => u.email === email)) throw new Error('Email already exists')
  // Only students can self-register, and they must use student email domain
  if (!/^[^@]+@student\.nstu\.edu\.bd$/i.test(email)) {
    throw new Error('Only students can register with @student.nstu.edu.bd emails')
  }
  // Expect studentId and derive hall from its prefix
  const pending = pendingRegistration()
  const studentId = pending?.studentId
  if (!studentId) throw new Error('Student ID is required')
  const hallId = deriveHallFromStudentId(studentId)
  if (!hallId) throw new Error('Invalid Student ID prefix. Cannot determine hall.')
  const newUser = { id: `u-${Date.now()}`, name, email, role: 'student', password, studentId, hallId }
  users.push(newUser)
  write(KEYS.users, users)
  write(KEYS.session, { id: newUser.id, name: newUser.name, role: newUser.role, email: newUser.email, hallId: newUser.hallId })
  return getSessionUser()
}

// User queries
export function getUserById(userId) {
  const users = read(KEYS.users, [])
  return users.find(u => u.id === userId) || null
}

// Forms
export function getFormById(formId) {
  const forms = read(KEYS.forms, [])
  return forms.find(f => f.id === formId) || null
}

export function getActiveFormForHall(hallId) {
  const forms = read(KEYS.forms, [])
  // Prefer hall-specific active form, else a global active form
  return forms.find(f => f.active && f.hallId === hallId) || forms.find(f => f.active && (f.hallId == null)) || null
}
export function listForms(filter = {}) {
  let forms = read(KEYS.forms, [])
  if (filter.hallId !== undefined) forms = forms.filter(f => f.hallId === filter.hallId)
  return forms
}
export function saveForm(form) {
  const forms = read(KEYS.forms, [])
  const idx = forms.findIndex(f => f.id === form.id)
  if (idx >= 0) forms[idx] = form; else forms.push(form)
  write(KEYS.forms, forms)
  return form
}
export function createForm(payload) {
  const form = { id: `form-${Date.now()}`, active: false, hallId: payload.hallId ?? null, createdAt: Date.now(), ...payload }
  const forms = read(KEYS.forms, [])
  forms.push(form)
  write(KEYS.forms, forms)
  return form
}
export function setActiveForm(id, hallId) {
  const forms = read(KEYS.forms, [])
  // Deactivate all forms for this hall (including global null if hallId is null)
  forms.forEach(f => { if (f.hallId === hallId) f.active = false })
  const form = forms.find(f => f.id === id)
  if (form) { form.active = true; form.hallId = hallId }
  write(KEYS.forms, forms)
}

// Applications
export function submitApplication({ userId, formId, data, attachments }) {
  const apps = read(KEYS.applications, [])
  const user = read(KEYS.users, []).find(u => u.id === userId)
  const app = { id: `app-${Date.now()}`, userId, formId, data, attachments: attachments || {}, status: 'Submitted', createdAt: Date.now(), paymentDone: false, hallId: user?.hallId || null }
  apps.push(app)
  write(KEYS.applications, apps)
  return app
}
export function listApplications(filter = {}) {
  let apps = read(KEYS.applications, [])
  if (filter.userId) apps = apps.filter(a => a.userId === filter.userId)
  if (filter.hallId) apps = apps.filter(a => a.hallId === filter.hallId)
  if (filter.formId) apps = apps.filter(a => a.formId === filter.formId)
  return apps
}
export function updateApplicationStatus(id, status) {
  const apps = read(KEYS.applications, [])
  const a = apps.find(x => x.id === id)
  if (a) a.status = status
  write(KEYS.applications, apps)
  return a
}
export function markPayment(id, paid) {
  const apps = read(KEYS.applications, [])
  const a = apps.find(x => x.id === id)
  if (a) a.paymentDone = paid
  write(KEYS.applications, apps)
  return a
}

// Seats
export function listSeats(filter = {}) {
  let seats = read(KEYS.seats, [])
  if (filter.hallId) seats = seats.filter(s => s.hallId === filter.hallId)
  return seats
}
export function updateSeat(id, patch) {
  const seats = read(KEYS.seats, [])
  const s = seats.find(x => x.id === id)
  if (s) Object.assign(s, patch)
  write(KEYS.seats, seats)
  return s
}
export function assignSeatToStudent(seatId, studentId) {
  return updateSeat(seatId, { status: 'Occupied', studentId })
}

// Waitlist: derived from apps not paid after approved
export function listWaitlist(filter = {}) {
  let apps = read(KEYS.applications, [])
  apps = apps.filter(a => a.status === 'Approved' && !a.paymentDone)
  if (filter.hallId) apps = apps.filter(a => a.hallId === filter.hallId)
  return apps
}

// Renewals
export function requestRenewal({ userId, reason, proofDocuments }) {
  const renewals = read(KEYS.renewals, [])
  const users = read(KEYS.users, [])
  const user = users.find(u => u.id === userId)
  if (!user || user.role !== 'student') throw new Error('Only students can request renewals')

  const now = Date.now()
  const entry = {
    id: `r-${now}`,
    userId,
    hallId: user.hallId || null,
    status: 'Pending',
    reason: reason?.trim() || 'No reason provided.',
    proofDocuments: Array.isArray(proofDocuments) ? proofDocuments : [],
    requestedAt: now,
    updatedAt: now,
    reviewedAt: null,
    reviewedBy: null,
    reviewNotes: ''
  }
  renewals.push(entry)
  write(KEYS.renewals, renewals)
  return entry
}
export function listRenewals(filter = {}) {
  let renewals = read(KEYS.renewals, [])
  let changed = false
  const statusAliases = {
    Requested: 'Pending'
  }

  renewals = renewals.map(item => {
    const next = { ...item }
    if (statusAliases[next.status]) { next.status = statusAliases[next.status]; changed = true }
    if (!next.status) { next.status = 'Pending'; changed = true }
    if (!next.reason) { next.reason = 'No reason provided.'; changed = true }
    if (!Array.isArray(next.proofDocuments)) { next.proofDocuments = []; changed = true }
    if (!next.requestedAt) { next.requestedAt = next.createdAt || Date.now(); changed = true }
    if (!next.updatedAt) { next.updatedAt = next.reviewedAt || next.requestedAt; changed = true }
    if (next.hallId === undefined) { next.hallId = null; changed = true }
    if (next.reviewNotes === undefined) { next.reviewNotes = ''; changed = true }
    return next
  })

  if (changed) {
    write(KEYS.renewals, renewals)
  }

  if (filter.userId) renewals = renewals.filter(r => r.userId === filter.userId)
  if (filter.hallId) renewals = renewals.filter(r => r.hallId === filter.hallId)

  return renewals
}
export function updateRenewal(id, status, reviewerId, reviewNotes) {
  const renewals = read(KEYS.renewals, [])
  const entry = renewals.find(x => x.id === id)
  if (entry) {
    entry.status = status
    entry.reviewedBy = reviewerId || entry.reviewedBy || null
    entry.reviewNotes = reviewNotes !== undefined ? reviewNotes : entry.reviewNotes
    entry.reviewedAt = Date.now()
    entry.updatedAt = entry.reviewedAt
  }
  write(KEYS.renewals, renewals)
  return entry
}

// Notifications
export function listNotifications(filter = {}) {
  let list = read(KEYS.notifications, [])
  if (filter.hallId) list = list.filter(n => n.hallId === filter.hallId)
  return list
}
export function createNotification(title, body, hallId) {
  const list = read(KEYS.notifications, [])
  const n = { id: `n-${Date.now()}`, title, body, hallId: hallId || null, date: Date.now() }
  list.push(n)
  write(KEYS.notifications, list)
  return n
}

// Complaints (hall-specific, only students can file)
export function createComplaint({ userId, title, body, attachments }) {
  const users = read(KEYS.users, [])
  const user = users.find(u => u.id === userId)
  if (!user || user.role !== 'student') throw new Error('Only students can file complaints')
  
  const list = read(KEYS.complaints, [])
  const now = Date.now()
  const c = { 
    id: `c-${Date.now()}`, 
    userId, 
    hallId: user.hallId, // Complaint tied to student's hall
    title, 
    body, 
    attachments: attachments || [], // Array of file names/URLs
    status: 'Pending', 
    createdAt: now,
    updatedAt: now,
    reviewedBy: null,
    reviewNotes: '',
    history: [
      { status: 'Pending', timestamp: now, actorId: userId, notes: 'Complaint submitted by student.' }
    ]
  }
  list.push(c)
  write(KEYS.complaints, list)
  return c
}

export function listComplaints(filter = {}) {
  const statusMap = {
    Open: 'Pending',
    'In Progress': 'Working',
    Closed: 'Resolved'
  }

  let list = read(KEYS.complaints, [])
  let changed = false

  list = list.map(item => {
    const next = { ...item }

    if (statusMap[next.status]) {
      next.status = statusMap[next.status]
      changed = true
    }

    if (!next.title && next.subject) {
      next.title = next.subject
      changed = true
    }

    if (!next.body && next.description) {
      next.body = next.description
      changed = true
    }

    if ((next.reviewNotes === undefined || next.reviewNotes === null) && next.response) {
      next.reviewNotes = next.response
      changed = true
    }

    if (!Array.isArray(next.attachments)) {
      next.attachments = []
      changed = true
    }

    if (!Array.isArray(next.history)) {
      next.history = []
      changed = true
    }

    if (!next.createdAt) {
      next.createdAt = Date.now()
      changed = true
    }

    if (!next.updatedAt) {
      next.updatedAt = next.resolvedAt || next.createdAt
      changed = true
    }

    return next
  })

  if (changed) {
    write(KEYS.complaints, list)
  }

  if (filter.userId) list = list.filter(c => c.userId === filter.userId)
  if (filter.hallId) list = list.filter(c => c.hallId === filter.hallId)
  return list
}

export function updateComplaintStatus(id, status, reviewedBy, reviewNotes) {
  const list = read(KEYS.complaints, [])
  const c = list.find(x => x.id === id)
  if (c) {
    const now = Date.now()
    c.status = status
    if (reviewedBy !== undefined) c.reviewedBy = reviewedBy
    if (reviewNotes !== undefined) c.reviewNotes = reviewNotes
    c.updatedAt = now

    if (!Array.isArray(c.history)) c.history = []
    c.history.push({ status, timestamp: now, actorId: reviewedBy || null, notes: reviewNotes || '' })
  }
  write(KEYS.complaints, list)
  return c
}

// Halls
export function listHalls() { return read(KEYS.halls, []) }
export function getHallById(id) { return read(KEYS.halls, []).find(h => h.id === id) }
export function updateUserHall(userId, hallId) {
  const users = read(KEYS.users, [])
  const u = users.find(x => x.id === userId)
  if (u) u.hallId = hallId
  write(KEYS.users, users)
  const sess = getSessionUser()
  if (sess?.id === userId) write(KEYS.session, { ...sess, hallId })
  return u
}

// Results upload (by exam controller)
export function createResultUpload({ hallId, name, content, rows }) {
  const list = read(KEYS.results, [])
  const item = { id: `res-${Date.now()}`, hallId, name, content, rows: rows || [], createdAt: Date.now() }
  list.push(item)
  write(KEYS.results, list)
  return item
}
export function listResults(filter = {}) {
  let list = read(KEYS.results, [])
  if (filter.hallId) list = list.filter(i => i.hallId === filter.hallId)
  return list
}

// Seat plan upload (by exam controller)
export function createSeatPlanUpload({ hallId, name, content, rows }) {
  const list = read(KEYS.seatPlanUploads, [])
  const item = { id: `sp-${Date.now()}`, hallId, name, content, rows: rows || [], createdAt: Date.now() }
  list.push(item)
  write(KEYS.seatPlanUploads, list)
  return item
}
export function listSeatPlanUploads(filter = {}) {
  let list = read(KEYS.seatPlanUploads, [])
  if (filter.hallId) list = list.filter(i => i.hallId === filter.hallId)
  return list
}

// Registration handoff (simple temp storage to pass studentId from UI to register call)
const PENDING_REG_KEY = 'uh_pending_registration'
export function setPendingRegistration(data) { write(PENDING_REG_KEY, data) }
export function pendingRegistration() { return read(PENDING_REG_KEY, {}) }
export function clearPendingRegistration() { localStorage.removeItem(PENDING_REG_KEY) }

// Map student ID prefixes to halls
const HALL_PREFIX_MAP = {
  MUH: 'hall-muh', // Bir Muktijuddha Abdul Malek Ukil Hall
  ASH: 'hall-ash', // Basha Shaheed Abdus Salam Hall
  BKH: 'hall-bkh', // Hazrat Bibi Khadiza Hall
  JSH: 'hall-jsh', // July Shaheed Smriti Chhatri Hall
  NFH: 'hall-nfh'  // Nabab Foyzunnessa Choudhurani Hall
}
export function deriveHallFromStudentId(studentId) {
  if (!studentId) return null
  const prefix = String(studentId).trim().slice(0,3).toUpperCase()
  return HALL_PREFIX_MAP[prefix] || null
}

// ============================================
// INTERVIEW MANAGEMENT
// ============================================

// Calculate total score for an application
export function calculateApplicationScore(application) {
  const form = getFormById(application.formId)
  if (!form || !form.fields) return 0
  
  let totalScore = 0
  form.fields.forEach(field => {
    if (field.score && application.data[field.id]) {
      totalScore += field.score
    }
  })
  return totalScore
}

// Select applications for interview
export function selectForInterview({ applicationIds, interviewDate, interviewTime, venue, hallId }) {
  const interviews = read(KEYS.interviews, [])
  const notifications = read(KEYS.notifications, [])
  const applications = read(KEYS.applications, [])
  
  applicationIds.forEach(appId => {
    const app = applications.find(a => a.id === appId)
    if (!app) return
    
    // Create interview entry
    const interview = {
      id: `interview-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      applicationId: appId,
      userId: app.userId,
      hallId: hallId,
      interviewDate,
      interviewTime,
      venue,
      status: 'Scheduled', // Scheduled, Completed, Cancelled
      result: null, // Selected, NotSelected
      remarks: '',
      createdAt: new Date().toISOString()
    }
    interviews.push(interview)
    
    // Update application status
    const appIndex = applications.findIndex(a => a.id === appId)
    if (appIndex !== -1) {
      applications[appIndex].status = 'Interview Scheduled'
      applications[appIndex].interviewScheduled = true
    }
    
    // Create notification for student
    const notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      userId: app.userId,
      hallId: hallId,
      type: 'interview',
      title: 'Interview Scheduled',
      message: `Your interview has been scheduled for ${interviewDate} at ${interviewTime}. Venue: ${venue}`,
      read: false,
      createdAt: new Date().toISOString()
    }
    notifications.push(notification)
  })
  
  write(KEYS.interviews, interviews)
  write(KEYS.applications, applications)
  write(KEYS.notifications, notifications)
  
  return interviews
}

// Get interviews
export function listInterviews({ hallId, userId, status }) {
  let interviews = read(KEYS.interviews, [])
  
  if (hallId) interviews = interviews.filter(i => i.hallId === hallId)
  if (userId) interviews = interviews.filter(i => i.userId === userId)
  if (status) interviews = interviews.filter(i => i.status === status)
  
  return interviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
}

// Update interview
export function updateInterview(interviewId, updates) {
  const interviews = read(KEYS.interviews, [])
  const index = interviews.findIndex(i => i.id === interviewId)
  
  if (index !== -1) {
    interviews[index] = { ...interviews[index], ...updates }
    write(KEYS.interviews, interviews)
    
    // If interview result is updated, update application status
    if (updates.result) {
      const applications = read(KEYS.applications, [])
      const appIndex = applications.findIndex(a => a.id === interviews[index].applicationId)
      if (appIndex !== -1) {
        if (updates.result === 'Selected') {
          applications[appIndex].status = 'Interview Passed'
        } else if (updates.result === 'NotSelected') {
          applications[appIndex].status = 'Interview Failed'
        }
        write(KEYS.applications, applications)
      }
    }
    
    return interviews[index]
  }
  
  throw new Error('Interview not found')
}

// ============================================
// SEAT ALLOCATION
// ============================================

// Allocate seat to student
export function allocateSeat({ userId, hallId, roomNumber, seatNumber, session, department }) {
  const allocations = read(KEYS.seatAllocations, [])
  const users = read(KEYS.users, [])
  const notifications = read(KEYS.notifications, [])
  const applications = read(KEYS.applications, [])
  
  // Check if seat already allocated
  const existing = allocations.find(a => 
    a.hallId === hallId && 
    a.roomNumber === roomNumber && 
    a.seatNumber === seatNumber &&
    a.status === 'Occupied'
  )
  
  if (existing) {
    throw new Error('Seat already occupied')
  }
  
  // Check if user already has a seat
  const userSeat = allocations.find(a => a.userId === userId && a.status === 'Occupied')
  if (userSeat) {
    throw new Error('User already has a seat allocated')
  }
  
  const allocation = {
    id: `seat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    hallId,
    roomNumber,
    seatNumber,
    session,
    department,
    status: 'Occupied', // Occupied, Vacant
    allocatedAt: new Date().toISOString(),
    vacatedAt: null
  }
  
  allocations.push(allocation)
  write(KEYS.seatAllocations, allocations)
  
  // Update user role if student
  const userIndex = users.findIndex(u => u.id === userId)
  if (userIndex !== -1 && users[userIndex].role === 'student') {
    users[userIndex].seatAllocated = true
    users[userIndex].roomNumber = roomNumber
    users[userIndex].seatNumber = seatNumber
    write(KEYS.users, users)
  }
  
  // Update application status
  const appIndex = applications.findIndex(a => a.userId === userId && a.hallId === hallId)
  if (appIndex !== -1) {
    applications[appIndex].status = 'Admitted'
    applications[appIndex].seatAllocated = true
    write(KEYS.applications, applications)
  }
  
  // Create notification
  const notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    hallId,
    type: 'seat_allocation',
    title: 'Seat Allocated',
    message: `You have been allocated Room ${roomNumber}, Seat ${seatNumber}`,
    read: false,
    createdAt: new Date().toISOString()
  }
  notifications.push(notification)
  write(KEYS.notifications, notifications)
  
  return allocation
}

// List seat allocations
export function listSeatAllocations({ hallId, session, department, status, userId }) {
  let allocations = read(KEYS.seatAllocations, [])
  
  if (hallId) allocations = allocations.filter(a => a.hallId === hallId)
  if (session) allocations = allocations.filter(a => a.session === session)
  if (department) allocations = allocations.filter(a => a.department === department)
  if (status) allocations = allocations.filter(a => a.status === status)
  if (userId) allocations = allocations.filter(a => a.userId === userId)
  
  return allocations.sort((a, b) => {
    // Sort by room number, then seat number
    if (a.roomNumber !== b.roomNumber) {
      return parseInt(a.roomNumber) - parseInt(b.roomNumber)
    }
    return parseInt(a.seatNumber) - parseInt(b.seatNumber)
  })
}

// Vacate seat
export function vacateSeat(allocationId) {
  const allocations = read(KEYS.seatAllocations, [])
  const users = read(KEYS.users, [])
  const notifications = read(KEYS.notifications, [])
  
  const index = allocations.findIndex(a => a.id === allocationId)
  if (index === -1) {
    throw new Error('Seat allocation not found')
  }
  
  const allocation = allocations[index]
  
  // Update allocation status
  allocations[index] = {
    ...allocation,
    status: 'Vacant',
    vacatedAt: new Date().toISOString()
  }
  write(KEYS.seatAllocations, allocations)
  
  // Update user
  const userIndex = users.findIndex(u => u.id === allocation.userId)
  if (userIndex !== -1) {
    users[userIndex].seatAllocated = false
    users[userIndex].roomNumber = null
    users[userIndex].seatNumber = null
    write(KEYS.users, users)
  }
  
  // Create notification
  const notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId: allocation.userId,
    hallId: allocation.hallId,
    type: 'seat_vacated',
    title: 'Seat Vacated',
    message: `Your seat (Room ${allocation.roomNumber}, Seat ${allocation.seatNumber}) has been vacated`,
    read: false,
    createdAt: new Date().toISOString()
  }
  notifications.push(notification)
  write(KEYS.notifications, notifications)
  
  return allocations[index]
}

// ============================================
// DISCIPLINARY RECORDS
// ============================================

// Add disciplinary record
export function addDisciplinaryRecord({ userId, hallId, offenseType, description, actionTaken, severity, recordedBy }) {
  const records = read(KEYS.disciplinaryRecords, [])
  const notifications = read(KEYS.notifications, [])
  
  const record = {
    id: `disc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    hallId,
    offenseType,
    description,
    actionTaken,
    severity, // Minor, Major, Severe
    recordedBy,
    recordedAt: new Date().toISOString()
  }
  
  records.push(record)
  write(KEYS.disciplinaryRecords, records)
  
  // Create notification
  const notification = {
    id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    userId,
    hallId,
    type: 'disciplinary',
    title: 'Disciplinary Record Added',
    message: `A disciplinary record has been added to your profile. Offense: ${offenseType}`,
    read: false,
    createdAt: new Date().toISOString()
  }
  notifications.push(notification)
  write(KEYS.notifications, notifications)
  
  return record
}

// List disciplinary records
export function listDisciplinaryRecords({ hallId, userId, severity }) {
  let records = read(KEYS.disciplinaryRecords, [])
  
  if (hallId) records = records.filter(r => r.hallId === hallId)
  if (userId) records = records.filter(r => r.userId === userId)
  if (severity) records = records.filter(r => r.severity === severity)
  
  return records.sort((a, b) => new Date(b.recordedAt) - new Date(a.recordedAt))
}

// Update disciplinary record
export function updateDisciplinaryRecord(recordId, updates) {
  const records = read(KEYS.disciplinaryRecords, [])
  const index = records.findIndex(r => r.id === recordId)
  
  if (index !== -1) {
    records[index] = { ...records[index], ...updates }
    write(KEYS.disciplinaryRecords, records)
    return records[index]
  }
  
  throw new Error('Record not found')
}

// Delete disciplinary record
export function deleteDisciplinaryRecord(recordId) {
  const records = read(KEYS.disciplinaryRecords, [])
  const filtered = records.filter(r => r.id !== recordId)
  write(KEYS.disciplinaryRecords, filtered)
  return true
}

// ============================================
// PUBLISH INTERVIEW LIST
// ============================================

export function publishInterviewList({ hallId, selectedApplicationIds, interviewDate, interviewTime, venue }) {
  return selectForInterview({
    applicationIds: selectedApplicationIds,
    interviewDate,
    interviewTime,
    venue,
    hallId
  })
  return HALL_PREFIX_MAP[prefix] || null
}
