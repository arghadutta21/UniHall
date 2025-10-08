import React from 'react'
import { useNavigate } from 'react-router-dom'
import DynamicFormRenderer from '../../components/DynamicFormRenderer.jsx'

const demoForm = {
  name: 'Demo Admission Form',
  schema: [
    { id: 'fullName', label: 'Full Name', type: 'text', required: true },
    { id: 'studentId', label: 'Student ID', type: 'text', required: true },
    { id: 'sscGpa', label: 'SSC GPA', type: 'number', required: true, score: 30 },
    { id: 'quota', label: 'Quota Category', type: 'dropdown', options: ['None', 'Freedom Fighter', 'Tribal'], score: 10 },
    {
      id: 'activities',
      label: 'Co-curricular Activities',
      type: 'checkbox',
      options: ['Debate Club', 'Sports Team', 'Volunteer Work'],
      score: 5
    },
    {
      id: 'document',
      label: 'Proof of Residence',
      type: 'text',
      requiresDocument: true,
      documentLabel: 'Upload residence proof'
    }
  ]
}

export default function FormFill() {
  const nav = useNavigate()

  const submit = ({ data, attachments, score }) => {
    console.table(data)
    console.log('Attachments:', attachments)
    console.log('Calculated score:', score)
    alert('Demo submission captured locally. Backend integration coming soon!')
    nav('/student')
  }

  return (
    <div className="bg-white border rounded-lg p-6 space-y-4">
      <div>
        <h2 className="text-xl font-semibold text-gray-900">{demoForm.name}</h2>
        <p className="text-sm text-gray-600">
          Complete the sample form below to preview how the final student experience will look once the backend is connected.
        </p>
      </div>
      <DynamicFormRenderer schema={demoForm.schema} onSubmit={submit} submitLabel="Submit Demo Form" />
    </div>
  )
}
