import Button from '@/components/UI/Button'
import Input from '@/components/UI/Input'
import SelectInput from '@/components/UI/Select'
import { Encryption, type Email } from '@/types/Email/Email'
import { toast } from 'react-toastify'

const ENCRYPTION_OPTIONS = [
	{
		label: Encryption.tls,
		value: Encryption.tls.toLocaleLowerCase(),
	},
	{
		label: Encryption.starttls,
		value: Encryption.starttls.toLocaleLowerCase(),
	},
]

const UpdateEmailSettings = ({
	smtp,
	setUpdateSettingsOpen,
}: {
	smtp: Email | null
	setUpdateSettingsOpen: (bool: boolean) => void
}) => {
	const handleSubmit = (form: FormData) => {
		const formData = Object.fromEntries(form.entries())

		const {
			host,
			port,
			username,
			password,
			encryption_type,
			sender_email,
			recipient_email,
		} = formData

		const method = smtp ? 'PUT' : 'POST'

		fetch('/api/email-settings', {
			method,
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({
				host: host.valueOf() !== '' ? host : smtp?.host,
				port:
					Number(port.valueOf()) !== 0 ? Number(port.valueOf()) : smtp?.port,
				username: username.valueOf() !== '' ? username : smtp?.username,
				password: password.valueOf() !== '' ? password : smtp?.password,
				encryption_type:
					encryption_type.valueOf() !== ''
						? encryption_type
						: smtp?.encryption_type,
				sender_email:
					sender_email.valueOf() !== '' ? sender_email : smtp?.sender_email,
				recipient_email:
					recipient_email.valueOf() !== ''
						? recipient_email
						: smtp?.recipient_email,
			}),
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error()
				}
				toast.success('Email Settings Updated')
			})
			.catch((err) => {
				console.error(err)
				toast.error('Error: Please try again later')
			})
			.finally(() => setUpdateSettingsOpen(false))
	}

	return (
		<form action={handleSubmit} className='flex flex-col gap-2'>
			<Input
				name='host'
				id='host'
				type='text'
				placeholder={smtp ? smtp.host : 'SMTP Host'}
				label='SMTP Host'
				required={smtp === null}
			/>
			<Input
				name='port'
				id='port'
				type='number'
				placeholder={smtp ? smtp.port.toString() : 'SMTP Port'}
				label='SMTP Port'
				required={smtp === null}
			/>
			<Input
				name='username'
				id='username'
				type='text'
				placeholder={smtp ? smtp.username : 'SMTP Username'}
				label='SMTP Username'
				required={smtp === null}
			/>
			<Input
				name='password'
				id='password'
				type='text'
				placeholder='SMTP Password'
				label='SMTP Password'
				required={smtp === null}
			/>
			<SelectInput
				name='encryption_type'
				label='Encryption Type'
				options={ENCRYPTION_OPTIONS}
			/>
			<Input
				name='sender_email'
				id='sender_email'
				type='text'
				placeholder={smtp ? smtp.sender_email : 'SMTP Sender Email'}
				label='SMTP Sender Email'
				required={smtp === null}
			/>
			<Input
				name='recipient_email'
				id='recipient_email'
				type='text'
				placeholder={smtp ? smtp.recipient_email : 'SMTP Recipient Email'}
				label='SMTP Recipient Email'
				required={smtp === null}
			/>
			<Button type='submit'>Submit</Button>
		</form>
	)
}

export default UpdateEmailSettings
