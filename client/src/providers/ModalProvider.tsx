import AddUserModal from '@/components/Modals/AddUserModal'
import { useAppSelector } from '@/redux/hooks'
import type { JSX } from 'react/jsx-runtime'

const ModalProvider = ({ children }: { children: JSX.Element }) => {
	const { addUserModalOpen } = useAppSelector((state) => state.modal)
	return (
		<>
			{addUserModalOpen && <AddUserModal />}
			{children}
		</>
	)
}

export default ModalProvider
