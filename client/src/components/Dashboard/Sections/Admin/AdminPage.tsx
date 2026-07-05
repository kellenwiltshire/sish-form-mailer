import Button from '@/components/UI/Button'
import { useAppDispatch } from '@/redux/hooks'
import { updateAddUserModalOpen } from '@/redux/modalSlice/modalSlice'
import UserTable from './UserTable'

const AdminPage = () => {
	const dispatch = useAppDispatch()

	return (
		<main>
			<header className='flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
				<h1 className='text-base/7 font-semibold text-gray-900'>Users</h1>
				<div>
					<Button onClick={() => dispatch(updateAddUserModalOpen(true))}>
						Add User
					</Button>
				</div>
			</header>
			<UserTable />
		</main>
	)
}

export default AdminPage
