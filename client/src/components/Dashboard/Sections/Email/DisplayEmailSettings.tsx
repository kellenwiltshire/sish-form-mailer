import Button from '@/components/UI/Button'
import { Encryption, type Email } from '@/types/Email/Email'
import { useState } from 'react'
import { toast } from 'react-toastify'

const DisplayEmailSettings = ({ smtp }: { smtp: Email }) => {
	const [isSending, setSending] = useState(false)
	const handleTestEmail = async () => {
		setSending(true)
		fetch('/api/email-settings/test')
			.then((res) => {
				console.log(res.ok)
				if (!res.ok) {
					throw new Error('Test email failed')
				} else {
					toast.success('Email Sent')
				}
			})
			.catch(() => {
				toast.error('Error sending test email')
			})
			.finally(() => setSending(false))
	}
	return (
		<div className='mt-5 divide-y divide-gray-900/10 px-4'>
			<Button onClick={() => handleTestEmail()} disabled={isSending}>
				{isSending ? 'Sending...' : 'Test Email'}
			</Button>
			<div className='py-8 first:pt-0 last:pb-0 lg:grid lg:grid-cols-12 lg:gap-8'>
				<dt className='text-base/7 font-semibold text-gray-900 lg:col-span-5'>
					SMTP Host
				</dt>
				<dd className='mt-4 lg:col-span-7 lg:mt-0'>
					<p className='text-base/7 text-gray-600'>{smtp.host}</p>
				</dd>
			</div>
			<div className='py-8 first:pt-0 last:pb-0 lg:grid lg:grid-cols-12 lg:gap-8'>
				<dt className='text-base/7 font-semibold text-gray-900 lg:col-span-5'>
					SMTP Port
				</dt>
				<dd className='mt-4 lg:col-span-7 lg:mt-0'>
					<p className='text-base/7 text-gray-600'>{smtp.port}</p>
				</dd>
			</div>
			<div className='py-8 first:pt-0 last:pb-0 lg:grid lg:grid-cols-12 lg:gap-8'>
				<dt className='text-base/7 font-semibold text-gray-900 lg:col-span-5'>
					SMTP Username
				</dt>
				<dd className='mt-4 lg:col-span-7 lg:mt-0'>
					<p className='text-base/7 text-gray-600'>{smtp.username}</p>
				</dd>
			</div>
			<div className='py-8 first:pt-0 last:pb-0 lg:grid lg:grid-cols-12 lg:gap-8'>
				<dt className='text-base/7 font-semibold text-gray-900 lg:col-span-5'>
					SMTP Encryption Type
				</dt>
				<dd className='mt-4 lg:col-span-7 lg:mt-0'>
					<p className='text-base/7 text-gray-600'>
						{Encryption[smtp.encryption_type as keyof typeof Encryption]}
					</p>
				</dd>
			</div>
			<div className='py-8 first:pt-0 last:pb-0 lg:grid lg:grid-cols-12 lg:gap-8'>
				<dt className='text-base/7 font-semibold text-gray-900 lg:col-span-5'>
					Recipient Email
				</dt>
				<dd className='mt-4 lg:col-span-7 lg:mt-0'>
					<p className='text-base/7 text-gray-600'>{smtp.recipient_email}</p>
				</dd>
			</div>
			<div className='py-8 first:pt-0 last:pb-0 lg:grid lg:grid-cols-12 lg:gap-8'>
				<dt className='text-base/7 font-semibold text-gray-900 lg:col-span-5'>
					Sender Email
				</dt>
				<dd className='mt-4 lg:col-span-7 lg:mt-0'>
					<p className='text-base/7 text-gray-600'>{smtp.sender_email}</p>
				</dd>
			</div>
		</div>
	)
}

export default DisplayEmailSettings
