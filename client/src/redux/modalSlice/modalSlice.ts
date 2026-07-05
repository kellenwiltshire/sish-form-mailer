import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type InitialState = {
	addUserModalOpen: boolean
}

const initialState: InitialState = {
	addUserModalOpen: false,
}

const modalSlice = createSlice({
	name: 'modal',
	initialState,
	reducers: {
		updateAddUserModalOpen(state, action: PayloadAction<boolean>) {
			state.addUserModalOpen = action.payload
		},
	},
})

export const { updateAddUserModalOpen } = modalSlice.actions
export default modalSlice.reducer
