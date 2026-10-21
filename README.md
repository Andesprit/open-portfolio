# Open Portfolio

A fully customizable, modern portfolio website built with **SvelteKit** and **TypeScript**. Create your professional portfolio by simply editing a single JSON configuration file - no coding required!

## 📚 Table of Contents

- [🚀 Getting Started](#-getting-started)
- [✨ Features](#-features)
- [🃏 Card Types](#-card-types)
  - [1. Cards](#1-cards-cards)
  - [2. Cards with Links](#2-cards-with-links-cards_with_link)
  - [3. Cards with Icons](#3-cards-with-icons-cards_with_icons)
  - [4. Cards Outside](#4-cards-outside-cards_outside)
- [🎨 Available Themes](#-available-themes)
- [🔧 JSON Configuration](#-json-configuration)
- [📂 Project Structure](#-project-structure)
- [🔄 Section Ordering & Management](#-section-ordering--management)
- [📁 Custom Pages](#-custom-pages)
  - [Creating a new Project](#creating-a-new-project)
  - [Creating Custom Pages](#creating-custom-pages)
  - [Adding Images to Markdown Content](#adding-images-to-markdown-content)
  - [Removing Custom Pages](#removing-custom-pages)
- [⚙️ Settings Configuration](#️-settings-configuration)
- [📦 Deployment on GitHub Pages](#-deployment-on-github-pages)
- [🔧 Troubleshooting](#-troubleshooting)
- [📄 License](#-license)
- [🤝 Contributing](#-contributing)
- [📧 Support](#-support)

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 24 LTS (the version in `.nvmrc`, also used by the GitHub Pages workflow) and npm
- Git

### 1. Get the code

- **Just trying it locally?** Clone the template:

  ```bash
  git clone https://github.com/Andesprit/open-portfolio.git
  cd open-portfolio
  ```

- **Publishing your own portfolio?** Click **Fork** on [Andesprit/open-portfolio](https://github.com/Andesprit/open-portfolio), then clone your copy:

  ```bash
  git clone https://github.com/your-username/your-repository-name.git
  cd your-repository-name
  ```

  Your clone already pushes to your repository, so you do not need `git remote add`.

### 2. Install

```bash
npm ci
```

npm may print `npm warn install-scripts` lines about a few packages. The install still succeeded if it ends with `added ... packages`.

### 3. Personalize and watch it live

```bash
npm run dev
```

Open the address it prints (usually `http://localhost:5173/`). Development always runs at the root `/`, whatever `basePath` says.

- Change `settings.name` in `src/content/data/portfolio-data.json`; the page updates when you save.
- Edit or add an entry, for example `src/content/projects/open-portfolio.md` (see [Creating a new Project](#creating-a-new-project)).
- Put images in `static/images/`, icons in `static/icons/` and your resume at `static/CV.pdf`.

Problems in your JSON or Markdown appear as a notice on the page; see [Configuration feedback](#configuration-feedback).

### 4. Check your setup

```bash
npm run doctor
```

It reads your files without changing anything. It checks that the packages are installed, that `portfolio-data.json` is valid JSON and that `settings.basePath` has the right shape, and it lists your content warnings. When something blocks the build, it names the file, key or command that fixes it and exits with an error. It does not build or deploy; `npm run build` reports broken page links.

### 5. Build and preview the real site

Set `settings.basePath` to where the site will live:

| Your site address | `basePath` |
| --- | --- |
| `https://your-username.github.io/` (a repository named `your-username.github.io`) | `""` |
| A custom domain, such as `https://example.com/` | `""` |
| `https://your-username.github.io/your-repository-name/` (any other repository) | `"/your-repository-name"` |

Then:

```bash
npm run build
npm run preview
```

Open `http://localhost:4173` followed by your `basePath` and `/`, for example `http://localhost:4173/portfolio/` with the sample `"/portfolio"`, or `http://localhost:4173/` with `""`. `npm run doctor` prints this address for you. `4173` is the default port; if Vite prints another address, use that one. The root `/` shows "not found" when `basePath` is set; that is expected.

When the preview looks right, follow [Deployment on GitHub Pages](#-deployment-on-github-pages). A working preview does not prove that GitHub will deploy it; check the Actions tab after you push.

## ✨ Features

- 🎯 **Zero-code customization** through JSON configuration
- 🎨 **Multiple Themes**: 8 beautiful themes (4 light + 4 dark variants)
- 📱 **Fully Responsive**: Perfect on desktop, tablet, and mobile
- 🃏 **4 Card Types**: Different layouts for various content types
- 📄 **Blog & Project Support**: Markdown-based content management
- 📁 **Custom Pages**: Create unlimited custom sections with markdown content
- 🚀 **Fast & Optimized**: Built with SvelteKit for optimal performance
- 📱 **Modern UI/UX**: Clean, professional design with smooth animations

## 🃏 Card Types

The portfolio supports four distinct card layouts, each with specific data requirements:

### 1. **Cards** (`cards`)

Basic cards for certifications, awards, or simple listings.

**Data Fields:**

- `title` _(required)_
- `organization` _(optional)_
- `date` _(optional)_
- `description` _(optional)_
- `link` _(optional)_
- `icon` _(optional)_
- `truncation_limit` _(optional)_ - Character limit for descriptions (defaults to 150)

### 2. **Cards with Links** (`cards_with_link`)

Enhanced cards with prominent action buttons for experience and education.

**Data Fields:**

- `title` _(required)_
- `organization` _(optional)_
- `date` _(optional)_
- `description` _(optional)_
- `link` _(optional)_
- `icon` _(optional)_
- `truncation_limit` _(optional)_ - Character limit for descriptions (defaults to 150)

### 3. **Cards with Icons** (`cards_with_icons`)

Specialized cards for skills and technical expertise with tag-based listings.

**Data Fields:**

- `name` _(required)_
- `skills` _(required)_ - Array of skill names
- `icon` _(optional)_

### 4. **Cards Outside** (`cards_outside`)

Dynamic cards that load content from markdown files.

**Configuration:**

- `path` _(required)_ - Directory path to markdown files
- `title` _(required)_ - Section title
- `type` _(required)_ - Must be `"cards_outside"`
- `truncation_limit` _(optional)_ - Character limit for descriptions (defaults to 150)

**Markdown File Requirements:**

- `title` _(required)_
- `description` _(required)_
- `date` _(required)_
- `tags` _(optional)_
- `link` _(optional)_
- `image` _(optional)_
- `skip` _(optional)_ - Boolean if True skip page and redirect to `link`
- `display_order` _(optional)_ Defaults to order by date

## 🎨 Available Themes

### Light Themes

- **Light**: Clean and professional
- **Ocean Light**: Blue oceanic tones
- **Forest Light**: Green nature-inspired
- **Sunset Light**: Warm red accents

### Dark Themes

- **Dark**: Elegant dark mode
- **Ocean Dark**: Deep blue darkness
- **Forest Dark**: Rich forest greens
- **Sunset Dark**: Dramatic red highlights

## 🔧 JSON Configuration

The entire portfolio is configured through `src/content/data/portfolio-data.json`. This single file controls everything from content to styling.

### JSON Architecture

```json
{
  "sections": [
    {
      "title": "Section Name",
      "type": "card_type",
      "content": [...],
      "truncation_limit": 150
    }
  ],
  "settings": {
    "name": "Your Name",
    "title": "Your Title",
    "bio": "Your bio...",
    "theme": "theme-name",
    "basePath": "/your-repository-name",
    "potrait_image": "path/to/image.png",
    "expertises": ["skill1", "skill2"],
    "cards_before_pagination": 3
  },
  "social": [
    {
      "name": "Platform",
      "link": "URL",
      "icon": "path/to/icon.svg"
    }
  ]
}
```

### Section Configuration

Each section in the `sections` array supports:

- **`title`**: Section heading _(required)_
- **`type`**: Card type (`cards`, `cards_with_link`, `cards_with_icons`, `cards_outside`) _(required)_
- **`content`**: Array of items (for static content) _(required for static types)_
- **`path`**: Directory path (for `cards_outside` type) _(required for cards_outside)_
- **`truncation_limit`**: Character limit for descriptions _(optional)_

### Content Structure by Card Type

#### For `cards` and `cards_with_link`:

```json
{
	"title": "Position/Title",
	"organization": "Company/Institution",
	"date": "Time period",
	"description": "Detailed description",
	"link": "https://example.com",
	"icon": "icons/my-icon.svg"
}
```

#### For `cards_with_icons`:

```json
{
	"name": "Category Name",
	"icon": "icons/my-icon.svg",
	"skills": ["skill1", "skill2", "skill3"]
}
```

#### For `cards_outside`:

```json
{
	"path": "src/content/projects/",
	"title": "Projects",
	"type": "cards_outside"
}
```

### Configuration feedback

`npm run dev` and `npm run build` check `src/content/data/portfolio-data.json` for unsupported themes or card types, missing owner names or section titles, duplicate section anchors, likely key typos, missing markdown folders, and missing local images or icons in `static/`. Messages name the JSON field, its value, and a suggested fix. For example, `settings.portrait_image` suggests the existing key `potrait_image`; keep that spelling for compatibility.

Markdown frontmatter is checked too; see [Fixing frontmatter mistakes](#fixing-frontmatter-mistakes). Every warning starts with the file to edit.

During development, a collapsible notice shows the same warnings on the page. Saving the JSON or a Markdown file (or adding, deleting or renaming one) reruns the checks, refreshes the page, and removes the notice when the problems are fixed. This notice is excluded from production builds.

These checks warn and let the build continue, leaving your JSON unchanged. Custom keys are allowed; only likely key typos are flagged. External image URLs and empty optional icons are allowed. Invalid JSON syntax, broken page links and other rendering errors can still fail the build. Missing local assets keep the existing warning-only policy.

A missing owner name uses "Portfolio" in navigation. Sections without a usable title are skipped until fixed; the warning tells you which title to add.

## 📂 Project Structure


```
src/
├── content/
│   ├── data/
│   │   └── portfolio-data.json    # Main configuration
│   ├── projects/                  # Markdown project files
│   ├── blogs/                     # Markdown blog files
│   └── custom-section/            # Custom section files (optional)
├── lib/
│   ├── components/
│   │   ├── sections/Cards/        # Card components
│   │   └── common/                # Shared components
│   └── utils/                     # Utility functions
├── routes/                        # SvelteKit routes
└── styles/                        # CSS and themes
static/                            # Static assets
├── images/                        # Profile photos and other images
├── icons/                         # Icon files (.svg, .png, etc.)
└── CV.pdf                         # Resume/CV file
```

## 🔄 Section Ordering & Management

### Adding Sections

Simply add a new object to the `sections` array in `portfolio-data.json`:

```json
{
  "sections": [
    {
      "title": "New Section",
      "type": "cards",
      "content": [...]
    }
  ]
}
```

### Removing Sections

Delete the corresponding object from the `sections` array.

### Reordering Sections

Change the order of objects in the `sections` array - the portfolio will automatically reflect the new order.

## 📁 Custom Pages

### Creating a new Project

**Add a project file**: `src/content/projects/my-app.md`

```markdown
---
title: 'My Mobile App'
description: 'A React Native app for task management'
date: '01-15-2024'
tags: ['React Native', 'Mobile', 'TypeScript']
link: 'https://github.com/username/my-app'
image: 'images/app-screenshot.png'
---

# My Mobile App

This is a comprehensive task management application built with React Native...

![App interface](images/interface.jpg)
```

### Fixing frontmatter mistakes

The fields between the `---` lines are checked by `npm run dev` and `npm run build`, the same way as `portfolio-data.json`. Each warning starts with the Markdown file to edit. For example, `tags: 42` prints:

```
src/content/projects/my-app.md: tags: 42 is not supported. Use a comma-separated list (tags: TypeScript, Svelte) or brackets (tags: [TypeScript, Svelte]). Using the single tag "42" for now.
```

Change the line to `tags: ['42']` (or real tags) and save; the warning and the development notice clear. Other mistakes work the same way:

- A value of the wrong kind uses a safe fallback and says which one: a `link` or `image` that is not quoted text is left out, `skip` must be `true` or `false`, `skip: true` without a `link` shows the page, and `display_order` must be a number.
- Frontmatter that cannot be read at all, such as `title: Part 1: Setup` (an unquoted `:`), names the line and column. That one entry is left out of the site, search and Next links until you fix it, for example with `title: "Part 1: Setup"`. The rest of the folder still publishes.

### Creating Custom Pages

You can create unlimited custom routes beyond projects and blogs:

1. **Create a new folder** in `src/content/` (e.g., `src/content/research/`)
2. **Add markdown files** with metadata to your folder
3. **Add images folder** (optional): Create an `images/` subfolder within your section folder
4. **Add the section** to your `portfolio-data.json`:
   ```json
   {
   	"path": "src/content/research/",
   	"title": "Research",
   	"type": "cards_outside",
   	"truncation_limit": 120
   }
   ```

The system will automatically discover and display all markdown files in your custom folder!

### Adding Images to Markdown Content

**Image Storage:**

- Create an `images/` folder inside your content section (e.g., `src/content/research/images/`)
- Place your images in this folder

**Using Images in Markdown:**

```markdown
---
title: 'My Research Project'
image: 'images/project-cover.jpg' # Displayed on card and page header
---

# My Research Project

![Project diagram](images/diagram.png)
![Results chart](images/results.jpg)
```

**Image Display:**

- **Card Preview**: Adding `image` in frontmatter displays it on the card in the grid view
- **Page Header**: The same image appears as a header when opening the full page
- **Content Images**: Use standard markdown syntax for images within the content

### Removing Custom Pages

To delete a custom route section:

1. **Remove from JSON**: Delete the section object from `portfolio-data.json`
2. **Delete folder** (optional): Remove the entire content folder (e.g., `src/content/research/`)

**To remove individual pages** within a section:

- Simply delete the specific `.md` file from the folder
- The system will automatically update the section

## ⚙️ Settings Configuration

The `settings` object in `portfolio-data.json` controls global portfolio behavior, appearance, and metadata.

### Complete Settings Structure

```json
{
	"settings": {
		"name": "Your Full Name",
		"title": "Your Professional Title",
		"bio": "Your professional bio in markdown format",
		"theme": "light",
		"basePath": "/your-repository-name",
		"potrait_image": "images/your-photo.jpg",
		"expertises": ["skill1", "skill2", "skill3"],
		"cards_before_pagination": 3
	}
}
```

### Settings Breakdown

- **`name`** _(required)_ - Your full name displayed in navigation, footer, and about section
- **`title`** _(required)_ - Your professional title shown prominently in the about section
- **`bio`** _(required)_ - Your professional biography (supports markdown formatting)
- **`theme`** _(optional)_ - Select any of the 8 available themes (defaults to "light")
  - Light themes: `"light"`, `"ocean-light"`, `"forest-light"`, `"sunset-light"`
  - Dark themes: `"dark"`, `"ocean-dark"`, `"forest-dark"`, `"sunset-dark"`
- **`basePath`** _(optional, defaults to `""`)_ - Where the production site lives; development ignores it and always runs at `/`
  - Site at the root of its address (`your-username.github.io` repository or a custom domain): `""`
  - GitHub project site (`https://your-username.github.io/your-repository-name/`): `"/your-repository-name"`, with a leading `/` and no trailing `/`
  - See the table in [Build and preview the real site](#5-build-and-preview-the-real-site); `npm run doctor` checks the shape
- **`potrait_image`** _(required)_ - Path to your profile photo (place image in `static/images/`)
  - Example: Place `profile.jpg` in `static/images/` and use `"images/profile.jpg"`
- **`expertises`** _(optional)_ - Array of your key skills displayed as tags in the about section
  - Recommended: 4-8 skills for optimal visual balance
  - Example: `["JavaScript", "React", "Node.js", "Python"]`
- **`cards_before_pagination`** _(optional)_ - Number of cards shown before pagination (defaults to 3)

## 📦 Deployment on GitHub Pages

The included workflow (`.github/workflows/deploy.yml`) builds the site with the Node version in `.nvmrc` and publishes it to GitHub Pages on every push to `main`.

### Step 1: Have your own repository

If you followed [Get the code](#1-get-the-code) for publishing, your clone already points at your repository; go to Step 2.

If you cloned `Andesprit/open-portfolio` to try it, create an empty **public** repository on GitHub, then point your clone at it. `origin` already exists, so replace its address instead of adding a new one:

```bash
git remote set-url origin https://github.com/your-username/your-repository-name.git
```

### Step 2: Set `basePath` and preview

Set `settings.basePath` from the table in [Build and preview the real site](#5-build-and-preview-the-real-site) (for example `"/your-repository-name"`), then run `npm run doctor`, `npm run build` and `npm run preview` and open the address `npm run doctor` prints.

### Step 3: Enable GitHub Pages

1. Go to your repository **Settings**
2. Navigate to the **Pages** section
3. Set the source to **GitHub Actions**

![Actions](static/images/actions.jpg)

### Step 4: Push

```bash
git branch -M main   # only if your branch is called master
git add .
git commit -m "My portfolio"
git push origin main
```

Open the **Actions** tab and wait for the workflow to finish. A green run shows your site address, `https://your-username.github.io/your-repository-name/` for a project site. Every later push to `main` redeploys.

## 🔧 Troubleshooting

Run `npm run doctor` first. It names the file, key or command to fix:

| Message | Fix |
| --- | --- |
| `package(s) are not installed` | Run `npm ci`, then `npm run doctor` again. |
| `portfolio-data.json is not valid JSON: ... (line L column C)` | Open `src/content/data/portfolio-data.json` at that line; a trailing comma or a missing quote is the usual cause. |
| `settings.basePath is "portfolio"` | Use `""` or `"/portfolio"`: a leading `/` and no trailing `/`. |
| `Warning: ...` | The build still works. Fix the file named at the start of the warning; see [Configuration feedback](#configuration-feedback). |

The preview or live site shows "not found" or unstyled pages:

- The address must include `basePath`: `http://localhost:4173/your-repository-name/`, not `http://localhost:4173/`.
- `basePath` must match where GitHub serves the site. A project site needs `"/your-repository-name"` with the exact repository name; a `your-username.github.io` repository or a custom domain needs `""`.

`npm run build` fails although `npm run doctor` is ready:

- `Missing file ...` lines are only warnings. A real failure such as `404 /your-repository-name/projects/...` means a link to a page that does not exist; fix that link in the JSON or Markdown named in the message.

The GitHub deployment fails:

1. Open the **Actions** tab and click the failed run (red X).
2. Read the first error in the log. Fix it locally, confirm with `npm run doctor`, `npm run build` and `npm run preview`, and push again.
3. If **Deploy to GitHub Pages** fails, check that Settings > Pages uses **GitHub Actions** as its source. Use **Re-run jobs** only after fixing the cause, or for a temporary GitHub error.

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

If you have any questions or need help setting up your portfolio, please open an issue on GitHub.

---
