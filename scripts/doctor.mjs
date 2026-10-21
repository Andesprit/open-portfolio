// Read-only setup check: `npm run doctor`. It never writes files, installs, builds, starts a server or deploys.
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const usage = `Usage: npm run doctor

Checks that this portfolio is ready for "npm run build":
  - the packages from package.json are installed
  - src/content/data/portfolio-data.json exists and is valid JSON
  - settings.basePath is "" (site root) or "/name" (a sub-path)
  - your content, with the same warnings "npm run dev" shows
It does not build, preview or deploy. Page-link errors are reported by "npm run build".`;
const dataFile = 'src/content/data/portfolio-data.json';
const root = process.cwd();

/** @param {string} message */
function stop(message) {
	console.error(`Not ready: ${message}`);
	process.exit(1);
}
/** @param {unknown} value */
const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

const args = process.argv.slice(2);
if (args.some((arg) => arg === '--help' || arg === '-h')) {
	console.log(usage);
	process.exit(0);
}
if (args.length) {
	console.error(`Unknown option "${args[0]}".\n\n${usage}`);
	process.exit(2);
}

let pkg;
try { pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')); }
catch { stop('package.json is missing or invalid here. Run "npm run doctor" from the portfolio folder.'); }
const missing = Object.keys({ ...pkg.dependencies, ...pkg.devDependencies })
	.filter((name) => !existsSync(join(root, 'node_modules', name, 'package.json')));
if (missing.length) {
	stop(`${missing.length} package(s) are not installed (${missing.slice(0, 3).join(', ')}${missing.length > 3 ? ', ...' : ''}). Run "npm ci" (or "npm install"), then run "npm run doctor" again.`);
}

let data;
try { data = JSON.parse(readFileSync(join(root, dataFile), 'utf8')); }
catch (e) {
	const error = /** @type {NodeJS.ErrnoException} */ (e);
	if (error.code === 'ENOENT') stop(`${dataFile} is missing. Restore it from the template (git checkout -- ${dataFile}) and edit it.`);
	if (error.code) stop(`${dataFile} could not be read (${error.code}). Check that you have permission to read it.`);
	stop(`${dataFile} is not valid JSON: ${error.message}. Fix that spot; a trailing comma or a missing quote is the usual cause.`);
}
if (!isObject(data)) stop(`${dataFile} must contain one JSON object ({ "settings": {...}, "sections": [...], "social": [...] }), not ${JSON.stringify(data)?.slice(0, 40)}.`);
if (!isObject(data.settings)) stop(`${dataFile}: "settings" must be an object such as { "name": "Your Name", "basePath": "" }.`);
// Only an omitted basePath means the root; SvelteKit rejects an explicit null.
const base = data.settings.basePath === undefined ? '' : data.settings.basePath;
if (typeof base !== 'string' || (base !== '' && (!base.startsWith('/') || base.endsWith('/')))) {
	stop(`${dataFile}: settings.basePath is ${JSON.stringify(base)}. Use "" when the site is served at the root of its address (username.github.io or a custom domain), or "/repository-name" for a GitHub project site: it must start with "/" and must not end with "/".`);
}

let warnings;
try {
	const { readPortfolioWarnings } = await import('../src/lib/server/portfolioValidation.js');
	warnings = readPortfolioWarnings(root);
} catch (e) {
	stop(`your content could not be checked (${e instanceof Error ? e.message : e}). Run "npm ci" to repair the installed packages, then try again.`);
}
for (const warning of warnings) console.warn(`Warning: ${warning}`);
console.log(`Ready to build. Checked: installed packages, ${dataFile}, settings.basePath and your content.`);
if (warnings.length) console.log(`${warnings.length} warning(s) above. They do not stop the build, but those parts may look wrong or be hidden until you fix them.`);
console.log(`Production base path: ${base ? `"${base}"` : '"" (site root)'}. The production preview opens at ${base}/ and the live site at <your address>${base}/.`);
console.log(`Next: npm run build, then npm run preview and open http://localhost:4173${base}/ (the default address; if Vite prints another one, use that).`);
console.log('This check did not build, preview or deploy anything.');
