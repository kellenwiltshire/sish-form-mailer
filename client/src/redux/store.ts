import { configureStore } from '@reduxjs/toolkit'
import userReducer from './userSlice/userSlice'
import modalReducer from './modalSlice/modalSlice'

export const store = configureStore({
	reducer: {
		user: userReducer,
		modal: modalReducer,
	},
})

export type AppDispatch = typeof store.dispatch
export type RootState = ReturnType<typeof store.getState>
