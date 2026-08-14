import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import SelectInput from '@/components/UI/Select'
import type { User } from '@/types/User/User'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'

const EditUser = ({
	setUser,
	user,
}: {
	setUser: (user: User | null) => void
	user: User
}) => {
	const { mutate } = useSWRConfig()
	const handleSubmit = (form: FormData) => {
		const formData = Object.fromEntries(form.entries())

		const { email, password, role } = formData

		fetch(`/api/admin/editUser/${user.id}`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: email ? email : user.email,
				password: password ? password : null,
				role: role ? role : user.role,
			}),
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error()
				}
				toast.success('User Settings Updated')
			})
			.catch((err) => {
				console.error(err)
				toast.error('Error: Please try again later')
			})
			.finally(() => {
				mutate('/api/admin/getUsers')
				setUser(null)
			})
	}

	if (!user) return null

	return (
		<form
			action={handleSubmit}
			className='mx-auto flex w-full max-w-5xl flex-col gap-2'
		>
			<Input
				name='email'
				id='email'
				type='text'
				placeholder={user.email}
				label='Email'
			/>

			<Input
				name='password'
				id='password'
				type='text'
				placeholder='Password'
				label='Password'
			/>
			<SelectInput
				label='User Role'
				name='role'
				options={[
					{
						label: 'User',
						value: 'user',
					},
					{
						label: 'Admin',
						value: 'admin',
					},
				]}
			/>
			<div className='flex w-full flex-row justify-end gap-2'>
				<Button variant='ghost' onClick={() => setUser(null)}>
					Cancel
				</Button>
				<Button type='submit'>Submit</Button>
			</div>
		</form>
	)
}

export default EditUser
