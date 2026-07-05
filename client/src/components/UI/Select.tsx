import { Select } from '@headlessui/react'

type SelectInputProps = {
	name: string
	label: string
	options: {
		label: string
		value: string
	}[]
}

const SelectInput = ({ label, name, options }: SelectInputProps) => {
	return (
		<div>
			<label
				htmlFor='country'
				className='block text-sm/6 font-medium text-gray-900'
			>
				{label}
			</label>
			<Select
				name={name}
				id={name}
				className='col-start-1 row-start-1 w-full cursor-pointer rounded-md bg-white py-1.5 pr-8 pl-3 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6'
			>
				{options.map((option) => {
					return <option value={option.value}>{option.label}</option>
				})}
			</Select>
		</div>
	)
}

export default SelectInput
