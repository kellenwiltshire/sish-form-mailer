import AddFormModal from '@/components/Modals/AddFormModal'
import AddUserModal from '@/components/Modals/AddUserModal'
import DeleteFormModal from '@/components/Modals/DeleteFormModal'
import { useAppSelector } from '@/redux/hooks'
import type { JSX } from 'react/jsx-runtime'

const ModalProvider = ({ children }: { children: JSX.Element }) => {
	const { addUserModalOpen, addFormModalOpen, deleteFormModalOpen } =
		useAppSelector((state) => state.modal)
	return (
		<>
			{addUserModalOpen && <AddUserModal />}
			{addFormModalOpen && <AddFormModal />}
			{deleteFormModalOpen && <DeleteFormModal />}
			{children}
		</>
	)
}

export default ModalProvider
