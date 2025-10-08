# UniHall Project - Complete Learning Guide (Part 2)

## Table of Contents (Part 2)
10. [Form Management System](#form-management-system)
11. [Dynamic Form Builder](#dynamic-form-builder)
12. [Application Processing](#application-processing)
13. [Complaints Management](#complaints-management)
14. [Waitlist & Renewals](#waitlist--renewals)
15. [Advanced Component Patterns](#advanced-component-patterns)
16. [Event Handling](#event-handling)
17. [GitHub Pages Deployment](#github-pages-deployment)
18. [Performance Optimization](#performance-optimization)
19. [Best Practices & Patterns](#best-practices--patterns)

---

## Form Management System

### Overview

The form system allows admins to create custom application forms with dynamic fields. Each hall can have its own forms.

### Forms Page Architecture

**File: `src/pages/admin/Forms.jsx`**

```jsx
function Forms() {
  const { user } = useAuth()
  const [forms, setForms] = useState([])
  const [showBuilder, setShowBuilder] = useState(false)
  const [editingForm, setEditingForm] = useState(null)
  
  // Load forms on mount
  useEffect(() => {
    loadForms()
  }, [])
  
  const loadForms = () => {
    const allForms = api.listForms({ hallId: user.hallId })
    setForms(allForms)
  }
  
  const handleCreateNew = () => {
    setEditingForm(null)      // Clear any editing form
    setShowBuilder(true)       // Show form builder
  }
  
  const handleEdit = (form) => {
    setEditingForm(form)       // Set form to edit
    setShowBuilder(true)       // Show form builder
  }
  
  const handleFormSaved = () => {
    setShowBuilder(false)      // Hide builder
    setEditingForm(null)       // Clear editing
    loadForms()                // Reload forms list
  }
  
  return (
    <div>
      {showBuilder ? (
        <FormBuilder 
          editingForm={editingForm}
          onSave={handleFormSaved}
          onCancel={() => setShowBuilder(false)}
        />
      ) : (
        <div>
          <button onClick={handleCreateNew}>Create New Form</button>
          
          {/* List of existing forms */}
          {forms.map(form => (
            <div key={form.id}>
              <h3>{form.name}</h3>
              <p>Active: {form.active ? 'Yes' : 'No'}</p>
              <button onClick={() => handleEdit(form)}>Edit</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
```

### Key Concepts Explained

#### 1. **Conditional UI Rendering**
```jsx
{showBuilder ? (
  <FormBuilder />   // Show this when creating/editing
) : (
  <FormsList />     // Show this normally
)}
```

#### 2. **State Lifting**
- Child component (FormBuilder) doesn't navigate
- Parent component (Forms) controls what to show
- Communication via callbacks: `onSave`, `onCancel`

#### 3. **CRUD Operations Pattern**
```jsx
// Create
const handleCreateNew = () => {
  setEditingForm(null)    // null = new form mode
  setShowBuilder(true)
}

// Read (already in loadForms)
const loadForms = () => {
  const data = api.listForms(...)
  setForms(data)
}

// Update
const handleEdit = (form) => {
  setEditingForm(form)    // Pass existing form data
  setShowBuilder(true)
}

// Delete (not implemented, but would be:)
const handleDelete = (formId) => {
  api.deleteForm(formId)
  loadForms()
}
```

---

## Dynamic Form Builder

### The Challenge

Create a form builder where:
1. Admin starts with **zero** fields
2. Admin manually adds each field
3. Each field has: label, type, required, documentRequired, score
4. "Add Field" button appears after each field
5. Can edit existing forms to create new versions

### FormBuilder Component Structure

**File: `src/components/FormBuilder.jsx`**

```jsx
function FormBuilder({ editingForm, onSave, onCancel }) {
  // Form metadata
  const [formName, setFormName] = useState('')
  const [formTitle, setFormTitle] = useState('')
  
  // Fields array - the heart of the builder
  const [fields, setFields] = useState([])
  
  // Load existing form data if editing
  useEffect(() => {
    if (editingForm) {
      setFormName(editingForm.name)
      setFormTitle(editingForm.title)
      setFields(editingForm.fields || [])
    }
  }, [editingForm])
  
  // ... rest of component
}
```

### Adding Fields Dynamically

#### The "Add Field Below" Button Pattern

```jsx
// Add field at specific position
const addFieldAt = (index) => {
  const newField = {
    id: `field-${Date.now()}`,  // Unique ID
    label: '',
    type: 'text',
    required: false,
    documentRequired: false,
    score: 0
  }
  
  // Insert at index + 1 (after clicked field)
  const updated = [...fields]
  updated.splice(index + 1, 0, newField)
  setFields(updated)
}

// Add very first field
const addFirstField = () => {
  const newField = {
    id: `field-${Date.now()}`,
    label: '',
    type: 'text',
    required: false,
    documentRequired: false,
    score: 0
  }
  setFields([newField])
}
```

#### Array.splice() Explained
```javascript
// splice(startIndex, deleteCount, itemsToAdd...)

const arr = ['A', 'B', 'C', 'D']

// Insert 'X' at index 2 (after B)
arr.splice(2, 0, 'X')
// Result: ['A', 'B', 'X', 'C', 'D']

// Remove 1 item at index 1
arr.splice(1, 1)
// Result: ['A', 'C', 'D']

// Replace item at index 2
arr.splice(2, 1, 'Y')
// Result: ['A', 'C', 'Y']
```

### Updating Field Properties

```jsx
const updateField = (fieldId, property, value) => {
  setFields(fields.map(field => 
    field.id === fieldId 
      ? { ...field, [property]: value }  // Update this field
      : field                             // Keep others unchanged
  ))
}

// Usage examples:
updateField('field-123', 'label', 'Full Name')
updateField('field-123', 'type', 'email')
updateField('field-123', 'required', true)
updateField('field-123', 'score', 10)
```

#### Computed Property Names
```javascript
// [property]: value uses variable as key name

const property = 'name'
const value = 'John'

const obj = { [property]: value }
// Result: { name: 'John' }

// Without computed property:
const obj2 = {}
obj2[property] = value
// Same result: { name: 'John' }
```

### Removing Fields

```jsx
const removeField = (fieldId) => {
  setFields(fields.filter(field => field.id !== fieldId))
}
```

#### Array.filter() Explained
```javascript
const numbers = [1, 2, 3, 4, 5]

// Keep only even numbers
const evens = numbers.filter(num => num % 2 === 0)
// Result: [2, 4]

// Remove item with id 3
const items = [
  { id: 1, name: 'A' },
  { id: 2, name: 'B' },
  { id: 3, name: 'C' }
]
const filtered = items.filter(item => item.id !== 3)
// Result: [{ id: 1, name: 'A' }, { id: 2, name: 'B' }]
```

### Rendering the Field Builder

```jsx
return (
  <div className="max-w-4xl mx-auto p-6">
    <h2>{editingForm ? 'Edit Form' : 'Create New Form'}</h2>
    
    {/* Form Metadata */}
    <input
      placeholder="Form Name (internal)"
      value={formName}
      onChange={(e) => setFormName(e.target.value)}
    />
    
    <input
      placeholder="Form Title (shown to students)"
      value={formTitle}
      onChange={(e) => setFormTitle(e.target.value)}
    />
    
    {/* Fields */}
    {fields.length === 0 ? (
      <button onClick={addFirstField}>Add First Field</button>
    ) : (
      <div className="space-y-4">
        {fields.map((field, index) => (
          <FieldEditor
            key={field.id}
            field={field}
            index={index}
            onUpdate={updateField}
            onRemove={removeField}
            onAddBelow={addFieldAt}
          />
        ))}
      </div>
    )}
    
    {/* Save/Cancel */}
    <button onClick={handleSave}>Save Form</button>
    <button onClick={onCancel}>Cancel</button>
  </div>
)
```

### Field Editor Component

```jsx
function FieldEditor({ field, index, onUpdate, onRemove, onAddBelow }) {
  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <div className="flex items-start gap-4">
        {/* Field Number */}
        <span className="font-bold text-lg">{index + 1}.</span>
        
        <div className="flex-1 space-y-3">
          {/* Label Input */}
          <input
            type="text"
            placeholder="Field Label (e.g., Full Name)"
            value={field.label}
            onChange={(e) => onUpdate(field.id, 'label', e.target.value)}
            className="w-full border rounded px-3 py-2"
          />
          
          {/* Type Selector */}
          <select
            value={field.type}
            onChange={(e) => onUpdate(field.id, 'type', e.target.value)}
            className="border rounded px-3 py-2"
          >
            <option value="text">Text</option>
            <option value="email">Email</option>
            <option value="tel">Phone</option>
            <option value="number">Number</option>
            <option value="date">Date</option>
            <option value="textarea">Textarea</option>
            <option value="select">Dropdown</option>
            <option value="file">File Upload</option>
          </select>
          
          {/* Checkboxes */}
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={field.required}
              onChange={(e) => onUpdate(field.id, 'required', e.target.checked)}
            />
            <span>Required</span>
          </label>
          
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={field.documentRequired}
              onChange={(e) => onUpdate(field.id, 'documentRequired', e.target.checked)}
            />
            <span>Document Required</span>
          </label>
          
          {/* Score Input */}
          <div className="flex items-center gap-2">
            <label>Score:</label>
            <input
              type="number"
              value={field.score}
              onChange={(e) => onUpdate(field.id, 'score', parseInt(e.target.value) || 0)}
              className="w-20 border rounded px-2 py-1"
            />
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => onAddBelow(index)}
              className="bg-blue-500 text-white px-3 py-1 rounded text-sm"
            >
              ➕ Add Field Below
            </button>
            
            <button
              onClick={() => onRemove(field.id)}
              className="bg-red-500 text-white px-3 py-1 rounded text-sm"
            >
              🗑️ Remove
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
```

### Saving the Form

```jsx
const handleSave = () => {
  // Validation
  if (!formName.trim()) {
    alert('Please enter form name')
    return
  }
  
  if (fields.length === 0) {
    alert('Please add at least one field')
    return
  }
  
  // Check all fields have labels
  const emptyFields = fields.filter(f => !f.label.trim())
  if (emptyFields.length > 0) {
    alert('All fields must have labels')
    return
  }
  
  // Create form object
  const formData = {
    name: formName,
    title: formTitle,
    fields: fields,
    active: true,
    hallId: user.hallId
  }
  
  if (editingForm) {
    // Editing creates a new version
    api.createForm(formData)
  } else {
    // Creating new form
    api.createForm(formData)
  }
  
  onSave()  // Tell parent to refresh
}
```

### Mock API - Save Form

**File: `src/lib/mockApi.js`**

```javascript
export function createForm(data) {
  const forms = read(KEYS.forms, [])
  
  const newForm = {
    id: `form-${Date.now()}`,
    name: data.name,
    title: data.title,
    fields: data.fields,
    active: data.active,
    hallId: data.hallId,
    createdAt: new Date().toISOString()
  }
  
  forms.push(newForm)
  write(KEYS.forms, forms)
  
  return newForm
}

export function listForms({ hallId, activeOnly = false }) {
  const forms = read(KEYS.forms, [])
  
  let filtered = forms.filter(f => f.hallId === hallId)
  
  if (activeOnly) {
    filtered = filtered.filter(f => f.active)
  }
  
  // Sort by creation date (newest first)
  return filtered.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )
}
```

---

## Application Processing

### Student Submits Application

**File: `src/pages/student/ApplyForm.jsx`**

```jsx
function ApplyForm() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [forms, setForms] = useState([])
  const [selectedForm, setSelectedForm] = useState(null)
  const [formData, setFormData] = useState({})
  
  // Load active forms
  useEffect(() => {
    const activeForms = api.listForms({ 
      hallId: user.hallId, 
      activeOnly: true 
    })
    setForms(activeForms)
  }, [])
  
  const handleFormSelect = (form) => {
    setSelectedForm(form)
    // Initialize form data with empty values
    const initialData = {}
    form.fields.forEach(field => {
      initialData[field.id] = ''
    })
    setFormData(initialData)
  }
  
  const handleFieldChange = (fieldId, value) => {
    setFormData({ ...formData, [fieldId]: value })
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    // Validate required fields
    const missingFields = selectedForm.fields.filter(field => 
      field.required && !formData[field.id]
    )
    
    if (missingFields.length > 0) {
      alert('Please fill all required fields')
      return
    }
    
    // Submit application
    api.createApplication({
      userId: user.id,
      formId: selectedForm.id,
      hallId: user.hallId,
      data: formData
    })
    
    alert('Application submitted successfully!')
    navigate('/student')
  }
  
  return (
    <div>
      {!selectedForm ? (
        <div>
          <h2>Select Application Form</h2>
          {forms.map(form => (
            <button key={form.id} onClick={() => handleFormSelect(form)}>
              {form.title}
            </button>
          ))}
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <h2>{selectedForm.title}</h2>
          
          {selectedForm.fields.map(field => (
            <div key={field.id}>
              <label>
                {field.label}
                {field.required && <span className="text-red-500">*</span>}
              </label>
              
              {field.type === 'textarea' ? (
                <textarea
                  value={formData[field.id] || ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  required={field.required}
                />
              ) : field.type === 'file' ? (
                <input
                  type="file"
                  onChange={(e) => handleFieldChange(field.id, e.target.files[0])}
                  required={field.required}
                />
              ) : (
                <input
                  type={field.type}
                  value={formData[field.id] || ''}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                  required={field.required}
                />
              )}
            </div>
          ))}
          
          <button type="submit">Submit Application</button>
        </form>
      )}
    </div>
  )
}
```

### Admin Reviews Applications

**File: `src/pages/admin/Applications.jsx`**

```jsx
function Applications() {
  const { user } = useAuth()
  const [applications, setApplications] = useState([])
  const [filterStatus, setFilterStatus] = useState('all')
  
  useEffect(() => {
    loadApplications()
  }, [])
  
  const loadApplications = () => {
    const apps = api.listApplications({ hallId: user.hallId })
    setApplications(apps)
  }
  
  const handleStatusChange = (appId, newStatus) => {
    api.updateApplication(appId, { status: newStatus })
    loadApplications()
  }
  
  const handlePaymentChange = (appId, paid) => {
    api.updateApplication(appId, { paymentDone: paid })
    loadApplications()
  }
  
  // Filter applications
  const filteredApps = filterStatus === 'all' 
    ? applications
    : applications.filter(app => app.status === filterStatus)
  
  return (
    <div>
      <h2>Applications</h2>
      
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setFilterStatus('all')}>All</button>
        <button onClick={() => setFilterStatus('Pending')}>Pending</button>
        <button onClick={() => setFilterStatus('Approved')}>Approved</button>
        <button onClick={() => setFilterStatus('Rejected')}>Rejected</button>
      </div>
      
      {/* Applications List */}
      {filteredApps.length === 0 ? (
        <p>No applications found</p>
      ) : (
        <div className="space-y-4">
          {filteredApps.map(app => (
            <ApplicationCard
              key={app.id}
              app={app}
              onStatusChange={handleStatusChange}
              onPaymentChange={handlePaymentChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ApplicationCard({ app, onStatusChange, onPaymentChange }) {
  const [userData, setUserData] = useState(null)
  const [formData, setFormData] = useState(null)
  
  // Load user and form data
  useEffect(() => {
    const user = api.getUserById(app.userId)
    const form = api.getFormById(app.formId)
    setUserData(user)
    setFormData(form)
  }, [app.userId, app.formId])
  
  if (!userData || !formData) return <div>Loading...</div>
  
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-bold">{userData.name}</h3>
          <p className="text-sm text-gray-600">{userData.email}</p>
          <p className="text-sm">Form: {formData.name}</p>
        </div>
        
        <div className="text-right">
          <span className={`px-2 py-1 rounded text-sm ${
            app.status === 'Approved' ? 'bg-green-100 text-green-800' :
            app.status === 'Rejected' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {app.status}
          </span>
        </div>
      </div>
      
      {/* Application Data */}
      <div className="mt-4 space-y-2">
        {formData.fields.map(field => (
          <div key={field.id}>
            <span className="font-semibold">{field.label}:</span>
            <span className="ml-2">{app.data[field.id] || 'N/A'}</span>
          </div>
        ))}
      </div>
      
      {/* Actions */}
      <div className="mt-4 flex gap-2">
        <button
          onClick={() => onStatusChange(app.id, 'Approved')}
          className="bg-green-500 text-white px-3 py-1 rounded"
        >
          Approve
        </button>
        
        <button
          onClick={() => onStatusChange(app.id, 'Rejected')}
          className="bg-red-500 text-white px-3 py-1 rounded"
        >
          Reject
        </button>
        
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={app.paymentDone}
            onChange={(e) => onPaymentChange(app.id, e.target.checked)}
          />
          <span>Payment Done</span>
        </label>
      </div>
    </div>
  )
}
```

### Mock API - Applications

**File: `src/lib/mockApi.js`**

```javascript
export function createApplication(data) {
  const apps = read(KEYS.applications, [])
  
  const newApp = {
    id: `app-${Date.now()}`,
    userId: data.userId,
    formId: data.formId,
    hallId: data.hallId,
    data: data.data,
    status: 'Pending',
    paymentDone: false,
    createdAt: new Date().toISOString()
  }
  
  apps.push(newApp)
  write(KEYS.applications, apps)
  
  return newApp
}

export function listApplications({ hallId, userId, status }) {
  const apps = read(KEYS.applications, [])
  
  let filtered = apps
  
  if (hallId) {
    filtered = filtered.filter(a => a.hallId === hallId)
  }
  
  if (userId) {
    filtered = filtered.filter(a => a.userId === userId)
  }
  
  if (status) {
    filtered = filtered.filter(a => a.status === status)
  }
  
  return filtered.sort((a, b) => 
    new Date(b.createdAt) - new Date(a.createdAt)
  )
}

export function updateApplication(appId, updates) {
  const apps = read(KEYS.applications, [])
  
  const index = apps.findIndex(a => a.id === appId)
  if (index !== -1) {
    apps[index] = { ...apps[index], ...updates }
    write(KEYS.applications, apps)
    return apps[index]
  }
  
  throw new Error('Application not found')
}
```

---

## Complaints Management

### Student Files Complaint

**File: `src/pages/shared/Complaints.jsx`**

```jsx
function Complaints() {
  const { user } = useAuth()
  const [complaints, setComplaints] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  
  useEffect(() => {
    loadComplaints()
  }, [])
  
  const loadComplaints = () => {
    if (user.role === 'student') {
      // Students see only their complaints
      const myComplaints = api.listComplaints({ userId: user.id })
      setComplaints(myComplaints)
    } else {
      // Admin/staff see all complaints for their hall
      const hallComplaints = api.listComplaints({ hallId: user.hallId })
      setComplaints(hallComplaints)
    }
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    
    api.createComplaint({
      userId: user.id,
      hallId: user.hallId,
      subject,
      description
    })
    
    setSubject('')
    setDescription('')
    setShowForm(false)
    loadComplaints()
  }
  
  const handleResolve = (complaintId, response) => {
    api.updateComplaint(complaintId, {
      status: 'Resolved',
      response,
      resolvedAt: new Date().toISOString()
    })
    loadComplaints()
  }
  
  return (
    <div>
      <h2>Complaints</h2>
      
      {user.role === 'student' && (
        <button onClick={() => setShowForm(!showForm)}>
          File New Complaint
        </button>
      )}
      
      {showForm && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 border rounded">
          <input
            type="text"
            placeholder="Subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
          
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
          
          <button type="submit">Submit</button>
        </form>
      )}
      
      {/* Complaints List */}
      <div className="space-y-4">
        {complaints.map(complaint => (
          <ComplaintCard
            key={complaint.id}
            complaint={complaint}
            isAdmin={user.role !== 'student'}
            onResolve={handleResolve}
          />
        ))}
      </div>
    </div>
  )
}

function ComplaintCard({ complaint, isAdmin, onResolve }) {
  const [response, setResponse] = useState('')
  const [showResolveForm, setShowResolveForm] = useState(false)
  
  const handleResolve = () => {
    if (!response.trim()) {
      alert('Please enter a response')
      return
    }
    onResolve(complaint.id, response)
    setShowResolveForm(false)
  }
  
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex justify-between">
        <h3 className="font-bold">{complaint.subject}</h3>
        <span className={`px-2 py-1 rounded text-sm ${
          complaint.status === 'Resolved' 
            ? 'bg-green-100 text-green-800'
            : 'bg-yellow-100 text-yellow-800'
        }`}>
          {complaint.status}
        </span>
      </div>
      
      <p className="mt-2 text-gray-700">{complaint.description}</p>
      
      {complaint.response && (
        <div className="mt-3 p-3 bg-gray-50 rounded">
          <p className="font-semibold text-sm">Response:</p>
          <p className="text-gray-700">{complaint.response}</p>
        </div>
      )}
      
      {isAdmin && complaint.status !== 'Resolved' && (
        <div className="mt-3">
          {showResolveForm ? (
            <div>
              <textarea
                placeholder="Enter response..."
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                className="w-full border rounded p-2"
              />
              <button onClick={handleResolve}>Resolve</button>
              <button onClick={() => setShowResolveForm(false)}>Cancel</button>
            </div>
          ) : (
            <button onClick={() => setShowResolveForm(true)}>
              Resolve Complaint
            </button>
          )}
        </div>
      )}
    </div>
  )
}
```

### Demo Complaints Seeding

**File: `src/lib/mockApi.js`**

```javascript
export function ensureSeedData() {
  // ... other seeds ...
  
  // Seed complaints
  const existingComplaints = read(KEYS.complaints, [])
  
  // Check if array is empty (not just if key doesn't exist)
  if (existingComplaints.length === 0) {
    const complaints = []
    const halls = read(KEYS.halls, [])
    const users = read(KEYS.users, [])
    
    halls.forEach(hall => {
      // Find a student for this hall
      const student = users.find(u => 
        u.role === 'student' && u.hallId === hall.id
      )
      
      if (student) {
        // Complaint 1: Resolved
        complaints.push({
          id: `complaint-${hall.id}-1`,
          userId: student.id,
          hallId: hall.id,
          subject: 'Water Supply Issue',
          description: 'Water supply has been irregular for the past week.',
          status: 'Resolved',
          response: 'Water pump has been fixed. Supply should be normal now.',
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          resolvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        })
        
        // Complaint 2: In Progress
        complaints.push({
          id: `complaint-${hall.id}-2`,
          userId: student.id,
          hallId: hall.id,
          subject: 'Electricity Problem in Room 305',
          description: 'Power socket not working properly.',
          status: 'In Progress',
          response: 'Electrician has been notified. Will be fixed by tomorrow.',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          resolvedAt: null
        })
      }
    })
    
    write(KEYS.complaints, complaints)
  }
}
```

---

## Waitlist & Renewals

### Waitlist Management

**File: `src/pages/admin/Waitlist.jsx`**

```jsx
function Waitlist() {
  const { user } = useAuth()
  const [waitlist, setWaitlist] = useState([])
  
  useEffect(() => {
    loadWaitlist()
  }, [])
  
  const loadWaitlist = () => {
    const list = api.listWaitlist({ hallId: user.hallId })
    setWaitlist(list)
  }
  
  const handleRemove = (entryId) => {
    if (confirm('Remove this student from waitlist?')) {
      api.removeFromWaitlist(entryId)
      loadWaitlist()
    }
  }
  
  return (
    <div>
      <h2>Waiting List</h2>
      
      {waitlist.length === 0 ? (
        <p>No students in waiting list</p>
      ) : (
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100">
              <th>Position</th>
              <th>Student Name</th>
              <th>Student ID</th>
              <th>Department</th>
              <th>Session</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Added On</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {waitlist.map((entry, index) => (
              <tr key={entry.id}>
                <td>{index + 1}</td>
                <td>{entry.studentName}</td>
                <td>{entry.studentId}</td>
                <td>{entry.department}</td>
                <td>{entry.session}</td>
                <td>{entry.email}</td>
                <td>{entry.phone}</td>
                <td>{new Date(entry.addedAt).toLocaleDateString()}</td>
                <td>
                  <button onClick={() => handleRemove(entry.id)}>
                    Remove
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
```

### Renewals System

**File: `src/pages/admin/Renewals.jsx`**

```jsx
function Renewals() {
  const { user } = useAuth()
  const [renewals, setRenewals] = useState([])
  
  useEffect(() => {
    loadRenewals()
  }, [])
  
  const loadRenewals = () => {
    const list = api.listRenewals({ hallId: user.hallId })
    setRenewals(list)
  }
  
  const handleApprove = (renewalId) => {
    api.updateRenewal(renewalId, {
      status: 'Approved',
      approvedAt: new Date().toISOString()
    })
    loadRenewals()
  }
  
  const handleReject = (renewalId) => {
    api.updateRenewal(renewalId, {
      status: 'Rejected',
      approvedAt: new Date().toISOString()
    })
    loadRenewals()
  }
  
  return (
    <div>
      <h2>Renewal Requests</h2>
      
      {renewals.length === 0 ? (
        <p>No renewal requests</p>
      ) : (
        <div className="space-y-4">
          {renewals.map(renewal => (
            <RenewalCard
              key={renewal.id}
              renewal={renewal}
              onApprove={handleApprove}
              onReject={handleReject}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function RenewalCard({ renewal, onApprove, onReject }) {
  const [userData, setUserData] = useState(null)
  
  useEffect(() => {
    const user = api.getUserById(renewal.userId)
    setUserData(user)
  }, [renewal.userId])
  
  if (!userData) return <div>Loading...</div>
  
  return (
    <div className="bg-white border rounded-lg p-4">
      <div className="flex justify-between">
        <div>
          <h3 className="font-bold">{userData.name}</h3>
          <p>{userData.email}</p>
        </div>
        <span className={`px-2 py-1 rounded text-sm h-fit ${
          renewal.status === 'Approved' ? 'bg-green-100 text-green-800' :
          renewal.status === 'Rejected' ? 'bg-red-100 text-red-800' :
          'bg-yellow-100 text-yellow-800'
        }`}>
          {renewal.status}
        </span>
      </div>
      
      <p className="mt-2 text-sm text-gray-600">
        Requested: {new Date(renewal.requestedAt).toLocaleDateString()}
      </p>
      
      {renewal.status === 'Pending' && (
        <div className="mt-3 flex gap-2">
          <button
            onClick={() => onApprove(renewal.id)}
            className="bg-green-500 text-white px-3 py-1 rounded"
          >
            Approve
          </button>
          <button
            onClick={() => onReject(renewal.id)}
            className="bg-red-500 text-white px-3 py-1 rounded"
          >
            Reject
          </button>
        </div>
      )}
    </div>
  )
}
```

---

## Advanced Component Patterns

### 1. Render Props Pattern

Pass a function as a prop to customize rendering.

```jsx
// DataLoader component
function DataLoader({ url, render }) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    fetch(url)
      .then(res => res.json())
      .then(data => {
        setData(data)
        setLoading(false)
      })
  }, [url])
  
  if (loading) return <div>Loading...</div>
  
  return render(data)  // Call the render function
}

// Usage
<DataLoader 
  url="/api/users"
  render={(users) => (
    <ul>
      {users.map(user => <li key={user.id}>{user.name}</li>)}
    </ul>
  )}
/>
```

### 2. Custom Hooks

Extract reusable logic into custom hooks.

```jsx
// Custom hook for form input
function useInput(initialValue) {
  const [value, setValue] = useState(initialValue)
  
  const handleChange = (e) => {
    setValue(e.target.value)
  }
  
  const reset = () => {
    setValue(initialValue)
  }
  
  return {
    value,
    onChange: handleChange,
    reset
  }
}

// Usage in component
function LoginForm() {
  const email = useInput('')
  const password = useInput('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(email.value, password.value)
    email.reset()
    password.reset()
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input {...email} type="email" />
      <input {...password} type="password" />
      <button type="submit">Login</button>
    </form>
  )
}
```

### 3. Compound Components

Components that work together.

```jsx
// Tabs component
function Tabs({ children }) {
  const [activeTab, setActiveTab] = useState(0)
  
  return (
    <div>
      <div className="flex border-b">
        {children.map((child, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={activeTab === index ? 'border-b-2 border-blue-500' : ''}
          >
            {child.props.label}
          </button>
        ))}
      </div>
      
      <div className="p-4">
        {children[activeTab]}
      </div>
    </div>
  )
}

function Tab({ children }) {
  return <div>{children}</div>
}

// Usage
<Tabs>
  <Tab label="Profile">
    <p>Profile content</p>
  </Tab>
  <Tab label="Settings">
    <p>Settings content</p>
  </Tab>
  <Tab label="Billing">
    <p>Billing content</p>
  </Tab>
</Tabs>
```

### 4. Higher-Order Components (HOC)

Function that takes a component and returns a new component.

```jsx
// HOC for authentication
function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { user } = useAuth()
    const navigate = useNavigate()
    
    useEffect(() => {
      if (!user) {
        navigate('/login')
      }
    }, [user])
    
    if (!user) return <div>Loading...</div>
    
    return <Component {...props} user={user} />
  }
}

// Usage
function Dashboard({ user }) {
  return <h1>Welcome, {user.name}!</h1>
}

export default withAuth(Dashboard)
```

---

## Event Handling

### Synthetic Events

React wraps browser events in **SyntheticEvent** for cross-browser compatibility.

```jsx
function Example() {
  const handleClick = (event) => {
    console.log(event.type)        // 'click'
    console.log(event.target)      // DOM element clicked
    console.log(event.currentTarget)  // Element with handler
    
    event.preventDefault()         // Prevent default behavior
    event.stopPropagation()        // Stop event bubbling
  }
  
  const handleInput = (event) => {
    console.log(event.target.value)  // Current input value
  }
  
  const handleSubmit = (event) => {
    event.preventDefault()  // Prevent form submission
    // Handle form data
  }
  
  return (
    <div>
      <button onClick={handleClick}>Click</button>
      <input onChange={handleInput} />
      <form onSubmit={handleSubmit}>
        <button type="submit">Submit</button>
      </form>
    </div>
  )
}
```

### Event Handler Patterns

```jsx
// 1. Inline arrow function (for simple cases)
<button onClick={() => console.log('clicked')}>Click</button>

// 2. Inline with parameter
<button onClick={() => handleDelete(item.id)}>Delete</button>

// 3. Named function (better performance for complex handlers)
function handleClick() {
  console.log('clicked')
}
<button onClick={handleClick}>Click</button>

// 4. With parameter using bind
<button onClick={handleDelete.bind(null, item.id)}>Delete</button>

// 5. Event object access
<input onChange={(e) => setName(e.target.value)} />

// 6. Destructuring in handler
const handleChange = ({ target: { value } }) => {
  setName(value)
}
<input onChange={handleChange} />
```

### Form Handling Best Practices

```jsx
function ContactForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  })
  
  // Single handler for all inputs
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }
  
  const handleSubmit = (e) => {
    e.preventDefault()
    console.log(formData)
    // Submit logic
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <input
        name="name"
        value={formData.name}
        onChange={handleChange}
      />
      <input
        name="email"
        value={formData.email}
        onChange={handleChange}
      />
      <textarea
        name="message"
        value={formData.message}
        onChange={handleChange}
      />
      <button type="submit">Send</button>
    </form>
  )
}
```

---

## GitHub Pages Deployment

### The Problem with SPAs on GitHub Pages

Single Page Applications (SPAs) use client-side routing. When you refresh on a route like `/admin/forms`, the server looks for a file at that path and returns 404.

### Solution 1: HashRouter

Use `#` in URLs so everything after is client-side only.

**File: `src/main.jsx`**
```jsx
import { HashRouter } from 'react-router-dom'

// Changed from BrowserRouter to HashRouter
<HashRouter>
  <AuthProvider>
    <App />
  </AuthProvider>
</HashRouter>
```

**Result:**
- Homepage: `https://user.github.io/UniHall/#/`
- Login: `https://user.github.io/UniHall/#/login`
- Admin: `https://user.github.io/UniHall/#/admin`

The `#` tells browser not to make server request.

### Solution 2: 404.html Redirect

Create a 404 page that redirects to main app with path info.

**File: `public/404.html`**
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>UniHall</title>
  <script>
    // Store the path
    const path = window.location.pathname.split('/').slice(2).join('/')
    const query = window.location.search
    
    // Redirect to main page with path as query param
    window.location.replace(
      window.location.origin + 
      '/UniHall/?' + 
      (path || '') + 
      (path && query ? '&' : '') + 
      query.slice(1)
    )
  </script>
</head>
<body></body>
</html>
```

**File: `index.html`** (handle redirect)
```html
<script>
  (function() {
    const redirect = sessionStorage.getItem('redirect')
    if (redirect) {
      sessionStorage.removeItem('redirect')
      history.replaceState(null, null, redirect)
    }
  })()
</script>
```

### Vite Configuration for GitHub Pages

**File: `vite.config.js`**
```javascript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/UniHall/',  // Your repo name
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  }
})
```

### Fixing Image Paths for GitHub Pages

**Problem:** Images referenced as `/halls/ASH.jpg` won't work because base is `/UniHall/`.

**Solution:** Use `import.meta.env.BASE_URL`

**File: `src/lib/hallImages.js`**
```javascript
const hallImages = {
  ASH: 'halls/ASH.jpg',
  MUH: 'halls/MUH.jpg',
  // ...
}

export function getHallImage(shortName) {
  const baseUrl = import.meta.env.BASE_URL  // '/UniHall/' on GitHub Pages
  const imagePath = hallImages[shortName] || 'halls/default.jpg'
  return `${baseUrl}${imagePath}`
}

// Result on GitHub Pages:
// getHallImage('ASH') => '/UniHall/halls/ASH.jpg'
```

### Deployment Script

**File: `package.json`**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "gh-pages -d dist"
  },
  "devDependencies": {
    "gh-pages": "^6.0.0"
  }
}
```

**Commands:**
```bash
# Build the app
npm run build

# Deploy to GitHub Pages
npm run deploy
```

The `gh-pages` package:
1. Creates a `gh-pages` branch (if doesn't exist)
2. Copies `dist` folder contents to that branch
3. Pushes to GitHub
4. GitHub serves the site from `gh-pages` branch

### GitHub Repository Settings

1. Go to repository Settings
2. Navigate to Pages section
3. Source: Deploy from branch
4. Branch: `gh-pages` → `/root`
5. Save

Site will be live at: `https://<username>.github.io/<repo-name>/`

---

## Performance Optimization

### 1. React.memo

Prevent unnecessary re-renders of functional components.

```jsx
// Without memo - re-renders even if props unchanged
function ExpensiveComponent({ data }) {
  console.log('Rendering...')
  return <div>{data}</div>
}

// With memo - only re-renders if props change
const ExpensiveComponent = React.memo(({ data }) => {
  console.log('Rendering...')
  return <div>{data}</div>
})

// Custom comparison
const ExpensiveComponent = React.memo(
  ({ data }) => <div>{data}</div>,
  (prevProps, nextProps) => {
    // Return true if props are equal (skip re-render)
    return prevProps.data.id === nextProps.data.id
  }
)
```

### 2. useMemo

Memoize expensive calculations.

```jsx
function ProductList({ products, filter }) {
  // Without useMemo - calculates on every render
  const filtered = products.filter(p => p.category === filter)
  
  // With useMemo - only recalculates when dependencies change
  const filtered = useMemo(() => {
    console.log('Filtering...')
    return products.filter(p => p.category === filter)
  }, [products, filter])  // Dependencies
  
  return (
    <ul>
      {filtered.map(p => <li key={p.id}>{p.name}</li>)}
    </ul>
  )
}
```

### 3. useCallback

Memoize functions to prevent child re-renders.

```jsx
function Parent() {
  const [count, setCount] = useState(0)
  
  // Without useCallback - new function on every render
  const handleClick = () => {
    console.log('clicked')
  }
  
  // With useCallback - same function reference
  const handleClick = useCallback(() => {
    console.log('clicked')
  }, [])  // Empty deps = never changes
  
  return <Child onClick={handleClick} />
}

// Child is memoized, won't re-render if onClick is same reference
const Child = React.memo(({ onClick }) => {
  console.log('Child rendering')
  return <button onClick={onClick}>Click</button>
})
```

### 4. Lazy Loading

Load components only when needed.

```jsx
import { lazy, Suspense } from 'react'

// Instead of: import AdminDashboard from './pages/admin/AdminDashboard'
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const Forms = lazy(() => import('./pages/admin/Forms'))
const Applications = lazy(() => import('./pages/admin/Applications'))

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/forms" element={<Forms />} />
        <Route path="/admin/applications" element={<Applications />} />
      </Routes>
    </Suspense>
  )
}
```

### 5. Virtualization

Render only visible items in long lists.

```jsx
// Without virtualization - renders all 10,000 items
function BigList({ items }) {
  return (
    <div>
      {items.map(item => <ItemCard key={item.id} item={item} />)}
    </div>
  )
}

// With virtualization (using react-window)
import { FixedSizeList } from 'react-window'

function BigList({ items }) {
  return (
    <FixedSizeList
      height={600}
      itemCount={items.length}
      itemSize={100}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <ItemCard item={items[index]} />
        </div>
      )}
    </FixedSizeList>
  )
}
```

---

## Best Practices & Patterns

### 1. Component Organization

```
src/
├── components/          # Reusable UI components
│   ├── Button.jsx
│   ├── Input.jsx
│   └── Modal.jsx
├── pages/              # Route components
│   ├── auth/
│   ├── admin/
│   └── student/
├── context/            # Global state
│   └── AuthContext.jsx
├── hooks/              # Custom hooks
│   ├── useAuth.js
│   └── useLocalStorage.js
├── lib/                # Utilities
│   ├── mockApi.js
│   └── helpers.js
└── constants/          # Constants
    └── config.js
```

### 2. Naming Conventions

```jsx
// Components: PascalCase
function UserProfile() {}

// Variables/functions: camelCase
const userName = 'John'
const getUserData = () => {}

// Constants: UPPER_SNAKE_CASE
const API_URL = 'https://api.example.com'
const MAX_ITEMS = 100

// Boolean variables: is/has prefix
const isLoading = true
const hasError = false
const canEdit = user.role === 'admin'

// Event handlers: handle prefix
const handleClick = () => {}
const handleSubmit = () => {}
const handleChange = () => {}

// State setters: set prefix
const [user, setUser] = useState(null)
const [isOpen, setIsOpen] = useState(false)
```

### 3. Props Destructuring

```jsx
// ❌ Not recommended
function UserCard(props) {
  return (
    <div>
      <h3>{props.user.name}</h3>
      <p>{props.user.email}</p>
    </div>
  )
}

// ✅ Better
function UserCard({ user }) {
  return (
    <div>
      <h3>{user.name}</h3>
      <p>{user.email}</p>
    </div>
  )
}

// ✅ Even better (nested destructuring)
function UserCard({ user: { name, email } }) {
  return (
    <div>
      <h3>{name}</h3>
      <p>{email}</p>
    </div>
  )
}
```

### 4. Default Props

```jsx
// Method 1: Default parameters
function Button({ 
  text = 'Click me', 
  variant = 'primary',
  onClick = () => {} 
}) {
  return <button onClick={onClick}>{text}</button>
}

// Method 2: Destructuring with defaults
function Button(props) {
  const { 
    text = 'Click me',
    variant = 'primary'
  } = props
  
  return <button>{text}</button>
}
```

### 5. Conditional Rendering Patterns

```jsx
function Example({ user, items, loading, error }) {
  // Early return
  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!user) return <div>Not logged in</div>
  
  return (
    <div>
      {/* Ternary for two options */}
      {user.isPremium ? <PremiumBadge /> : <FreeBadge />}
      
      {/* && for showing if true */}
      {items.length > 0 && <ItemsList items={items} />}
      
      {/* || for fallback */}
      {user.name || 'Anonymous'}
      
      {/* Nullish coalescing for fallback (only if null/undefined) */}
      {user.age ?? 18}
      
      {/* Function for complex logic */}
      {(() => {
        if (user.role === 'admin') return <AdminPanel />
        if (user.role === 'staff') return <StaffPanel />
        return <UserPanel />
      })()}
    </div>
  )
}
```

### 6. Error Boundaries

Catch errors in component tree.

```jsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught:', error, errorInfo)
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <div>
          <h2>Something went wrong</h2>
          <details>
            {this.state.error && this.state.error.toString()}
          </details>
        </div>
      )
    }
    
    return this.props.children
  }
}

// Usage
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

### 7. Environment Variables

**File: `.env`**
```
VITE_API_URL=https://api.example.com
VITE_APP_NAME=UniHall
```

**Usage:**
```jsx
const apiUrl = import.meta.env.VITE_API_URL
const appName = import.meta.env.VITE_APP_NAME
const isDev = import.meta.env.DEV
const isProd = import.meta.env.PROD
```

**Note:** In Vite, env vars must start with `VITE_` to be exposed to client.

### 8. Accessibility (a11y)

```jsx
function AccessibleForm() {
  return (
    <form>
      {/* Labels for inputs */}
      <label htmlFor="email">Email:</label>
      <input id="email" type="email" aria-required="true" />
      
      {/* Alt text for images */}
      <img src="logo.png" alt="UniHall Logo" />
      
      {/* Semantic HTML */}
      <button type="submit">Submit</button>  {/* Not <div onClick> */}
      <nav>...</nav>
      <main>...</main>
      <footer>...</footer>
      
      {/* ARIA attributes */}
      <button aria-label="Close modal" onClick={closeModal}>×</button>
      <div role="alert">{error}</div>
      
      {/* Keyboard navigation */}
      <div 
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleClick()}
        onClick={handleClick}
      >
        Click me
      </div>
    </form>
  )
}
```

---

**This is Part 2 of the learning guide, covering:**
- ✅ Form Management System (creation, editing, versioning)
- ✅ Dynamic Form Builder (add fields, remove fields, field properties)
- ✅ Application Processing (submit, review, approve/reject)
- ✅ Complaints Management (file, respond, resolve)
- ✅ Waitlist & Renewals (manage, approve, track)
- ✅ Advanced Component Patterns (render props, custom hooks, HOC)
- ✅ Event Handling (synthetic events, form handling)
- ✅ GitHub Pages Deployment (HashRouter, 404 redirect, Vite config)
- ✅ Performance Optimization (memo, useMemo, useCallback, lazy loading)
- ✅ Best Practices (organization, naming, accessibility)

**You now have complete documentation of every concept, pattern, and technique used in the UniHall project!**
