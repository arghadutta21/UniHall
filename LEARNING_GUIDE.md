# UniHall Project - Complete Learning Guide (Part 1)

## Table of Contents
1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [CSS & Styling with Tailwind](#css--styling-with-tailwind)
5. [React Fundamentals Used](#react-fundamentals-used)
6. [State Management](#state-management)
7. [Routing & Navigation](#routing--navigation)
8. [Authentication System](#authentication-system)
9. [Mock API & Data Layer](#mock-api--data-layer)

---

## Project Overview

**UniHall** is a comprehensive university hall management system built with modern web technologies. It manages:
- Student applications for hall admission
- Admin operations (forms, applications, complaints, seat management)
- Staff operations
- Exam controller operations
- Waiting list management
- Renewal requests

---

## Technology Stack

### Frontend Framework
- **React 18** - Modern UI library for building component-based interfaces
- **Vite** - Next-generation build tool (faster than Create React App)

### Styling
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing tool

### Routing
- **React Router v6** - Client-side routing (using HashRouter for GitHub Pages)

### State Management
- **React Context API** - Global state for authentication
- **useState Hook** - Local component state
- **useEffect Hook** - Side effects and lifecycle management

### Data Storage
- **localStorage** - Browser storage for mock database

---

## Project Structure

```
UniHall/frontend/
├── public/
│   ├── halls/                    # Hall images (ASH.jpg, MUH.jpg, etc.)
│   └── 404.html                  # GitHub Pages fallback
├── src/
│   ├── main.jsx                  # App entry point
│   ├── App.jsx                   # Root component with routing
│   ├── index.css                 # Global Tailwind styles
│   ├── context/
│   │   └── AuthContext.jsx       # Authentication context
│   ├── lib/
│   │   ├── mockApi.js           # Mock backend API
│   │   └── hallImages.js        # Image path helper
│   ├── pages/
│   │   ├── auth/                # Login & Register
│   │   ├── admin/               # Admin pages
│   │   ├── student/             # Student pages
│   │   ├── staff/               # Staff pages
│   │   ├── exam/                # Exam controller pages
│   │   └── shared/              # Shared pages (Complaints, Notifications)
│   └── components/              # Reusable components
├── package.json                  # Dependencies & scripts
├── vite.config.js               # Vite configuration
└── tailwind.config.js           # Tailwind configuration
```

---

## CSS & Styling with Tailwind

### What is Tailwind CSS?

Tailwind is a **utility-first CSS framework**. Instead of writing custom CSS classes, you apply small utility classes directly in HTML/JSX.

### Traditional CSS vs Tailwind

**Traditional CSS:**
```css
/* styles.css */
.card {
  background-color: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
}
```
```jsx
<div className="card">Content</div>
```

**Tailwind CSS:**
```jsx
<div className="bg-white border border-gray-300 rounded-lg p-6">
  Content
</div>
```

### Common Tailwind Classes Used in This Project

#### Layout & Spacing
```jsx
// Flexbox
className="flex"              // display: flex
className="flex-col"          // flex-direction: column
className="items-center"      // align-items: center
className="justify-between"   // justify-content: space-between
className="gap-4"             // gap: 1rem (16px)

// Grid
className="grid grid-cols-3"  // 3 column grid
className="grid gap-4"        // Grid with gap

// Spacing (margin & padding)
className="p-4"               // padding: 1rem
className="px-6"              // padding-left & right: 1.5rem
className="py-2"              // padding-top & bottom: 0.5rem
className="m-4"               // margin: 1rem
className="mt-2"              // margin-top: 0.5rem
className="mb-4"              // margin-bottom: 1rem

// Width & Height
className="w-full"            // width: 100%
className="max-w-md"          // max-width: 28rem
className="h-screen"          // height: 100vh
```

#### Colors & Backgrounds
```jsx
className="bg-white"          // background: white
className="bg-gray-50"        // light gray background
className="bg-blue-600"       // blue background (600 shade)
className="text-gray-900"     // very dark gray text
className="text-red-600"      // red text
className="border-gray-300"   // gray border
```

#### Typography
```jsx
className="text-xl"           // font-size: 1.25rem
className="text-2xl"          // font-size: 1.5rem
className="font-bold"         // font-weight: 700
className="font-semibold"     // font-weight: 600
className="text-center"       // text-align: center
```

#### Borders & Rounded Corners
```jsx
className="border"            // border: 1px solid
className="border-2"          // border: 2px solid
className="rounded"           // border-radius: 0.25rem
className="rounded-lg"        // border-radius: 0.5rem
className="rounded-full"      // border-radius: 9999px (circle)
```

#### Hover & Interactive States
```jsx
className="hover:bg-blue-700"     // Change bg on hover
className="hover:underline"       // Underline on hover
className="cursor-pointer"        // Cursor: pointer
className="focus:ring-2"          // Add focus ring
```

### Responsive Design with Tailwind

Tailwind uses **mobile-first** breakpoints:

```jsx
// Mobile: default (no prefix)
// Tablet: sm: (640px+)
// Desktop: md: (768px+), lg: (1024px+), xl: (1280px+)

<div className="w-full md:w-1/2 lg:w-1/3">
  {/* Full width on mobile, half on tablet, 1/3 on desktop */}
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
  {/* 1 column mobile, 2 tablet, 3 desktop */}
</div>
```

### Custom Tailwind Configuration

**File: `tailwind.config.js`**
```javascript
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],  // Files to scan for classes
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eff6ff',
          600: '#2563eb',   // Custom brand color
          700: '#1d4ed8',
        }
      }
    }
  }
}
```

**Usage:**
```jsx
<button className="bg-brand-600 hover:bg-brand-700">
  Click me
</button>
```

---

## React Fundamentals Used

### 1. **Components**

React apps are built with **components** - reusable pieces of UI.

#### Function Components (Modern Way)
```jsx
// Simple component
function Welcome() {
  return <h1>Hello, World!</h1>
}

// Component with props
function Greeting({ name, age }) {
  return (
    <div>
      <h1>Hello, {name}!</h1>
      <p>Age: {age}</p>
    </div>
  )
}

// Usage
<Greeting name="John" age={25} />
```

#### Example from Project (Nav Component)
**File: `src/App.jsx`**
```jsx
function Nav() {
  const { user, logout } = useAuth()  // Get auth data
  
  return (
    <header className="bg-white border-b sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-4">
        <Link to="/" className="font-semibold text-brand-700">UniHall</Link>
        {/* Conditional rendering based on user */}
        {user ? (
          <>
            <span>{user.name} ({user.role})</span>
            <button onClick={logout}>Logout</button>
          </>
        ) : (
          <Link to="/login">Login</Link>
        )}
      </div>
    </header>
  )
}
```

### 2. **JSX (JavaScript XML)**

JSX lets you write HTML-like code in JavaScript.

#### JSX Rules:
```jsx
// 1. Return single parent element
function Bad() {
  return (
    <h1>Title</h1>
    <p>Text</p>  // ERROR: Multiple elements
  )
}

function Good() {
  return (
    <div>
      <h1>Title</h1>
      <p>Text</p>
    </div>
  )
}

// 2. Use {} for JavaScript expressions
function Example() {
  const name = "John"
  const age = 25
  const isAdult = age >= 18
  
  return (
    <div>
      <p>Name: {name}</p>
      <p>Age: {age}</p>
      <p>Status: {isAdult ? 'Adult' : 'Minor'}</p>
    </div>
  )
}

// 3. className instead of class
<div className="container">  // ✅ Correct
<div class="container">      // ❌ Wrong

// 4. Self-closing tags need /
<img src="pic.jpg" />  // ✅ Correct
<img src="pic.jpg">    // ❌ Wrong
```

### 3. **Props (Properties)**

Props pass data from parent to child component.

```jsx
// Parent Component
function App() {
  return <UserCard name="John" age={25} isActive={true} />
}

// Child Component
function UserCard({ name, age, isActive }) {
  return (
    <div>
      <h2>{name}</h2>
      <p>Age: {age}</p>
      <p>Status: {isActive ? 'Active' : 'Inactive'}</p>
    </div>
  )
}
```

#### Props in Project (ApplicationCard)
**File: `src/pages/admin/Applications.jsx`**
```jsx
function ApplicationCard({ app, onStatusChange, onPaymentChange }) {
  // 'app' is the application data object
  // 'onStatusChange' is a callback function
  // 'onPaymentChange' is another callback function
  
  return (
    <div className="bg-white border rounded p-4">
      <h3>{app.data.fullName}</h3>
      <p>Status: {app.status}</p>
      
      {/* Call parent function when clicked */}
      <button onClick={() => onStatusChange(app.id, 'Approved')}>
        Approve
      </button>
    </div>
  )
}

// Parent usage
<ApplicationCard 
  app={application}
  onStatusChange={handleStatusChange}
  onPaymentChange={handlePaymentChange}
/>
```

### 4. **State with useState**

State is **data that changes over time** in a component.

#### Basic useState
```jsx
import { useState } from 'react'

function Counter() {
  // Declare state variable
  const [count, setCount] = useState(0)
  //     ↑         ↑            ↑
  //  current   setter    initial value
  
  return (
    <div>
      <p>Count: {count}</p>
      {/* Update state by calling setter */}
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>
      <button onClick={() => setCount(0)}>
        Reset
      </button>
    </div>
  )
}
```

#### Multiple State Variables
```jsx
function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  const handleSubmit = (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('All fields required')
      return
    }
    // Login logic...
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-600">{error}</p>}
      
      <input 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      
      <input 
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
      />
      
      <button type="submit">Login</button>
    </form>
  )
}
```

#### State with Objects/Arrays
```jsx
// Object state
const [user, setUser] = useState({ name: '', age: 0 })

// Update object (must spread existing values)
setUser({ ...user, name: 'John' })  // ✅ Correct
setUser({ name: 'John' })            // ❌ Wrong (loses 'age')

// Array state
const [items, setItems] = useState([])

// Add item
setItems([...items, newItem])        // ✅ Spread existing + new

// Remove item
setItems(items.filter(item => item.id !== deleteId))

// Update item
setItems(items.map(item => 
  item.id === updateId ? { ...item, name: 'New Name' } : item
))
```

#### Example from Project (Register with OTP)
**File: `src/pages/auth/Register.jsx`**
```jsx
function Register() {
  const [step, setStep] = useState(1)           // Current step (1 or 2)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [studentId, setStudentId] = useState('')
  const [otp, setOtp] = useState('')
  const [generatedOtp, setGeneratedOtp] = useState('')
  const [error, setError] = useState('')
  
  const sendOtp = (e) => {
    e.preventDefault()
    
    // Validation
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    
    // Generate OTP
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString()
    setGeneratedOtp(mockOtp)
    
    // Move to step 2
    setStep(2)
    setError('')
  }
  
  const verifyOtpAndRegister = (e) => {
    e.preventDefault()
    
    if (otp !== generatedOtp) {
      setError('Invalid OTP')
      return
    }
    
    // Register user...
  }
  
  return (
    <div>
      {step === 1 ? (
        <form onSubmit={sendOtp}>
          {/* Form fields */}
        </form>
      ) : (
        <form onSubmit={verifyOtpAndRegister}>
          {/* OTP input */}
        </form>
      )}
    </div>
  )
}
```

### 5. **Effects with useEffect**

useEffect handles **side effects** - code that interacts with outside systems.

#### Basic useEffect
```jsx
import { useState, useEffect } from 'react'

function Example() {
  const [count, setCount] = useState(0)
  
  // Runs after every render
  useEffect(() => {
    console.log('Component rendered')
  })
  
  // Runs only once (on mount)
  useEffect(() => {
    console.log('Component mounted')
  }, [])  // Empty dependency array
  
  // Runs when 'count' changes
  useEffect(() => {
    console.log('Count changed:', count)
  }, [count])  // Dependency array
  
  // Cleanup function
  useEffect(() => {
    const timer = setInterval(() => {
      console.log('Tick')
    }, 1000)
    
    // Cleanup runs when component unmounts
    return () => {
      clearInterval(timer)
    }
  }, [])
  
  return <div>Count: {count}</div>
}
```

#### Example from Project (AuthContext)
**File: `src/context/AuthContext.jsx`**
```jsx
function AuthProvider({ children }) {
  const [user, setUser] = useState(api.getSessionUser())
  
  // Run once when component mounts
  useEffect(() => {
    api.ensureSeedData()  // Initialize demo data
  }, [])
  
  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
```

### 6. **Conditional Rendering**

Show different UI based on conditions.

```jsx
function Example({ isLoggedIn, user, items }) {
  // 1. If-else with ternary operator
  return (
    <div>
      {isLoggedIn ? (
        <p>Welcome, {user.name}!</p>
      ) : (
        <p>Please log in</p>
      )}
    </div>
  )
  
  // 2. Logical AND (&&) - show if true
  return (
    <div>
      {isLoggedIn && <p>Welcome back!</p>}
      {items.length === 0 && <p>No items found</p>}
    </div>
  )
  
  // 3. Early return
  if (!user) {
    return <p>Loading...</p>
  }
  return <p>Hello, {user.name}</p>
  
  // 4. Switch-like with multiple conditions
  const getStatusColor = (status) => {
    if (status === 'Approved') return 'text-green-600'
    if (status === 'Rejected') return 'text-red-600'
    return 'text-yellow-600'
  }
  
  return <span className={getStatusColor(user.status)}>{user.status}</span>
}
```

### 7. **Lists and Keys**

Render arrays of data.

```jsx
function TodoList() {
  const todos = [
    { id: 1, text: 'Learn React', done: false },
    { id: 2, text: 'Build project', done: false },
    { id: 3, text: 'Deploy', done: true }
  ]
  
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>  {/* Key is required! */}
          {todo.text} {todo.done && '✓'}
        </li>
      ))}
    </ul>
  )
}
```

#### Example from Project (Applications List)
**File: `src/pages/admin/Applications.jsx`**
```jsx
function Applications() {
  const apps = api.listApplications({ hallId: user.hallId })
  
  return (
    <div>
      {apps.length === 0 ? (
        <p>No applications found</p>
      ) : (
        <div className="space-y-4">
          {apps.map(app => (
            <ApplicationCard
              key={app.id}  // Unique key from app ID
              app={app}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}
```

---

## State Management

### Global State with Context API

Context provides a way to share data without passing props through every level.

#### Creating a Context
**File: `src/context/AuthContext.jsx`**
```jsx
import { createContext, useContext, useState, useMemo } from 'react'

// 1. Create context
const AuthContext = createContext(null)

// 2. Create provider component
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  
  const login = async (email, password) => {
    const userData = await api.login(email, password)
    setUser(userData)
  }
  
  const logout = () => {
    api.logout()
    setUser(null)
  }
  
  // useMemo prevents unnecessary re-renders
  const value = useMemo(() => ({
    user,
    login,
    logout
  }), [user])
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// 3. Create custom hook for easy access
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}
```

#### Using the Context
**File: `src/main.jsx`**
```jsx
// Wrap app with provider
<AuthProvider>
  <App />
</AuthProvider>
```

**File: `src/App.jsx`**
```jsx
function Nav() {
  // Use the custom hook
  const { user, logout } = useAuth()
  
  return (
    <div>
      {user ? (
        <>
          <span>{user.name}</span>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <Link to="/login">Login</Link>
      )}
    </div>
  )
}
```

---

## Routing & Navigation

### React Router v6 Basics

React Router enables navigation between pages without full page refresh (SPA).

#### Setting Up Router
**File: `src/main.jsx`**
```jsx
import { HashRouter } from 'react-router-dom'

<HashRouter>  {/* Use HashRouter for GitHub Pages */}
  <AuthProvider>
    <App />
  </AuthProvider>
</HashRouter>
```

#### Defining Routes
**File: `src/App.jsx`**
```jsx
import { Routes, Route, Navigate } from 'react-router-dom'

function App() {
  return (
    <Routes>
      {/* Basic route */}
      <Route path="/" element={<HomePage />} />
      
      {/* Route with path parameter */}
      <Route path="/user/:id" element={<UserProfile />} />
      
      {/* Protected route */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminDashboard />
        </ProtectedRoute>
      } />
      
      {/* Redirect */}
      <Route path="/old-path" element={<Navigate to="/new-path" />} />
      
      {/* 404 catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
```

#### Navigation with Link
```jsx
import { Link, useNavigate } from 'react-router-dom'

function Navigation() {
  const navigate = useNavigate()
  
  return (
    <div>
      {/* Declarative navigation */}
      <Link to="/">Home</Link>
      <Link to="/about">About</Link>
      
      {/* Programmatic navigation */}
      <button onClick={() => navigate('/dashboard')}>
        Go to Dashboard
      </button>
      
      {/* Go back */}
      <button onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
  )
}
```

#### Protected Routes Pattern
```jsx
function ProtectedRoute({ children, allowedRoles }) {
  const { user } = useAuth()
  
  // Not logged in - redirect to login
  if (!user) {
    return <Navigate to="/login" replace />
  }
  
  // Wrong role - redirect to their dashboard
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />
  }
  
  // Authorized - show content
  return children
}

// Usage
<Route path="/admin" element={
  <ProtectedRoute allowedRoles={['admin']}>
    <AdminDashboard />
  </ProtectedRoute>
} />
```

---

## Authentication System

### Login Flow

#### 1. Login Page
**File: `src/pages/auth/Login.jsx`**
```jsx
function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  
  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      const user = await login(email, password)
      
      // Redirect based on role
      if (user.role === 'admin') navigate('/admin')
      else if (user.role === 'student') navigate('/student')
      else navigate('/')
      
    } catch (err) {
      setError(err.message)
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="text-red-600">{error}</p>}
      
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      
      <button type="submit">Login</button>
    </form>
  )
}
```

#### 2. Auth Context (Login Logic)
**File: `src/context/AuthContext.jsx`**
```jsx
const login = async (email, password) => {
  // Call API
  const userData = await api.login(email, password)
  
  // Save to state
  setUser(userData)
  
  return userData
}
```

#### 3. Mock API (Validate Credentials)
**File: `src/lib/mockApi.js`**
```jsx
export function login(email, password) {
  const users = read(KEYS.users, [])
  
  // Find user by email
  const user = users.find(u => u.email === email)
  
  // Validate
  if (!user) throw new Error('User not found')
  if (user.password !== password) throw new Error('Invalid password')
  
  // Create session
  write(KEYS.session, {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    hallId: user.hallId
  })
  
  return getSessionUser()
}
```

### Register Flow with OTP

#### Step 1: User fills form and requests OTP
```jsx
const sendOtp = (e) => {
  e.preventDefault()
  
  // Validate
  if (password !== confirm) {
    setError('Passwords do not match')
    return
  }
  
  // Generate 6-digit OTP
  const mockOtp = Math.floor(100000 + Math.random() * 900000).toString()
  setGeneratedOtp(mockOtp)
  
  // Show OTP (in production, send via email)
  alert(`Your OTP is: ${mockOtp}`)
  
  // Move to OTP step
  setStep(2)
}
```

#### Step 2: Verify OTP and register
```jsx
const verifyOtpAndRegister = async (e) => {
  e.preventDefault()
  
  // Verify OTP
  if (otp !== generatedOtp) {
    setError('Invalid OTP')
    return
  }
  
  // Register user
  await register({ name, email, password })
  
  // Redirect
  navigate('/student')
}
```

### Logout Flow
```jsx
const logout = () => {
  api.logout()           // Clear session in localStorage
  setUser(null)          // Clear state
  navigate('/')          // Redirect to homepage
}
```

---

## Mock API & Data Layer

### localStorage as Database

Instead of a real backend, we use browser's localStorage to store data.

#### Basic localStorage Operations
```javascript
// Save data
localStorage.setItem('key', 'value')

// Get data
const value = localStorage.getItem('key')

// Remove data
localStorage.removeItem('key')

// Clear all
localStorage.clear()

// Store objects (must stringify)
const user = { name: 'John', age: 25 }
localStorage.setItem('user', JSON.stringify(user))

// Retrieve objects (must parse)
const userData = JSON.parse(localStorage.getItem('user'))
```

#### Mock API Helper Functions
**File: `src/lib/mockApi.js`**
```javascript
// Read from localStorage with fallback
function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

// Write to localStorage
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

// Storage keys
const KEYS = {
  users: 'uh_users',
  session: 'uh_session',
  forms: 'uh_forms',
  applications: 'uh_applications',
  // ... more keys
}
```

### Seeding Demo Data

**File: `src/lib/mockApi.js`**
```javascript
export function ensureSeedData() {
  // Only seed if data doesn't exist
  if (!read(KEYS.halls)) {
    const halls = [
      {
        id: 'hall-ash',
        name: 'Amar Sonar Bangla Hall',
        shortName: 'ASH',
        capacity: 200
      },
      // ... more halls
    ]
    write(KEYS.halls, halls)
  }
  
  // Seed users for each hall
  if (!read(KEYS.users)) {
    const users = []
    
    halls.forEach(hall => {
      // Admin for this hall
      users.push({
        id: `admin-${hall.id}`,
        name: `${hall.shortName} Admin`,
        email: `admin.${hall.shortName.toLowerCase()}@nstu.edu.bd`,
        password: 'admin123',
        role: 'admin',
        hallId: hall.id
      })
      
      // Student for this hall
      users.push({
        id: `student-${hall.id}`,
        name: `${hall.shortName} Student`,
        email: `student.${hall.shortName.toLowerCase()}@student.nstu.edu.bd`,
        password: 'student123',
        role: 'student',
        hallId: hall.id
      })
    })
    
    write(KEYS.users, users)
  }
}
```

---

**This is Part 1 of the learning guide. It covers foundational concepts, CSS/Tailwind, React basics, state management, routing, authentication, and the mock API layer.**

**Part 2 will cover:**
- Form Management System
- Application Processing
- Admin Operations
- Component Patterns
- Advanced React Patterns
- Deployment & GitHub Pages
- Best Practices

Would you like me to continue with Part 2?
