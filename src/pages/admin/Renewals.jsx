import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import * as api from '../../lib/mockApi.js'

const STATUS_COLORS = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Approved: 'bg-green-100 text-green-700',
  Rejected: 'bg-red-100 text-red-700'
}

export default function Renewals() {
  const { user } = useAuth()
  const hallId = user?.hallId ?? null
  const [decisionNotes, setDecisionNotes] = useState('')
  const [refreshFlag, setRefreshFlag] = useState(0)

  const renewals = useMemo(() => {
    const list = api.listRenewals(hallId ? { hallId } : {})
    return list
      .slice()
      .sort((a, b) => {
        if (a.status === b.status) {
          return (b.requestedAt || 0) - (a.requestedAt || 0)
        }
        if (a.status === 'Pending') return -1
        if (b.status === 'Pending') return 1
        if (a.status === 'Approved') return -1
        if (b.status === 'Approved') return 1
        return 0
      })
  }, [hallId, refreshFlag])

  const visibleRenewals = renewals.slice(0, 3)
  const [selectedId, setSelectedId] = useState(() => visibleRenewals[0]?.id ?? null)
  const selectedRenewal = visibleRenewals.find(r => r.id === selectedId) || null

  useEffect(() => {
    if (!visibleRenewals.some(r => r.id === selectedId)) {
      const fallbackId = visibleRenewals[0]?.id ?? null
      setSelectedId(fallbackId)
      setDecisionNotes('')
    }
  }, [visibleRenewals, selectedId])

  const handleSelect = (id) => {
    setSelectedId(id)
    setDecisionNotes('')
  }

  const handleDecision = (status) => {
    if (!selectedRenewal) return
    api.updateRenewal(selectedRenewal.id, status, user.id, decisionNotes.trim())
    setDecisionNotes('')
    setRefreshFlag(flag => flag + 1)
  }

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
      <div className="bg-white border rounded-lg shadow-sm">
        <div className="border-b px-4 py-3">
          <h2 className="text-lg font-semibold">Renewal Requests</h2>
          <p className="text-xs text-gray-500">Showing the three most recent requests for your hall.</p>
        </div>
        <div className="divide-y">
          {visibleRenewals.length === 0 ? (
            <div className="px-4 py-6 text-sm text-gray-500">No renewal requests available.</div>
          ) : (
            visibleRenewals.map(request => (
              <button
                key={request.id}
                onClick={() => handleSelect(request.id)}
                className={`w-full text-left px-4 py-3 transition ${selectedId === request.id ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="text-sm font-semibold text-gray-800">{api.getUserById(request.userId)?.name || request.userId}</div>
                    <div className="text-xs text-gray-500">{new Date(request.requestedAt).toLocaleString()}</div>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-2xs font-semibold uppercase tracking-wide ${STATUS_COLORS[request.status] || 'bg-gray-100 text-gray-700'}`}>
                    {request.status}
                  </span>
                </div>
                <p className="mt-2 line-clamp-2 text-xs text-gray-600">{request.reason}</p>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm p-6">
        {selectedRenewal ? (
          <div className="space-y-5">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Application details</h3>
              <p className="text-sm text-gray-500">Review supporting information before making a decision.</p>
            </div>

            <section className="space-y-2 text-sm">
              <h4 className="font-semibold text-gray-700">Applicant</h4>
              <p className="text-gray-700">{api.getUserById(selectedRenewal.userId)?.name || selectedRenewal.userId}</p>
              <p className="text-gray-500">Request submitted on {new Date(selectedRenewal.requestedAt).toLocaleString()}</p>
            </section>

            <section className="space-y-2 text-sm">
              <h4 className="font-semibold text-gray-700">Reason</h4>
              <p className="rounded border border-gray-200 bg-gray-50 p-3 text-gray-700 whitespace-pre-line">{selectedRenewal.reason}</p>
            </section>

            {selectedRenewal.proofDocuments?.length > 0 && (
              <section className="space-y-2 text-sm">
                <h4 className="font-semibold text-gray-700">Supporting Documents</h4>
                <ul className="list-disc list-inside text-gray-700">
                  {selectedRenewal.proofDocuments.map(doc => (
                    <li key={doc}>{doc}</li>
                  ))}
                </ul>
              </section>
            )}

            {selectedRenewal.reviewNotes && selectedRenewal.status !== 'Pending' && (
              <section className="space-y-2 text-sm">
                <h4 className="font-semibold text-gray-700">Previous Decision Notes</h4>
                <p className="rounded border border-gray-200 bg-gray-50 p-3 text-gray-700 whitespace-pre-line">{selectedRenewal.reviewNotes}</p>
              </section>
            )}

            <section className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Decision</h4>
              <textarea
                value={decisionNotes}
                onChange={e => setDecisionNotes(e.target.value)}
                rows={3}
                className="w-full rounded border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
                placeholder="Optional: leave a note explaining your decision."
              />
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => handleDecision('Approved')}
                  disabled={selectedRenewal.status === 'Approved'}
                  className={`px-4 py-2 rounded text-sm font-medium shadow-sm ${selectedRenewal.status === 'Approved' ? 'bg-green-100 text-green-600 cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                >
                  Accept Renewal
                </button>
                <button
                  onClick={() => handleDecision('Rejected')}
                  disabled={selectedRenewal.status === 'Rejected'}
                  className={`px-4 py-2 rounded text-sm font-medium shadow-sm ${selectedRenewal.status === 'Rejected' ? 'bg-red-100 text-red-600 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700'}`}
                >
                  Reject Renewal
                </button>
              </div>
            </section>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-gray-500">
            Select a renewal request to view the details.
          </div>
        )}
      </div>
    </div>
  )
}
