import React, { createContext, useContext, useState, useEffect } from 'react'
import api from '../utils/api'
import toast from 'react-hot-toast'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('token')
    if (token) {
      api.setAuthToken(token)
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/profile')
      if (response.data.success) {
        setUser(response.data.data.user)
      } else {
        logout()
      }
    } catch (error) {
      console.error('Failed to fetch user:', error)
      logout()
    } finally {
      setLoading(false)
    }
  }

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password })
      
      if (response.data.success) {
        const { user, token } = response.data.data
        
        localStorage.setItem('token', token)
        api.setAuthToken(token)
        setUser(user)
        
        toast.success('Login successful!')
        return { success: true }
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Login failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const register = async (userData) => {
    try {
      const response = await api.post('/auth/register', userData)
      
      if (response.data.success) {
        const { user, token } = response.data.data
        
        localStorage.setItem('token', token)
        api.setAuthToken(token)
        setUser(user)
        
        toast.success('Registration successful!')
        return { success: true }
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Registration failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const logout = () => {
    localStorage.removeItem('token')
    api.removeAuthToken()
    setUser(null)
    toast.success('Logged out successfully')
  }

  const updateUser = async (updates) => {
    try {
      const response = await api.put('/auth/profile', updates)
      
      if (response.data.success) {
        setUser(response.data.data.user)
        toast.success('Profile updated successfully')
        return { success: true }
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Update failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const response = await api.put('/auth/change-password', {
        currentPassword,
        newPassword
      })
      
      if (response.data.success) {
        toast.success('Password changed successfully')
        return { success: true }
      } else {
        throw new Error(response.data.message)
      }
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Password change failed'
      toast.error(message)
      return { success: false, error: message }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    refreshUser: fetchUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
