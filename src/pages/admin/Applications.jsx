import React, { useMemo, useState } from 'react'

const formSchema = [
  { id: 'fullName', label: 'Full Name', type: 'text' },
  { id: 'studentId', label: 'Student ID', type: 'text' },
  { id: 'department', label: 'Department', type: 'dropdown', options: ['CSE', 'EEE', 'ICE', 'BBA'] },
  { id: 'session', label: 'Session', type: 'text' },
  { id: 'sscGpa', label: 'SSC GPA', type: 'number', score: 30 },
  { id: 'coCurricular', label: 'Co-curricular Activities', type: 'checkbox', options: ['Debate Club', 'Programming Contest', 'Sports', 'Cultural Club'], score: 10 },
  { id: 'incomeCertificate', label: 'Family Income Support', type: 'text', requiresDocument: true, documentLabel: 'Income Certificate' }
]

const initialApplications = [
  {
    id: 'demo-app-1',
    applicant: {
      name: 'Ayesha Rahman',
      email: 'ayesha.rahman@example.com',
      studentId: 'MUH-2021-001'
    },
    formName: 'Spring 2025 Admission',
    status: 'Shortlisted',
    score: 82,
    submittedAt: '2025-09-18T10:00:00Z',
    data: {
      fullName: 'Ayesha Rahman',
      studentId: 'MUH-2021-001',
      department: 'CSE',
      session: '2021-22',
      sscGpa: '4.95',
      coCurricular: ['Programming Contest', 'Debate Club'],
      incomeCertificate: 'Submitted'
    },
    attachments: {
      incomeCertificate: { name: 'IncomeCertificate_Ayesha.pdf' }
    }
  },
  {
    id: 'demo-app-2',
    applicant: {
      name: 'Farhan Uddin',
      email: 'farhan.uddin@example.com',
      studentId: 'MUH-2021-043'
    },
    formName: 'Spring 2025 Admission',
    status: 'Under Review',
    score: 74,
    submittedAt: '2025-09-15T14:30:00Z',
    data: {
      fullName: 'Farhan Uddin',
      studentId: 'MUH-2021-043',
      department: 'ICE',
      session: '2021-22',
      sscGpa: '4.80',
      coCurricular: ['Sports'],
      incomeCertificate: 'Pending'
    },
    attachments: {}
  },
  {
    id: 'demo-app-3',
    applicant: {
      name: 'Shaila Binte Noor',
      email: 'shaila.noor@example.com',
      studentId: 'MUH-2021-112'
    },
    formName: 'Spring 2025 Admission',
    status: 'Rejected',
    score: 61,
    submittedAt: '2025-09-12T09:15:00Z',
    data: {
      fullName: 'Shaila Binte Noor',
      studentId: 'MUH-2021-112',
      department: 'BBA',
      session: '2021-22',
      sscGpa: '4.50',
      coCurricular: ['Cultural Club'],
      incomeCertificate: 'Submitted'
    },
    attachments: {
      incomeCertificate: { name: 'Income_Certificate_Shaila.pdf' }
    }
  }
]

const stageOrder = {
  'Seat Allocated': 0,
  Selected: 1,
  'Interview Scheduled': 2,
  Shortlisted: 3,
  'Under Review': 4,
  Rejected: 5
}

const statusStyles = {
  'Under Review': 'bg-gray-100 text-gray-800 border-gray-200',
  Shortlisted: 'bg-blue-100 text-blue-800 border-blue-200',
  'Interview Scheduled': 'bg-purple-100 text-purple-800 border-purple-200',
  Selected: 'bg-teal-100 text-teal-800 border-teal-200',
  'Seat Allocated': 'bg-emerald-100 text-emerald-800 border-emerald-200',
  Rejected: 'bg-red-100 text-red-800 border-red-200'
}

const formatDate = (isoString) => new Date(isoString).toLocaleDateString(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
})

export default function Applications() {
  const [applications, setApplications] = useState(() => initialApplications.map(app => ({
    ...app,
    stage: app.status || 'Under Review',
    interview: null,
    decision: app.status === 'Rejected' ? 'Rejected' : null,
    seat: null
  })))
  const [expandedId, setExpandedId] = useState(initialApplications[0]?.id ?? null)
  const [selectedIds, setSelectedIds] = useState([])
  const [sortBy, setSortBy] = useState('score')
  const [filterDepartment, setFilterDepartment] = useState('all')
  const [filterSession, setFilterSession] = useState('all')
  const [filterStage, setFilterStage] = useState('all')
  const [interviewModal, setInterviewModal] = useState({ open: false, date: '', time: '', venue: '' })
  const [seatModal, setSeatModal] = useState({ open: false, room: '', bed: '', appId: null })

  const departments = useMemo(
    () => Array.from(new Set(applications.map(app => app.data.department))).filter(Boolean).sort(),
    [applications]
  )

  const sessions = useMemo(
    () => Array.from(new Set(applications.map(app => app.data.session))).filter(Boolean).sort(),
    [applications]
  )

  const stages = useMemo(
    () => Array.from(new Set(applications.map(app => app.stage))).filter(Boolean),
    [applications]
  )

  const summary = useMemo(() => {
    const total = applications.length
    const interviewScheduled = applications.filter(app => app.stage === 'Interview Scheduled').length
    const selected = applications.filter(app => app.stage === 'Selected' || app.stage === 'Seat Allocated').length
    const seatAllocated = applications.filter(app => app.stage === 'Seat Allocated').length
    const averageScore = total ? Math.round(applications.reduce((sum, app) => sum + app.score, 0) / total) : 0
    return { total, interviewScheduled, selected, seatAllocated, averageScore }
  }, [applications])

  const visibleApplications = useMemo(() => {
    let list = applications
    if (filterDepartment !== 'all') {
      list = list.filter(app => app.data.department === filterDepartment)
    }
    if (filterSession !== 'all') {
      list = list.filter(app => app.data.session === filterSession)
    }
    if (filterStage !== 'all') {
      list = list.filter(app => app.stage === filterStage)
    }

    const sorted = [...list]
    sorted.sort((a, b) => {
      if (sortBy === 'score') {
        return b.score - a.score
      }
      if (sortBy === 'department') {
        return (a.data.department || '').localeCompare(b.data.department || '')
      }
      if (sortBy === 'session') {
        return (a.data.session || '').localeCompare(b.data.session || '')
      }
      if (sortBy === 'stage') {
        const aRank = stageOrder[a.stage] ?? 99
        const bRank = stageOrder[b.stage] ?? 99
        return aRank - bRank
      }
      return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    })
    return sorted
  }, [applications, filterDepartment, filterSession, filterStage, sortBy])

  const allVisibleSelected = visibleApplications.length > 0 && visibleApplications.every(app => selectedIds.includes(app.id))
  const selectedCount = selectedIds.length

  const toggleSelect = (id) => {
    setSelectedIds(prev => (prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]))
  }

  const toggleSelectAll = () => {
    if (allVisibleSelected) {
      setSelectedIds([])
    } else {
      setSelectedIds(visibleApplications.map(app => app.id))
    }
  }

  const openInterviewModal = () => {
    if (selectedCount === 0) {
      alert('Select at least one application to schedule an interview.')
      return
    }
    setInterviewModal({ open: true, date: '', time: '', venue: '' })
  }

  const scheduleInterview = () => {
    const { date, time, venue } = interviewModal
    if (!date || !time || !venue.trim()) {
      alert('Provide date, time, and venue to schedule interviews.')
      return
    }
    setApplications(prev => prev.map(app => (
      selectedIds.includes(app.id)
        ? {
            ...app,
            stage: 'Interview Scheduled',
            status: 'Interview Scheduled',
            interview: { date, time, venue: venue.trim() },
            decision: null
          }
        : app
    )))
    setSelectedIds([])
    setInterviewModal({ open: false, date: '', time: '', venue: '' })
  }

  const handleReject = (appId) => {
    setApplications(prev => prev.map(app => (
      app.id === appId
        ? { ...app, stage: 'Rejected', status: 'Rejected', decision: 'Rejected', seat: null }
        : app
    )))
    if (seatModal.appId === appId) {
      setSeatModal({ open: false, room: '', bed: '', appId: null })
    }
  }

  const handleOpenSeatModal = (appId) => {
    setSeatModal({ open: true, room: '', bed: '', appId })
  }

  const confirmSeatAllocation = () => {
    const { room, bed, appId } = seatModal
    if (!room.trim() || !bed.trim()) {
      alert('Enter room and seat details before allocating.')
      return
    }
    setApplications(prev => prev.map(app => (
      app.id === appId
        ? {
            ...app,
            stage: 'Seat Allocated',
            status: 'Seat Allocated',
            decision: 'Accepted',
            seat: { room: room.trim(), bed: bed.trim() }
          }
        : app
    )))
    setSeatModal({ open: false, room: '', bed: '', appId: null })
  }

  const markSelected = (appId) => {
    setApplications(prev => prev.map(app => (
      app.id === appId
        ? { ...app, stage: 'Selected', status: 'Selected', decision: 'Accepted' }
        : app
    )))
    handleOpenSeatModal(appId)
  }

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Applications</h1>
        <p className="text-gray-600 max-w-3xl">
          Review applicant profiles, schedule interviews, record selections, and capture seat assignments. All
          actions update only the in-memory preview so you can rehearse the workflow before the backend is wired in.
        </p>
      </header>

      <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <SummaryCard title="Total Applications" value={summary.total} tone="blue" />
        <SummaryCard title="Interview Scheduled" value={summary.interviewScheduled} tone="purple" />
        <SummaryCard title="Selected / Accepted" value={summary.selected} tone="teal" />
        <SummaryCard title="Avg. Score" value={summary.averageScore} tone="indigo" />
      </section>

      <section className="bg-white border-2 border-gray-200 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap gap-3">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
            <input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} />
            Select all
          </label>
          <button
            onClick={openInterviewModal}
            className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={selectedCount === 0}
          >
            Schedule Interview ({selectedCount})
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="border rounded px-3 py-2 text-sm">
            <option value="score">Sort by Score (high → low)</option>
            <option value="department">Sort by Department (A → Z)</option>
            <option value="session">Sort by Session (A → Z)</option>
            <option value="stage">Sort by Status (Interview & Selected first)</option>
            <option value="submittedAt">Sort by Submission Date (newest)</option>
          </select>
          <select value={filterDepartment} onChange={(e) => setFilterDepartment(e.target.value)} className="border rounded px-3 py-2 text-sm">
            <option value="all">All Departments</option>
            {departments.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select value={filterSession} onChange={(e) => setFilterSession(e.target.value)} className="border rounded px-3 py-2 text-sm">
            <option value="all">All Sessions</option>
            {sessions.map(session => (
              <option key={session} value={session}>{session}</option>
            ))}
          </select>
          <select value={filterStage} onChange={(e) => setFilterStage(e.target.value)} className="border rounded px-3 py-2 text-sm">
            <option value="all">All Statuses</option>
            {stages.map(stage => (
              <option key={stage} value={stage}>{stage}</option>
            ))}
          </select>
          <button
            onClick={() => { setFilterDepartment('all'); setFilterSession('all'); setFilterStage('all'); setSortBy('score'); }}
            className="px-3 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50"
          >
            Reset Filters
          </button>
        </div>
      </section>

      <section className="space-y-4">
        {visibleApplications.map(app => (
          <ApplicationCard
            key={app.id}
            app={app}
            schema={formSchema}
            expanded={expandedId === app.id}
            onToggle={() => setExpandedId(expandedId === app.id ? null : app.id)}
            selected={selectedIds.includes(app.id)}
            onSelect={() => toggleSelect(app.id)}
            onAccept={() => markSelected(app.id)}
            onReject={() => handleReject(app.id)}
          />
        ))}
        {visibleApplications.length === 0 && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center text-gray-500">
            No applications match the current filters.
          </div>
        )}
      </section>

      {interviewModal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 border border-purple-200">
            <h2 className="text-lg font-semibold text-gray-900">Schedule Interview</h2>
            <div className="space-y-3">
              <input type="date" value={interviewModal.date} onChange={(e) => setInterviewModal(modal => ({ ...modal, date: e.target.value }))} className="w-full border rounded px-3 py-2" />
              <input type="time" value={interviewModal.time} onChange={(e) => setInterviewModal(modal => ({ ...modal, time: e.target.value }))} className="w-full border rounded px-3 py-2" />
              <input type="text" value={interviewModal.venue} onChange={(e) => setInterviewModal(modal => ({ ...modal, venue: e.target.value }))} placeholder="Venue" className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex gap-2">
              <button onClick={scheduleInterview} className="flex-1 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">Save</button>
              <button onClick={() => setInterviewModal({ open: false, date: '', time: '', venue: '' })} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {seatModal.open && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4 border border-emerald-200">
            <h2 className="text-lg font-semibold text-gray-900">Allocate Seat</h2>
            <div className="space-y-3">
              <input type="text" value={seatModal.room} onChange={(e) => setSeatModal(modal => ({ ...modal, room: e.target.value }))} placeholder="Room (e.g., 402)" className="w-full border rounded px-3 py-2" />
              <input type="text" value={seatModal.bed} onChange={(e) => setSeatModal(modal => ({ ...modal, bed: e.target.value }))} placeholder="Seat / Bed" className="w-full border rounded px-3 py-2" />
            </div>
            <div className="flex gap-2">
              <button onClick={confirmSeatAllocation} className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700">Allocate</button>
              <button onClick={() => setSeatModal({ open: false, room: '', bed: '', appId: null })} className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ApplicationCard({ app, schema, expanded, onToggle, selected, onSelect, onAccept, onReject }) {
  const interviewDetails = app.interview
  return (
    <article className="bg-white border-2 border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5">
        <div className="flex items-start gap-3">
          <input type="checkbox" checked={selected} onChange={onSelect} className="mt-1" />
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{app.applicant.name}</h2>
            <p className="text-sm text-gray-600">
              {app.applicant.studentId} • {app.applicant.email}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Submitted on {formatDate(app.submittedAt)} • {app.formName}
            </p>
            {interviewDetails && (
              <p className="text-xs text-purple-700 mt-2">
                Interview on {formatDate(interviewDetails.date)} at {interviewDetails.time} • {interviewDetails.venue}
              </p>
            )}
            {app.seat && (
              <p className="text-xs text-emerald-700 mt-2">
                Seat: Room {app.seat.room}, Position {app.seat.bed}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-800 border border-indigo-200">
            📊 {app.score} pts
          </span>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusStyles[app.stage] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
            {app.stage}
          </span>
          <button onClick={onToggle} className="text-sm font-medium text-blue-600 hover:text-blue-700">
            {expanded ? 'Hide details ▲' : 'View details ▼'}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {schema.map(field => {
              const value = app.data[field.id]
              const attachment = app.attachments?.[field.id]
              return (
                <div key={`${app.id}-${field.id}`} className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{field.label}</p>
                  <p className="mt-1 text-sm text-gray-900">
                    {Array.isArray(value) ? value.join(', ') : (value || '—')}
                  </p>
                  {field.score > 0 && (
                    <p className="text-xs text-indigo-600 mt-1">Score weight: {field.score}</p>
                  )}
                  {field.requiresDocument && (
                    <p className="text-xs text-emerald-600 mt-1 flex items-center gap-1">
                      📎 {attachment?.name || 'Document not uploaded'}
                    </p>
                  )}
                </div>
              )
            })}
          </div>

          <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
            {(app.stage === 'Interview Scheduled' || app.stage === 'Selected') && (
              <button onClick={onAccept} className="px-4 py-2 bg-teal-600 text-white rounded hover:bg-teal-700 text-sm font-medium">
                Accept & Allocate Seat
              </button>
            )}
            {app.stage !== 'Seat Allocated' && (
              <button onClick={onReject} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm font-medium">
                Reject
              </button>
            )}
          </div>
        </div>
      )}
    </article>
  )
}

function SummaryCard({ title, value, tone }) {
  const toneMap = {
    blue: 'bg-blue-50 text-blue-800 border-blue-200',
    purple: 'bg-purple-50 text-purple-800 border-purple-200',
    teal: 'bg-teal-50 text-teal-800 border-teal-200',
    indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200'
  }

  return (
    <div className={`rounded-xl border-2 p-4 ${toneMap[tone] ?? 'bg-gray-50 text-gray-800 border-gray-200'}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{title}</p>
      <p className="text-2xl font-bold mt-1">{value}</p>
    </div>
  )
}