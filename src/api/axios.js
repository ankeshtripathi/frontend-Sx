import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_BASE_URL || 'http://localhost:5000',
})

const token = localStorage.getItem('LMS_accessToken')
if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
}

api.interceptors.request.use((config) => {
    const t = localStorage.getItem('LMS_accessToken')

    config.headers = config.headers || {}

    if (t) {
        config.headers['Authorization'] = `Bearer ${t}`
    }

    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            localStorage.removeItem('LMS_accessToken')
            delete api.defaults.headers.common['Authorization']
        }
        return Promise.reject(error)
    }
)

export const unwrapApiData = (responseOrData) => {
    const payload = responseOrData?.data ?? responseOrData
    return payload && typeof payload === 'object' && 'data' in payload
        ? payload.data
        : payload
}

export const getApiErrorMessage = (error, fallback = 'Request failed') => (
    error?.response?.data?.error?.message ||
    error?.response?.data?.message ||
    error?.message ||
    fallback
)

export default api