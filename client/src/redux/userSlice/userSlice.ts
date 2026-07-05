import type { User } from '@/types/User/User'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

const initialState: User | null = null

const userSlice = createSlice({
	name: 'user',
	initialState: initialState as User | null,
	reducers: {
		updateUser(_state, action: PayloadAction<User | null>) {
			return action.payload
		},

		clearUser() {
			return null
		},
	},
})

export const { updateUser } = userSlice.actions
export default userSlice.reducer
