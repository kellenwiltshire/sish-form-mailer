export type User = {
	created_at: string
	email: string
	id: number
	role: 'admin' | 'user'
	password?: string
}
