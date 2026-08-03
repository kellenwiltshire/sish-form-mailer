export enum Scope {
	ADMIN = 'admin',
	SUPER_ADMIN = 'super_admin',
	USER = 'user',
}

export type User = {
	created_at: string
	email: string
	id: number
	role: Scope
	password?: string
	num_forms: number
}
