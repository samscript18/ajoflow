export interface RegistrationDto {
	email: string;
	password: string;
	firstName: string;
	lastName: string;
	userName: string;
	bio?: string;
	profileImage?: string;
}
