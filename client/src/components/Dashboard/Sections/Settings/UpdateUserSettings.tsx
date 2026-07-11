import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import { useAppSelector } from '@/redux/hooks'
import { toast } from 'react-toastify'
import { useSWRConfig } from 'swr'

const UpdateUserSettings = ({
	setUpdateSettingsOpen,
}: {
	setUpdateSettingsOpen: (bool: boolean) => void
}) => {
	const user = useAppSelector((state) => state.user)
	const { mutate } = useSWRConfig()
	const handleSubmit = (form: FormData) => {
		const formData = Object.fromEntries(form.entries())

		const { email, password } = formData

		fetch('/api/user', {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				email: email ? email : user?.email,
				password: password ? password : null,
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
				mutate('/api/user')
				setUpdateSettingsOpen(false)
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

			<Button type='submit'>Submit</Button>
		</form>
	)
}

export default UpdateUserSettings
