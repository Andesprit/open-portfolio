import type { PortfolioData } from '../types/types';

type Social = PortfolioData['social'][number];

// Owners may write the email entry as "a@b.test" or "mailto:a@b.test?subject=Hi".
const withoutScheme = (link: string): string => link.trim().replace(/^mailto:/i, '');

export const emailAddress = (link: string): string => withoutScheme(link).split('?')[0];

export const mailtoHref = (link: string): string => `mailto:${withoutScheme(link)}`;

export const findSocial = (social: Social[], name: string): Social | undefined =>
	social.find((item) => item.name?.toLowerCase() === name && item.link?.trim());

export async function copyText(text: string): Promise<boolean> {
	try {
		await navigator.clipboard.writeText(text);
		return true;
	} catch {
		return false;
	}
}
