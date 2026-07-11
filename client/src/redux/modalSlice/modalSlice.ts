import type { Form } from '@/types/Form/Form'
import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

type InitialState = {
	addUserModalOpen: boolean
	addFormModalOpen: boolean
	deleteFormModalOpen: boolean
	selectedForm: Form | null
}

const initialState: InitialState = {
	addUserModalOpen: false,
	addFormModalOpen: false,
	deleteFormModalOpen: false,
	selectedForm: null,
}

const modalSlice = createSlice({
	name: 'modal',
	initialState,
	reducers: {
		updateAddUserModalOpen(state, action: PayloadAction<boolean>) {
			state.addUserModalOpen = action.payload
		},
		updateAddFormModalOpen(state, action: PayloadAction<boolean>) {
			state.addFormModalOpen = action.payload
		},
		updateDeleteFormModalOpen(state, action: PayloadAction<boolean>) {
			state.deleteFormModalOpen = action.payload
		},
		updateSelectedForm(state, action: PayloadAction<Form | null>) {
			state.selectedForm = action.payload
		},
	},
})

export const {
	updateAddUserModalOpen,
	updateAddFormModalOpen,
	updateDeleteFormModalOpen,
	updateSelectedForm,
} = modalSlice.actions
export default modalSlice.reducer
