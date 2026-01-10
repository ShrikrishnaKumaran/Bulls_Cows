import { useState } from 'react'
import './App.css'

function App() {
  const [isLogin, setIsLogin] = useState(true)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  })
  const [message, setMessage] = useState('')
  const [token, setToken] = useState(localStorage.getItem('token') || '')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      
      if (data.success) {
        setMessage('Registration successful!')
        localStorage.setItem('token', data.token)
        setToken(data.token)
      } else {
        setMessage(data.message)
      }
    } catch (error) {
      setMessage('Error: ' + error.message)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })
      const data = await response.json()
      
      if (data.success) {
        setMessage('Login successful!')
        localStorage.setItem('token', data.token)
        setToken(data.token)
      } else {
        setMessage(data.message)
      }
    } catch (error) {
      setMessage('Error: ' + error.message)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    setToken('')
    setMessage('Logged out')
  }

  if (token) {
    return (
      <div>
        <h2>Logged In</h2>
        <p>{message}</p>
        <button onClick={handleLogout}>Logout</button>
      </div>
    )
  }

  return (
    <div>
      <h1>{isLogin ? 'Login' : 'Register'}</h1>
      
      <form onSubmit={isLogin ? handleLogin : handleRegister}>
        {!isLogin && (
          <div>
            <input
              type="text"
              name="username"
              placeholder="Username"
              value={formData.username}
              onChange={handleChange}
            />
          </div>
        )}
        
        <div>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
          />
        </div>
        
        <div>
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
      </form>
      
      <button onClick={() => setIsLogin(!isLogin)}>
        {isLogin ? 'Switch to Register' : 'Switch to Login'}
      </button>
      
      {message && <p>{message}</p>}
    </div>
  )
}

export default App
