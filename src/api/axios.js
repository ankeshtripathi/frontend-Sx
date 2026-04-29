import axios from 'axios'

const api = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:5000/api',
    withCredentials: true,
})

// Attach token initially
const token = localStorage.getItem('LMS_accessToken')
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

// Interceptor
api.interceptors.request.use((config) => {
    const t = localStorage.getItem('LMS_accessToken')

    config.headers = config.headers || {}

    if (t) {
        config.headers['Authorization'] = `Bearer ${t}`
    }

    // ✅ tenant header (IMPORTANT)
    config.headers['x-tenant-id'] = 'demo'

    return config
})

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            console.log("Unauthorized - redirect to login")
        }
        return Promise.reject(error)
    }
)

export default api