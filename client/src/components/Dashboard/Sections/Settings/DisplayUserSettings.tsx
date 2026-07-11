import { useAppSelector } from '@/redux/hooks'
import dayjs from 'dayjs'

const DisplayUserSettings = () => {
	const user = useAppSelector((state) => state.user)
	return (
		<div className='mt-5 divide-y divide-gray-900/10 px-4'>
			<div className='py-8 first:pt-0 last:pb-0 lg:grid lg:grid-cols-12 lg:gap-8'>
				<dt className='text-base/7 font-semibold text-gray-900 lg:col-span-5'>
					Email
				</dt>
				<dd className='mt-4 lg:col-span-7 lg:mt-0'>
					<p className='text-base/7 text-gray-600'>{user?.email}</p>
				</dd>
			</div>
			<div className='py-8 first:pt-0 last:pb-0 lg:grid lg:grid-cols-12 lg:gap-8'>
				<dt className='text-base/7 font-semibold text-gray-900 lg:col-span-5'>
					Role
				</dt>
				<dd className='mt-4 lg:col-span-7 lg:mt-0'>
					<p className='text-base/7 text-gray-600'>{user?.role}</p>
				</dd>
			</div>
			<div className='py-8 first:pt-0 last:pb-0 lg:grid lg:grid-cols-12 lg:gap-8'>
				<dt className='text-base/7 font-semibold text-gray-900 lg:col-span-5'>
					User Created
				</dt>
				<dd className='mt-4 lg:col-span-7 lg:mt-0'>
					<p className='text-base/7 text-gray-600'>
						{dayjs(user?.created_at).format('D-MMM-YYYY')}
					</p>
				</dd>
			</div>
		</div>
	)
}

export default DisplayUserSettings
