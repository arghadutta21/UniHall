import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import * as api from '../../lib/mockApi.js'
import { getHallImage } from '../../lib/hallImages.js'

export default function StudentDashboard() {
  const { user } = useAuth()
  const hallId = user?.hallId
  const hall = hallId ? api.getHallById(hallId) : null
  const apps = api.listApplications({ userId: user.id })
  const notifications = hallId ? api.listNotifications({ hallId }) : api.listNotifications()
  const hasApprovedPaid = apps.some(a => a.status === 'Approved' && a.paymentDone)
  const myRenewals = useMemo(() => api.listRenewals({ userId: user.id }), [user.id])
  const hasActiveRenewal = myRenewals.some(r => r.status === 'Pending' || r.status === 'Approved')
  const [showRenewalForm, setShowRenewalForm] = useState(false)
  const [renewalReason, setRenewalReason] = useState('')
  const [proofDocuments, setProofDocuments] = useState([])

  const handleProofChange = (e) => {
    const files = Array.from(e.target.files || [])
    setProofDocuments(files.map(file => file.name))
  }

  const submitRenewal = (e) => {
    e.preventDefault()
    if (!renewalReason.trim()) {
      alert('Please provide a reason for your renewal request.')
      return
    }

    try {
      api.requestRenewal({
        userId: user.id,
        reason: renewalReason,
        proofDocuments
      })
      alert('Renewal request submitted. You will be notified after review.')
      window.location.reload()
    } catch (err) {
      alert(err.message)
    }
  }
  return (
    <div className="grid gap-6">
      {hall && (
        <div className="relative overflow-hidden rounded-lg border min-h-[140px]">
          <div className="absolute inset-0" style={{ backgroundImage: `url(${getHallImage(hall)})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
          <div className="absolute inset-0 bg-black/40" />
          <div className="relative p-4 text-white">
            <div className="text-sm uppercase tracking-wide">Student • My Hall</div>
            <div className="text-xl font-semibold">{hall.name}</div>
          </div>
        </div>
      )}
      <div className="bg-white border rounded p-4">
        <h2 className="text-lg font-semibold">Welcome, {user.name}</h2>
        <p className="text-sm text-gray-600">Role: Student</p>
        {hallId && (
          <div className="mt-2 text-sm text-gray-700">
            My Hall: {api.getHallById(hallId)?.name}
          </div>
        )}
      </div>
      <div className="grid sm:grid-cols-2 gap-6">
        <div className="bg-white border rounded p-4">
          <h3 className="font-medium mb-2">Admission</h3>
          <p className="text-sm text-gray-600 mb-3">Fill the latest form to apply for a seat.</p>
          <Link to="/student/form" className="text-brand-700 text-sm">Go to form →</Link>
        </div>
        <div className="bg-white border rounded p-4">
          <h3 className="font-medium mb-2">Complaints</h3>
          <p className="text-sm text-gray-600 mb-3">File or view your hall complaints.</p>
          <Link to="/complaints" className="text-brand-700 text-sm">Go to complaints →</Link>
        </div>
        <div className="bg-white border rounded p-4">
          <h3 className="font-medium mb-2">My Applications</h3>
          {apps.length === 0 ? (
            <p className="text-sm text-gray-600">No applications yet.</p>
          ) : (
            <ul className="text-sm list-disc pl-5">
              {apps.map(a => (
                <li key={a.id}>{new Date(a.createdAt).toLocaleString()} – <span className="font-medium">{a.status}</span> {a.paymentDone ? '(Paid)' : '(Unpaid)'}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <div className="bg-white border rounded p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-medium">Renewal</h3>
            <p className="text-sm text-gray-600">Request continued accommodation for the upcoming term.</p>
          </div>
          {hasApprovedPaid && !hasActiveRenewal && !showRenewalForm && (
            <button
              onClick={() => setShowRenewalForm(true)}
              className="px-3 py-2 bg-brand-600 text-white rounded text-sm"
            >
              Apply for Renewal
            </button>
          )}
        </div>

        {!hasApprovedPaid && (
          <p className="text-sm text-gray-600">Renewal is available after your admission is approved and payment is confirmed.</p>
        )}

        {hasApprovedPaid && hasActiveRenewal && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            Your renewal request is currently under review. You will be notified once a decision is made.
          </div>
        )}

        {hasApprovedPaid && !hasActiveRenewal && showRenewalForm && (
          <form onSubmit={submitRenewal} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Renewal *</label>
              <textarea
                value={renewalReason}
                onChange={e => setRenewalReason(e.target.value)}
                rows={4}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="Explain why you need to stay in the hall for another term."
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Supporting Documents</label>
              <input
                type="file"
                multiple
                onChange={handleProofChange}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              />
              {proofDocuments.length > 0 && (
                <p className="mt-1 text-xs text-gray-500">Attached: {proofDocuments.join(', ')}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">Add any letters or evidence supporting your request (PDF/JPG).</p>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowRenewalForm(false)
                  setRenewalReason('')
                  setProofDocuments([])
                }}
                className="px-3 py-2 text-sm rounded border border-gray-300 text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-2 bg-brand-600 text-white rounded text-sm"
              >
                Submit Request
              </button>
            </div>
          </form>
        )}

        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-gray-700">Renewal History</h4>
          {myRenewals.length === 0 ? (
            <p className="text-sm text-gray-500">No renewal requests submitted yet.</p>
          ) : (
            <ul className="space-y-2 text-sm">
              {myRenewals
                .slice()
                .sort((a, b) => (b.requestedAt || 0) - (a.requestedAt || 0))
                .map(r => (
                  <li key={r.id} className="rounded border border-gray-200 p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium">{new Date(r.requestedAt).toLocaleString()}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${r.status === 'Approved' ? 'bg-green-100 text-green-700' : r.status === 'Rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-800'}`}>
                        {r.status}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">{r.reason}</p>
                    {Array.isArray(r.proofDocuments) && r.proofDocuments.length > 0 && (
                      <p className="mt-1 text-xs text-gray-500">Documents: {r.proofDocuments.join(', ')}</p>
                    )}
                    {r.reviewNotes && (
                      <p className="mt-2 text-xs text-gray-500">Admin note: {r.reviewNotes}</p>
                    )}
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
      <div className="bg-white border rounded p-4">
        <h3 className="font-medium mb-2">Notifications</h3>
        <ul className="text-sm list-disc pl-5">
          {notifications.map(n => (
            <li key={n.id}><span className="font-medium">{n.title}</span> – {n.body}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}
