// src/store/index.js
import { configureStore } from '@reduxjs/toolkit'
import authReducer from './auth/authSlice'
import permissionsReducer from './permissions/permissionsSlice'
import rolesReducer from './roles/rolesSlice'
import usersReducer from './users/usersSlice'
import resumeUploadReducer from './resumeUpload/resumeUploadSlice'

const isDev = import.meta.env.DEV

const store = configureStore({
  reducer: {
    auth: authReducer,
    permissions: permissionsReducer,
    roles: rolesReducer,
    users: usersReducer,
    resumeUpload: resumeUploadReducer,
  },
  devTools: isDev,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // you may adjust according to your data
      thunk: true,
    }),
})

export default store
