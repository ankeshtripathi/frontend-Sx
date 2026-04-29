// src/features/auth/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import api, { getApiErrorMessage, unwrapApiData } from '../../api/axios'
import { setPermissions } from '../permissions/permissionsSlice'

// decode JWT safely (base64url)
const decodeJwt = (token) => {
  try {
    if (!token || typeof token !== 'string') return null
    const payload = token.split('.')[1]
    if (!payload) return null
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, '=')
    const json = atob(padded)
    return JSON.parse(json)
  } catch (e) {
    return null
  }
}

const isTokenExpired = (token) => {
  const data = decodeJwt(token)
  if (!data) return true
  if (typeof data.exp === 'number') {
    return data.exp * 1000 < Date.now()
  }
  return false
}

// Note: we do NOT persist permissions to localStorage anymore.

// --- NEW: robust token extractor: returns string token or null
const extractTokenString = (resData) => {
  if (!resData) return null
  // common server shapes
  if (typeof resData === 'string') return resData
  if (resData.token && typeof resData.token === 'string') return resData.token
  if (resData.accessToken && typeof resData.accessToken === 'string') return resData.accessToken
  // if server accidentally returns { token: { ... } } or whole object, bail out
  return null
}

export const login = createAsyncThunk(
  'auth/login',
  async ({ email, password }, { rejectWithValue, dispatch }) => {
    try {
      const res = await api.post('/auth/login', { email, password })
      const data = unwrapApiData(res)

      const token = extractTokenString(data)
      if (!token) {
        throw new Error('Login response did not include an access token')
      } else {
        localStorage.setItem('LMS_accessToken', token)
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      }

      dispatch(setPermissions([]))

      return { user: data.user || decodeJwt(token) || null }
    } catch (err) {
      return rejectWithValue(getApiErrorMessage(err, 'Login failed'))
    }
  }
)

// restoreSession thunk
export const restoreSession = createAsyncThunk(
  'auth/restoreSession',
  async (_, { dispatch }) => {
    try {
      const token = localStorage.getItem('LMS_accessToken')
      if (!token) {
        return null
      }

      if (isTokenExpired(token)) {
        localStorage.removeItem('LMS_accessToken')
        return null
      }

      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      dispatch(setPermissions([]))

      const claims = decodeJwt(token) || {}
      return {
        id: claims.userId || claims.sub || null,
        tenantId: claims.tenantId || null,
      }
    } catch (err) {
      localStorage.removeItem('LMS_accessToken')
      return null
    }
  }
)

export const logout = createAsyncThunk('auth/logout', async (_, { dispatch }) => {
  localStorage.removeItem('LMS_accessToken')
  if (api?.defaults?.headers?.common) {
    delete api.defaults.headers.common['Authorization']
  }
  dispatch(setPermissions([]))
  return null
})

// slice (mostly unchanged) ...
const slice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    loading: true,
    error: null,
    initialized: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false
        state.error = null
        state.initialized = true
        state.user = action.payload.user || action.payload
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false
        state.error = action.payload || action.error.message
      })
      .addCase(restoreSession.pending, (state) => {
        state.loading = true
        state.error = null
      })
      .addCase(restoreSession.fulfilled, (state, action) => {
        state.loading = false
        state.initialized = true
        state.user = action.payload
      })
      .addCase(restoreSession.rejected, (state) => {
        state.loading = false
        state.initialized = true
        state.user = null
        localStorage.removeItem('LMS_accessToken')
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.loading = false
        state.error = null
        localStorage.removeItem('LMS_accessToken')
      })
  },
})

export const { setUser } = slice.actions
export const selectAuth = (s) => s.auth
export const selectUser = (s) => s.auth.user
export const selectIsAuthenticated = (s) => !!s.auth.user
export default slice.reducer
