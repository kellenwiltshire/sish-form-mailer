import type { User } from '@/types/User/User'
import { fetcher } from '@/util/SWR/fetch'
import { useState } from 'react'
import { toast } from 'react-toastify'
import useSWR from 'swr'
import dayjs from 'dayjs'
import EditUser from './EditUser'

type GetUsersResponse = {
	users: User[]
}

const UserTable = () => {
	const [confirmation, setConfirmation] = useState<number | null>(null)
	const [editUser, setEditUser] = useState<User | null>(null)
	const { data, error, mutate } = useSWR<GetUsersResponse, Error>(
		'/api/admin/getUsers',
		fetcher,
	)

	if (!data) return <div>Loading...</div>

	if (error) return <div>error</div>

	const { users } = data

	const handleDeleteUser = (id: number) => {
		fetch(`/api/admin/deleteUser/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error()
				}
				toast.success('User Deleted')
				mutate()
			})
			.catch((err) => {
				console.error(err)
				toast.error('Error: Please try again later')
			})
	}

	return (
		<div>
			{editUser ? (
				<EditUser user={editUser} setUser={setEditUser} />
			) : (
				<>
					<h1 className='pl-2.5 text-xl/7 font-semibold text-gray-900'>
						Users
					</h1>

					<table className='relative w-full divide-y divide-gray-300'>
						<thead>
							<tr>
								<th
									scope='col'
									className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
								>
									Email
								</th>
								<th
									scope='col'
									className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
								>
									Role
								</th>
								<th
									scope='col'
									className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
								>
									Number of Forms
								</th>
								<th
									scope='col'
									className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
								>
									Created
								</th>
								<th scope='col' className='py-3.5 pr-4 pl-3'>
									<span className='sr-only'>Edit</span>
								</th>
								<th scope='col' className='py-3.5 pr-4 pl-3'>
									<span className='sr-only'>Delete</span>
								</th>
							</tr>
						</thead>
						<tbody className='divide-y divide-gray-200'>
							{users
								.sort((a, b) => a.role.localeCompare(b.role))
								.map((user) => (
									<tr key={user.email}>
										<td className='px-3 py-4 text-sm whitespace-nowrap text-gray-500'>
											{user.email}
										</td>
										<td className='px-3 py-4 text-sm whitespace-nowrap text-gray-500'>
											{user.role}
										</td>
										<td className='px-3 py-4 text-sm whitespace-nowrap text-gray-500'>
											{user.num_forms}
										</td>
										<td className='px-3 py-4 text-sm whitespace-nowrap text-gray-500'>
											{dayjs(user.created_at).format('DD-MMM-YYYY')}
										</td>
										{user.role !== 'admin' && (
											<>
												<td className='py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap'>
													<button
														onClick={() => setEditUser(user)}
														className='cursor-pointer text-indigo-600 hover:text-indigo-900'
													>
														Edit<span className='sr-only'>, {user.email}</span>
													</button>
												</td>
												{confirmation === user.id ? (
													<td className='py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap'>
														<button
															onClick={() => handleDeleteUser(user.id)}
															className='cursor-pointer text-red-600 hover:text-red-900'
														>
															Are you sure?
															<span className='sr-only'>, {user.email}</span>
														</button>
													</td>
												) : (
													<td className='py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap'>
														<button
															onClick={() => setConfirmation(user.id)}
															className='cursor-pointer text-red-600 hover:text-red-900'
														>
															Delete
															<span className='sr-only'>, {user.email}</span>
														</button>
													</td>
												)}
											</>
										)}
									</tr>
								))}
						</tbody>
					</table>
				</>
			)}
		</div>
	)
}

export default UserTable
