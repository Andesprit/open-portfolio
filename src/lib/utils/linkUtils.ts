export function getAbsoluteLink(link: string, base: string): string {
	if (!link || /^(?:[a-z][a-z\d+.-]*:|[/#?])/i.test(link)) return link;
	return `${base}/${link.replace(/^\.\//, '')}`;
}
