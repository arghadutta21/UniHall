import React, { useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import * as api from '../../lib/mockApi.js'

export default function Notifications() {
  const { user } = useAuth()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const hallId = user?.hallId
  const list = api.listNotifications({ hallId })
  const canAdmin = user?.role === 'admin'
  
  // Get user-specific notifications if student
  const userNotifications = user?.role === 'student' 
    ? list.filter(n => !n.userId || n.userId === user.id)
    : list
    
  // Get interviews for student
  const interviews = user?.role === 'student'
    ? api.listInterviews({ userId: user.id })
    : []

  const submit = (e) => {
    e.preventDefault()
    api.createNotification(title, body, hallId)
    setTitle(''); setBody('')
    window.location.reload()
  }
  
  const markAsRead = (notifId) => {
    const notifications = api.read('uh_notifications', [])
    const index = notifications.findIndex(n => n.id === notifId)
    if (index !== -1) {
      notifications[index].read = true
      api.write('uh_notifications', notifications)
      window.location.reload()
    }
  }

  return (
    <div className="grid gap-6">
      {/* Interview Schedule for Students */}
      {user?.role === 'student' && interviews.length > 0 && (
        <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
          <h2 className="font-semibold text-lg mb-4 text-blue-900">📅 Your Interview Schedule</h2>
          {interviews.map(interview => (
            <div key={interview.id} className="bg-white border rounded-lg p-4 mb-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">Interview Scheduled</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    <strong>Date:</strong> {interview.interviewDate}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Time:</strong> {interview.interviewTime}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Venue:</strong> {interview.venue}
                  </p>
                </div>
                <span className={`px-3 py-1 rounded text-sm ${
                  interview.status === 'Completed'
                    ? interview.result === 'Selected'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {interview.status}
                  {interview.result && ` - ${interview.result}`}
                </span>
              </div>
              {interview.remarks && (
                <div className="mt-3 p-2 bg-gray-50 rounded">
                  <strong className="text-sm">Remarks:</strong>
                  <p className="text-sm mt-1">{interview.remarks}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    
      <div className="bg-white border rounded p-4">
        <h2 className="font-semibold mb-4 text-lg">📢 Notifications</h2>
        {userNotifications.length === 0 ? (
          <p className="text-gray-500 text-center py-4">No notifications</p>
        ) : (
          <div className="space-y-3">
            {userNotifications.map(n => (
              <div 
                key={n.id}
                className={`p-3 rounded-lg border ${
                  n.read ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {!n.read && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                      <h3 className="font-semibold">{n.title}</h3>
                    </div>
                    <p className="text-sm mt-1">{n.message || n.body}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {!n.read && user?.role === 'student' && (
                    <button
                      onClick={() => markAsRead(n.id)}
                      className="text-xs text-blue-600 hover:underline ml-2"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {canAdmin && (
        <div className="bg-white border rounded p-4">
          <h2 className="font-semibold mb-2">Post Notification</h2>
          <form onSubmit={submit} className="grid gap-2 max-w-lg">
            <input className="border rounded px-3 py-2" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
            <textarea className="border rounded px-3 py-2" rows={3} placeholder="Body" value={body} onChange={e => setBody(e.target.value)} />
            <button className="px-4 py-2 bg-brand-600 text-white rounded w-max">Publish</button>
          </form>
        </div>
      )}
    </div>
  )
}
