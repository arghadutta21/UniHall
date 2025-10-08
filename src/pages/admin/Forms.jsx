import React, { useMemo, useState } from 'react'
import { useAuth } from '../../context/AuthContext.jsx'
import * as api from '../../lib/mockApi.js'
import FormBuilder from '../../components/FormBuilder.jsx'

const makeFieldId = () => `fld-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`

const normalizeFieldType = (type) => {
  switch (type) {
    case 'text':
    case 'number':
    case 'date':
    case 'dropdown':
    case 'checkbox':
      return type
    case 'select':
      return 'dropdown'
    default:
      return 'text'
  }
}

const toOptionsArray = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    return value.split(',').map(v => v.trim()).filter(Boolean)
  }
  return []
}

const normalizeField = (field, idx) => {
  const type = normalizeFieldType(field.type)
  const options = (type === 'dropdown' || type === 'checkbox') ? toOptionsArray(field.options) : []
  const optionsText = (type === 'dropdown' || type === 'checkbox')
    ? (typeof field.optionsText === 'string' ? field.optionsText : options.join(', '))
    : ''
  const scoreRaw = Number(field.score ?? 0)
  return {
    id: field.id || makeFieldId(),
    label: field.label || `Field ${idx + 1}`,
    type,
    required: Boolean(field.required),
    options,
    optionsText,
    score: Number.isNaN(scoreRaw) ? 0 : scoreRaw,
    requiresDocument: Boolean(field.requiresDocument ?? field.documentRequired),
    documentLabel: field.documentLabel || field.documentUploadLabel || ''
  }
}

const normalizeForm = (form) => {
  if (!form) return form
  const schemaSource = Array.isArray(form.schema) && form.schema.length
    ? form.schema
    : Array.isArray(form.fields) ? form.fields : []
  const schema = schemaSource.map(normalizeField)
  const name = form.name || form.title || 'Untitled Form'
  return {
    ...form,
    name,
    title: form.title || name,
    schema
  }
}

const prepareFieldForSave = (field) => {
  const { optionsText, ...rest } = field
  const type = normalizeFieldType(rest.type)
  const options = (type === 'dropdown' || type === 'checkbox')
    ? toOptionsArray(optionsText ?? rest.options)
    : []
  const scoreRaw = Number(rest.score ?? 0)
  return {
    ...rest,
    id: rest.id || makeFieldId(),
    type,
    options,
    required: Boolean(rest.required),
    score: Number.isNaN(scoreRaw) ? 0 : scoreRaw,
    requiresDocument: Boolean(rest.requiresDocument),
    documentLabel: rest.documentLabel || ''
  }
}

export default function Forms() {
  const { user } = useAuth()
  const hallId = user?.hallId ?? null
  const [forms, setForms] = useState(() => api.listForms().map(normalizeForm))
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingForm, setEditingForm] = useState(null)

  const hallForms = useMemo(
    () => forms.filter(f => f.hallId === hallId),
    [forms, hallId]
  )

  const refreshForms = () => setForms(api.listForms().map(normalizeForm))

  const publishForm = (formId) => {
    api.setActiveForm(formId, hallId)
    refreshForms()
  }

  const unpublishForm = (formId) => {
    const form = api.getFormById(formId)
    if (form) {
      api.saveForm({ ...form, active: false })
      refreshForms()
    }
  }

  const editForm = (form) => {
    setEditingForm(form)
    setShowBuilder(true)
  }

  const closeBuilder = () => {
    setShowBuilder(false)
    setEditingForm(null)
  }

  const handleSaveForm = (payload) => {
    const schema = (payload.schema || []).map(prepareFieldForSave)
    const base = {
      ...payload,
      schema,
      hallId,
      name: payload.name?.trim() || payload.title?.trim() || 'Untitled Form',
      title: payload.name?.trim() || payload.title?.trim() || 'Untitled Form',
      createdAt: payload.createdAt || Date.now(),
      active: Boolean(payload.active)
    }
    delete base.fields

    let saved
    if (base.id) {
      const current = api.getFormById(base.id)
      saved = api.saveForm({ ...current, ...base })
    } else {
      saved = api.createForm(base)
    }

    if (base.active && saved) {
      api.setActiveForm(saved.id, hallId)
    }

    refreshForms()
    closeBuilder()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Form Management</h1>
          <p className="text-gray-600">Create and manage admission forms for your hall</p>
        </div>
        <button
          onClick={() => { setEditingForm(null); setShowBuilder(true); }}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Create New Form
        </button>
      </div>

      {showBuilder && (
        <div className="bg-white border-2 border-blue-200 rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingForm ? 'Edit Form (Create New Version)' : 'Form Builder'}
            </h2>
            <button
              onClick={closeBuilder}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕ Close
            </button>
          </div>
          <FormBuilder
            key={editingForm?.id || 'new-form'}
            form={editingForm}
            onSave={handleSaveForm}
          />
        </div>
      )}

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Existing Forms</h2>
        {hallForms.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-600">No forms created yet. Click "Create New Form" to get started.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {hallForms.map(form => (
              <FormCard
                key={form.id}
                form={form}
                onPublish={publishForm}
                onUnpublish={unpublishForm}
                onEdit={editForm}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function FormCard({ form, onPublish, onUnpublish, onEdit }) {
  const applications = api.listApplications({ formId: form.id })
  const schema = Array.isArray(form.schema) ? form.schema : []
  const createdAt = form.createdAt ? new Date(form.createdAt).toLocaleDateString() : '—'
  
  return (
    <div className="bg-white border-2 border-gray-300 rounded-lg p-5">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900">{form.title || form.name}</h3>
            {form.active ? (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">
                Published
              </span>
            ) : (
              <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs font-medium rounded">
                Draft
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600 mt-1">
            Created: {createdAt}
          </div>
          <div className="text-sm text-gray-600">
            {applications.length} application(s) received
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => onEdit(form)}
            className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
          >
            Edit
          </button>
          {form.active ? (
            <button
              onClick={() => onUnpublish(form.id)}
              className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
            >
              Unpublish
            </button>
          ) : (
            <button
              onClick={() => onPublish(form.id)}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              Publish
            </button>
          )}
        </div>
      </div>

      <div className="border-t pt-3 mt-3">
        <div className="text-sm font-medium text-gray-700 mb-2">
          Form Fields ({schema.length}):
        </div>
        <div className="space-y-1">
          {schema.map((field, idx) => (
            <div key={field.id || idx} className="flex items-center justify-between px-3 py-2 bg-blue-50 rounded border border-blue-200">
              <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-sm text-blue-900">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{field.label}</span>
                  <span className="text-xs text-blue-600">({field.type})</span>
                  {field.required && <span className="text-red-600 text-xs">*Required</span>}
                  {field.requiresDocument && <span className="text-purple-600 text-xs">📎 Doc</span>}
                </div>
                {(field.options || []).length > 0 && (
                  <span className="text-xs text-blue-700">Options: {(field.options || []).join(', ')}</span>
                )}
              </div>
              {field.score > 0 && (
                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">
                  Score: {field.score}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
