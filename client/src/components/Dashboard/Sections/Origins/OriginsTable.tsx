import { fetcher } from '@/util/SWR/fetch'
import { useState } from 'react'
import { toast } from 'react-toastify'
import useSWR from 'swr'
import dayjs from 'dayjs'
import type { Origin } from '@/types/Origins/Origin'

type GetOriginsResponse = {
	origins: Origin[]
}

const OriginsTable = () => {
	const [confirmation, setConfirmation] = useState<number | null>(null)
	const { data, error, mutate } = useSWR<GetOriginsResponse, Error>(
		'/api/origins',
		fetcher,
	)

	if (!data) return <div>Loading...</div>

	if (error) return <div>error</div>

	const { origins } = data

	const handleDeleteOrigin = (id: number) => {
		fetch(`/api/origins/${id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
		})
			.then((res) => {
				if (!res.ok) {
					throw new Error()
				}
				toast.success('Origin Deleted')
				mutate()
			})
			.catch((err) => {
				console.error(err)
				toast.error('Error: Please try again later')
			})
	}

	return (
		<div>
			<>
				<h1 className='pl-2.5 text-xl/7 font-semibold text-gray-900'>
					Origins
				</h1>

				<table className='relative w-full divide-y divide-gray-300'>
					<thead>
						<tr>
							<th
								scope='col'
								className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
							>
								Origin
							</th>
							<th
								scope='col'
								className='px-3 py-3.5 text-left text-sm font-semibold text-gray-900'
							>
								Date Added
							</th>

							<th scope='col' className='py-3.5 pr-4 pl-3'>
								<span className='sr-only'>Delete</span>
							</th>
						</tr>
					</thead>
					<tbody className='divide-y divide-gray-200'>
						{origins &&
							origins
								.sort((a, b) => a.created_at.localeCompare(b.created_at))
								.map((origin) => (
									<tr key={origin.id}>
										<td className='px-3 py-4 text-sm whitespace-nowrap text-gray-500'>
											{origin.origin}
										</td>

										<td className='px-3 py-4 text-sm whitespace-nowrap text-gray-500'>
											{dayjs(origin.created_at).format('DD-MMM-YYYY')}
										</td>
										<>
											{confirmation === origin.id ? (
												<td className='py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap'>
													<button
														onClick={() => handleDeleteOrigin(origin.id)}
														className='cursor-pointer text-red-600 hover:text-red-900'
													>
														Are you sure?
														<span className='sr-only'>, {origin.origin}</span>
													</button>
												</td>
											) : (
												<td className='py-4 pr-4 pl-3 text-right text-sm font-medium whitespace-nowrap'>
													<button
														onClick={() => setConfirmation(origin.id)}
														className='cursor-pointer text-red-600 hover:text-red-900'
													>
														Delete
														<span className='sr-only'>, {origin.origin}</span>
													</button>
												</td>
											)}
										</>
									</tr>
								))}
					</tbody>
				</table>
			</>
		</div>
	)
}

export default OriginsTable
