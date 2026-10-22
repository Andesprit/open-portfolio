import { Marked, type MarkedExtension, type Tokens } from 'marked';

// Static ids rendered by the layout and shared components; headingOutline.test.mjs keeps this list complete.
export const PAGE_IDS = ['about', 'contact', 'error-title', 'portfolio-search', 'search-help', 'search-title'];

export interface OutlineEntry {
    id: string;
    text: string;
    children: { id: string; text: string }[];
}

const NAMED: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0' };

function decodeEntities(html: string): string {
    return html.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, entity: string) => {
        if (entity[0] !== '#') return NAMED[entity.toLowerCase()] ?? match;
        const hex = entity[1].toLowerCase() === 'x';
        const code = parseInt(entity.slice(hex ? 2 : 1), hex ? 16 : 10);
        return code <= 0x10ffff ? String.fromCodePoint(code) : match;
    });
}

const escapeAttr = (text: string) =>
    text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/**
 * Marked extension that gives every heading a unique id and permalink, and records the
 * outline from the same render. State resets on each parse, so repeated parses match.
 */
export function createHeadingOutline(reserved: string[] = PAGE_IDS) {
    let used = new Set<string>();
    let headings: { id: string; text: string; depth: number }[] = [];

    const extension: MarkedExtension = {
        hooks: {
            preprocess(markdown: string) {
                // Ids the author wrote in raw HTML keep working; headings pick another id.
                const authored = [...markdown.matchAll(/\sid\s*=\s*["']([^"']+)["']/gi)].map((m) => m[1]);
                used = new Set([...reserved, ...authored]);
                headings = [];
                return markdown;
            }
        },
        renderer: {
            heading(this: { parser: { parseInline(tokens: Tokens.Generic[]): string } }, { tokens, depth }: Tokens.Heading) {
                const inner = this.parser.parseInline(tokens);
                const text = decodeEntities(inner.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim();
                const slug =
                    text.toLowerCase().normalize('NFKC').replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '') || 'section';
                let id = slug;
                for (let n = 2; used.has(id); n++) id = `${slug}-${n}`;
                used.add(id);
                const label = text || 'Section';
                headings.push({ id, text: label, depth });
                return `<h${depth} id="${id}">${inner} <a class="heading-anchor" href="#${id}" aria-label="Link to section: ${escapeAttr(label)}">#</a></h${depth}>\n`;
            }
        }
    };

    // The two shallowest heading levels in use form the outline, so skipped levels still nest.
    function outline(): OutlineEntry[] {
        const [top, sub] = [...new Set(headings.map((h) => h.depth))].sort((a, b) => a - b);
        const entries: OutlineEntry[] = [];
        let parent: OutlineEntry | undefined;
        for (const { id, text, depth } of headings) {
            if (depth === top) entries.push((parent = { id, text, children: [] }));
            else if (depth === sub && parent) parent.children.push({ id, text });
            else if (depth === sub) entries.push({ id, text, children: [] });
        }
        return entries;
    }

    return { extension, outline };
}

export interface Passage {
    id?: string;
    heading?: string;
    text: string;
}

// Inline tags join their words; block tags separate them.
const toText = (html: string) =>
    decodeEntities(html.replace(/<\/?(?:a|b|code|del|em|i|mark|span|strong)\b[^>]*>/g, '').replace(/<[^>]*>/g, ' '))
        .replace(/\s+/g, ' ')
        .trim();

/**
 * Splits an article into the text under each heading, with the ids its page renders.
 * Each passage keeps only its own text, so search data grows with the article, not its depth.
 */
export function articlePassages(markdown: string): Passage[] {
    const html = new Marked().use(createHeadingOutline().extension).parse(markdown) as string;
    return html.split(/(?=<h[1-6] id=")/).flatMap((part) => {
        const heading = part.match(/^<h[1-6] id="([^"]+)">([\s\S]*?) <a class="heading-anchor"[^>]*>#<\/a><\/h[1-6]>/);
        const text = toText(heading ? part.slice(heading[0].length) : part);
        if (!heading) return text ? [{ text }] : [];
        return [{ id: heading[1], heading: toText(heading[2]), text }];
    });
}
