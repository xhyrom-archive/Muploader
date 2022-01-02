export function strToBool(string): boolean  {
	const regex = /^\s*(true|1|on)\s*$/i;
	return regex.test(string);
}