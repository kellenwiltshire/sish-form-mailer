import AddFormModal from '@/components/Modals/AddFormModal'
import AddOriginModal from '@/components/Modals/AddOriginModal'
import AddUserModal from '@/components/Modals/AddUserModal'
import DeleteFormModal from '@/components/Modals/DeleteFormModal'
import EditFormModal from '@/components/Modals/EditFormModal'
import { useAppSelector } from '@/redux/hooks'
import type { JSX } from 'react/jsx-runtime'

const ModalProvider = ({ children }: { children: JSX.Element }) => {
	const {
		addUserModalOpen,
		addFormModalOpen,
		deleteFormModalOpen,
		addOriginModalOpen,
		editFormModalOpen,
	} = useAppSelector((state) => state.modal)
	return (
		<>
			{addUserModalOpen && <AddUserModal />}
			{addFormModalOpen && <AddFormModal />}
			{addOriginModalOpen && <AddOriginModal />}
			{deleteFormModalOpen && <DeleteFormModal />}
			{editFormModalOpen && <EditFormModal />}
			{children}
		</>
	)
}

export default ModalProvider
