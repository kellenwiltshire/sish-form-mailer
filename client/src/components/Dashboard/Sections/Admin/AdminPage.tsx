import Button from '@/components/UI/Button'
import type { User } from '@/types/User/User'
import { fetcher } from '@/util/SWR/fetch'
import useSWR from 'swr'

type GetUsersResponse = {
	users: User[]
}

const AdminPage = () => {
	const { data, error } = useSWR<GetUsersResponse, Error>(
		'/api/admin/getUsers',
		fetcher,
	)

	if (!data) return <div>Loading...</div>

	if (error) return <div>error</div>

	const { users } = data

	console.log(users)

	return (
		<main>
			<header className='flex items-center justify-between border-b border-gray-200 px-4 py-4 sm:px-6 sm:py-6 lg:px-8'>
				<h1 className='text-base/7 font-semibold text-gray-900'>
					Admin Settings
				</h1>
				<div>
					<Button>Add User</Button>
				</div>
			</header>
		</main>
	)
}

export default AdminPage
