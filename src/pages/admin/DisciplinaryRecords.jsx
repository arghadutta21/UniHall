import React, { useState } from 'react'

const initialRecords = [
  {
    id: 'disc-1',
    student: {
      name: 'Karim Ahmed',
      studentId: 'MUH-2021-024',
      email: 'karim.ahmed@example.com'
    },
    offenseType: 'Noise Violation',
    actionTaken: 'Written Warning',
    severity: 'Minor',
    description: 'Repeated late-night gatherings after quiet hours in the common room.',
    recordedAt: '2025-08-12T00:00:00Z'
  },
  {
    id: 'disc-2',
    student: {
      name: 'Nasreen Begum',
      studentId: 'MUH-2021-057',
      email: 'nasreen.begum@example.com'
    },
    offenseType: 'Unauthorized Guests',
    actionTaken: 'Probation for 2 weeks',
    severity: 'Major',
    description: 'Hosted students from another hall overnight without prior approval.',
    recordedAt: '2025-07-28T00:00:00Z'
  }
]

const severityStyles = {
  Minor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Major: 'bg-orange-100 text-orange-800 border-orange-200',
  Severe: 'bg-red-100 text-red-800 border-red-200'
}

const formatDate = (isoString) => new Date(isoString).toLocaleDateString(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric'
})

const emptyForm = {
  name: '',
  studentId: '',
  email: '',
  offenseType: '',
  severity: 'Minor',
  actionTaken: '',
  description: ''
}

export default function DisciplinaryRecords() {
  const [records, setRecords] = useState(initialRecords)
  const [form, setForm] = useState(emptyForm)

  const handleChange = (field) => (event) => {
    const value = event.target.value
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (!form.name || !form.studentId || !form.offenseType || !form.actionTaken || !form.description) {
      alert('Please complete all required fields.')
      return
    }

    const newRecord = {
      id: `disc-${Date.now()}`,
      student: {
        name: form.name,
        studentId: form.studentId,
        email: form.email || 'N/A'
      },
      offenseType: form.offenseType,
      actionTaken: form.actionTaken,
      severity: form.severity,
      description: form.description,
      recordedAt: new Date().toISOString()
    }

    setRecords(prev => [newRecord, ...prev])
    setForm(emptyForm)
  }

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Disciplinary Records</h1>
        <p className="text-gray-600">
          Log new incidents and keep a quick reference of recent disciplinary actions. Entries are stored only for
          this session so you can walk through the workflow without a backend connection.
        </p>
      </header>

      <section className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Add a record</h2>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Name *</label>
            <input value={form.name} onChange={handleChange('name')} className="w-full border rounded px-3 py-2" placeholder="e.g., Karim Ahmed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student ID *</label>
            <input value={form.studentId} onChange={handleChange('studentId')} className="w-full border rounded px-3 py-2" placeholder="e.g., MUH-2021-024" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Student Email</label>
            <input value={form.email} onChange={handleChange('email')} className="w-full border rounded px-3 py-2" placeholder="Optional contact" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Offense Type *</label>
            <input value={form.offenseType} onChange={handleChange('offenseType')} className="w-full border rounded px-3 py-2" placeholder="e.g., Unauthorized guests" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Severity *</label>
            <select value={form.severity} onChange={handleChange('severity')} className="w-full border rounded px-3 py-2">
              <option value="Minor">Minor</option>
              <option value="Major">Major</option>
              <option value="Severe">Severe</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action Taken *</label>
            <input value={form.actionTaken} onChange={handleChange('actionTaken')} className="w-full border rounded px-3 py-2" placeholder="e.g., Written warning" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
            <textarea value={form.description} onChange={handleChange('description')} rows={4} className="w-full border rounded px-3 py-2" placeholder="Provide a brief summary of the incident" />
          </div>
          <div className="md:col-span-2 flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">Record Incident</button>
            <button type="button" onClick={() => setForm(emptyForm)} className="px-4 py-2 border border-gray-300 rounded text-sm text-gray-700 hover:bg-gray-50">Clear</button>
          </div>
        </form>
      </section>

      <section className="grid gap-4">
        {records.map(record => (
          <article key={record.id} className="bg-white border-2 border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{record.student.name}</h2>
                <p className="text-sm text-gray-600">
                  {record.student.studentId} • {record.student.email}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${severityStyles[record.severity] ?? 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                  {record.severity}
                </span>
                <span className="text-xs text-gray-500">Recorded on {formatDate(record.recordedAt)}</span>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Offense Type</p>
                <p className="text-sm text-gray-900 mt-1">{record.offenseType}</p>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Action Taken</p>
                <p className="text-sm text-gray-900 mt-1">{record.actionTaken}</p>
              </div>
            </div>

            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Description</p>
              <p className="text-sm text-gray-900 mt-1 leading-relaxed">{record.description}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  )
}
