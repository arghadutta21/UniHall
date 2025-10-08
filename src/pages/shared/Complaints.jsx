import React, { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import * as api from '../../lib/mockApi.js'

const STATUS_FLOW = ['Pending', 'Working', 'Resolved']
const STATUS_BADGES = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Working: 'bg-blue-100 text-blue-800',
  Resolved: 'bg-green-100 text-green-800'
}

export default function Complaints() {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState(user.role === 'student' ? 'file' : 'review')

  if (user.role === 'examcontroller') {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">No Access</h2>
        <p className="text-gray-600 mt-2">Exam controllers do not have access to the complaints system.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Complaints</h1>
        <p className="text-gray-600">Hall-specific complaint management system</p>
      </div>

      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          {user.role === 'student' && (
            <>
              <button
                onClick={() => setActiveTab('file')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'file'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                File Complaint
              </button>
              <button
                onClick={() => setActiveTab('my-complaints')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'my-complaints'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Complaints
              </button>
            </>
          )}

          {(user.role === 'admin' || user.role === 'staff') && (
            <button
              onClick={() => setActiveTab('review')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'review'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Review Complaints
            </button>
          )}
        </nav>
      </div>

      {activeTab === 'file' && user.role === 'student' && <FileComplaintTab user={user} />}
      {activeTab === 'my-complaints' && user.role === 'student' && <MyComplaintsTab user={user} />}
      {activeTab === 'review' && (user.role === 'admin' || user.role === 'staff') && <ReviewComplaintsTab user={user} />}
    </div>
  )
}

function FileComplaintTab({ user }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [attachments, setAttachments] = useState([])

  const submit = (e) => {
    e.preventDefault()
    if (!title.trim() || !body.trim()) {
      alert('Title and description are required')
      return
    }

    try {
      api.createComplaint({
        userId: user.id,
        title,
        body,
        attachments
      })
      setTitle('')
      setBody('')
      setAttachments([])
      alert('Complaint filed successfully!')
      window.location.reload()
    } catch (err) {
      alert(err.message)
    }
  }

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    const fileNames = files.map(f => f.name)
    setAttachments(fileNames)
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">File a New Complaint</h2>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
          <input
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Brief title of your complaint"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            value={body}
            onChange={e => setBody(e.target.value)}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            placeholder="Detailed description of the issue..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Attachments (Optional)</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          {attachments.length > 0 && (
            <div className="mt-2 text-sm text-gray-600">
              {attachments.length} file(s) attached: {attachments.join(', ')}
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium"
        >
          Submit Complaint
        </button>
      </form>
    </div>
  )
}

function MyComplaintsTab({ user }) {
  const myComplaints = api.listComplaints({ userId: user.id })
  const sortedComplaints = [...myComplaints].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">My Complaints</h2>

      {sortedComplaints.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">You haven't filed any complaints yet.</p>
        </div>
      ) : (
        sortedComplaints.map(c => <ComplaintCard key={c.id} complaint={c} />)
      )}
    </div>
  )
}

function ReviewComplaintsTab({ user }) {
  const [complaints, setComplaints] = useState(() => api.listComplaints({ hallId: user.hallId }))
  const [reviewNotes, setReviewNotes] = useState({})
  const [searchId, setSearchId] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortMode, setSortMode] = useState('status')

  const refreshComplaints = () => {
    setComplaints(api.listComplaints({ hallId: user.hallId }))
  }

  const filteredComplaints = useMemo(() => {
    const normalizedSearch = searchId.trim().toLowerCase()
    return complaints.filter(c => {
      const matchesSearch = normalizedSearch.length === 0 || c.id.toLowerCase().includes(normalizedSearch)
      const matchesStatus = statusFilter === 'all' || c.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [complaints, searchId, statusFilter])

  const sortedComplaints = useMemo(() => {
    const entries = [...filteredComplaints]
    if (sortMode === 'status') {
      return entries.sort((a, b) => {
        const aIdx = STATUS_FLOW.indexOf(a.status)
        const bIdx = STATUS_FLOW.indexOf(b.status)
        const safeA = aIdx === -1 ? Number.MAX_SAFE_INTEGER : aIdx
        const safeB = bIdx === -1 ? Number.MAX_SAFE_INTEGER : bIdx
        if (safeA !== safeB) return safeA - safeB
        return (b.createdAt || 0) - (a.createdAt || 0)
      })
    }
    if (sortMode === 'oldest') {
      return entries.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
    }
    return entries.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
  }, [filteredComplaints, sortMode])

  const getNextStatus = (status) => {
    const idx = STATUS_FLOW.indexOf(status)
    return idx >= 0 && idx < STATUS_FLOW.length - 1 ? STATUS_FLOW[idx + 1] : null
  }

  const handleNotesChange = (id, value) => {
    setReviewNotes(prev => ({ ...prev, [id]: value }))
  }

  const advanceStatus = (complaint, targetStatus) => {
    if (!targetStatus || complaint.status === targetStatus) return
    const notes = (reviewNotes[complaint.id] || '').trim()
    api.updateComplaintStatus(complaint.id, targetStatus, user.id, notes)
    setReviewNotes(prev => ({ ...prev, [complaint.id]: '' }))
    refreshComplaints()
  }

  const reopenComplaint = (complaint) => {
    const notes = (reviewNotes[complaint.id] || '').trim()
    api.updateComplaintStatus(complaint.id, 'Pending', user.id, notes)
    setReviewNotes(prev => ({ ...prev, [complaint.id]: '' }))
    refreshComplaints()
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-gray-900">Review Complaints</h2>

      <div className="bg-white shadow rounded-lg p-4 grid gap-4 md:grid-cols-3">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Search by ID</label>
          <input
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            placeholder="e.g. complaint-hall-ash-1"
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Filter by Status</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All statuses</option>
            <option value="Pending">Pending</option>
            <option value="Working">Working</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <div className="flex flex-col">
          <label className="text-sm font-medium text-gray-700 mb-1">Sort Order</label>
          <select
            value={sortMode}
            onChange={e => setSortMode(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="status">Status (Pending → Resolved)</option>
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
          </select>
        </div>
      </div>

      {sortedComplaints.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">No complaints to review.</p>
        </div>
      ) : (
        sortedComplaints.map(complaint => {
          const nextStatus = getNextStatus(complaint.status)
          return (
            <ComplaintCard
              key={complaint.id}
              complaint={complaint}
              extraContent={
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Action Notes</label>
                    <textarea
                      value={reviewNotes[complaint.id] || ''}
                      onChange={e => handleNotesChange(complaint.id, e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Summarize the action you are taking..."
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {nextStatus && (
                      <button
                        onClick={() => advanceStatus(complaint, nextStatus)}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        Mark as {nextStatus}
                      </button>
                    )}
                    {complaint.status !== 'Pending' && (
                      <button
                        onClick={() => reopenComplaint(complaint)}
                        className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                      >
                        Reopen (set to Pending)
                      </button>
                    )}
                  </div>
                </div>
              }
            />
          )
        })
      )}
    </div>
  )
}

function ComplaintCard({ complaint, extraContent }) {
  const [showDetails, setShowDetails] = useState(false)
  const student = api.getUserById(complaint.userId)
  const reviewer = complaint.reviewedBy ? api.getUserById(complaint.reviewedBy) : null
  const description = complaint.body || complaint.description || 'No description provided.'
  const createdAt = complaint.createdAt ? new Date(complaint.createdAt).toLocaleString() : 'Unknown'
  const updatedAt = complaint.updatedAt ? new Date(complaint.updatedAt).toLocaleString() : null
  const attachments = Array.isArray(complaint.attachments) ? complaint.attachments : []
  const history = Array.isArray(complaint.history)
    ? [...complaint.history].sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0))
    : []

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs font-semibold text-gray-500 tracking-wide">ID: {complaint.id}</div>
          <h3 className="text-lg font-semibold text-gray-900">{complaint.title || 'Complaint'}</h3>
          <div className="text-sm text-gray-500">
            Filed by: {student?.name || 'Unknown'} • {createdAt}
          </div>
          <p className="text-gray-700 line-clamp-3 md:line-clamp-2">{description}</p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_BADGES[complaint.status] || 'bg-gray-100 text-gray-800'}`}>
            {complaint.status || 'Pending'}
          </span>
          <button
            onClick={() => setShowDetails(prev => !prev)}
            className="text-sm font-medium text-blue-600 hover:text-blue-700"
          >
            {showDetails ? 'Hide details' : 'View details'}
          </button>
        </div>
      </div>

      {showDetails && (
        <div className="mt-5 border-t pt-4 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-1">Full Description</h4>
            <p className="text-gray-700 leading-relaxed whitespace-pre-line">{description}</p>
          </div>

          {attachments.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-1">Attachments</h4>
              <ul className="list-disc list-inside text-sm text-blue-600">
                {attachments.map(file => (
                  <li key={file}>{file}</li>
                ))}
              </ul>
            </div>
          )}

          {updatedAt && (
            <div className="text-sm text-gray-500">Last updated: {updatedAt}</div>
          )}

          {complaint.reviewNotes && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
              <div className="text-sm font-semibold text-blue-900 mb-1">
                Response from {reviewer?.name || 'Hall administration'}
              </div>
              <p className="text-sm text-blue-900 whitespace-pre-line">{complaint.reviewNotes}</p>
            </div>
          )}

          {history.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Status Timeline</h4>
              <ul className="space-y-2">
                {history.map((entry, idx) => {
                  const actor = entry.actorId ? api.getUserById(entry.actorId) : null
                  const timestamp = entry.timestamp ? new Date(entry.timestamp).toLocaleString() : 'Unknown'
                  return (
                    <li key={`${complaint.id}-history-${idx}`} className="bg-gray-50 rounded-lg px-3 py-2 text-sm text-gray-700">
                      <div className="font-medium">{entry.status}</div>
                      <div className="text-xs text-gray-500">{timestamp} • {actor?.name || 'System'}</div>
                      {entry.notes && <div className="mt-1 text-gray-600 whitespace-pre-line">{entry.notes}</div>}
                    </li>
                  )
                })}
              </ul>
            </div>
          )}

          {extraContent && (
            <div className="bg-gray-100 rounded-lg p-4 space-y-3">
              {extraContent}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
