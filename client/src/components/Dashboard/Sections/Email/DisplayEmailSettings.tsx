import { Encryption, type Email } from '@/types/Email/Email'

const DisplayEmailSettings = ({ smtp }: { smtp: Email }) => {
	return (
		<div className='mt-5 divide-y divide-gray-900/10 px-4'>
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
