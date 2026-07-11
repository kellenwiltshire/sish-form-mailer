import type { HTMLInputTypeAttribute } from 'react'

type InputProps = {
	name: string
	id: string
	type: HTMLInputTypeAttribute
	placeholder: string
	label: string
	value?: string | number | undefined
	required?: boolean
}

const Input = ({
	name,
	id,
	type,
	placeholder,
	label,
	value,
	required = false,
}: InputProps) => {
	return (
		<div>
			<label
				htmlFor={name}
				className='block text-sm/6 font-medium text-gray-900'
			>
				{label}
			</label>
			<div className='mt-2'>
				<input
					id={id}
					name={name}
					type={type}
					placeholder={placeholder}
					value={value}
					required={required}
					className='block w-full rounded-md bg-white px-3 py-1.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6'
				/>
			</div>
		</div>
	)
}

export default Input
