export interface SendMail<Context extends Record<string, unknown> = Record<string, unknown>> {
	to: string;
	subject: string;
	html?: string;
	template?: string;
	context?: Context;
}
