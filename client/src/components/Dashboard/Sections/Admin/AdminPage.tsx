import Button from '@/components/UI/Button'
import { useAppDispatch } from '@/redux/hooks'
import { updateAddUserModalOpen } from '@/redux/modalSlice/modalSlice'
import UserTable from './UserTable'
import PageLayout from '@/Layout/PageLayout'

const AdminPage = () => {
	const dispatch = useAppDispatch()

	return (
		<PageLayout
			title='Admin'
			button={
				<Button onClick={() => dispatch(updateAddUserModalOpen(true))}>
					Add User
				</Button>
			}
		>
			<UserTable />
		</PageLayout>
	)
}

export default AdminPage
