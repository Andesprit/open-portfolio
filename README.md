# Open Portfolio

**[View the live portfolio →](https://andesprit.com/open-portfolio/)**

Build a polished portfolio from one readable YAML file. Open Portfolio is a
SvelteKit template for developers and technical professionals who want a fast,
customizable portfolio without rebuilding the same site from scratch.

[Report an issue](https://github.com/Andesprit/open-portfolio/issues) ·
[Contribute](#contributing)

## Why Open Portfolio

- **One YAML config:** edit your profile, experience, skills, links, and section
  order in `src/content/data/portfolio-data.yaml`.
- **Markdown projects and posts:** add long-form work without touching a
  component.
- **Eight included themes:** choose from four light and four dark variants.
- **Flexible sections:** combine simple cards, linked cards, skill groups, and
  Markdown-backed collections.
- **Static and responsive:** SvelteKit generates a fast site that works across
  desktop, tablet, and mobile.
- **GitHub Pages ready:** every push to `main` validates, builds, and deploys the
  portfolio automatically.

## Quick start

You need Node.js 18 or newer.

```bash
git clone https://github.com/Andesprit/open-portfolio.git
cd open-portfolio
npm install
npm run dev
```

Open the local URL printed by Vite, then replace the sample content in:

```text
src/content/data/portfolio-data.yaml
```

Add profile images and icons under `static/`. Add projects, blog posts, or other
long-form content under `src/content/`.

## Configure your portfolio

The YAML file has three top-level groups:

```yaml
settings:
  name: Your Name
  title: Your Role
  bio: A short introduction.
  theme: ocean-dark
  basePath: /your-repository-name
  potrait_image: images/your-photo.jpg
  expertises:
    - TypeScript
    - Product engineering
  cards_before_pagination: 3

sections:
  - title: Experience
    type: cards_with_link
    content:
      - title: Senior Engineer
        organization: Example Company
        date: 2023 - Present
        description: What you built and why it mattered.
        link: https://example.com

social:
  - name: Github
    link: https://github.com/your-username
    icon: icons/github-icon.svg
```

### Settings

| Field                     | Purpose                                                |
| ------------------------- | ------------------------------------------------------ |
| `name`                    | Your name in the navigation, profile, and footer       |
| `title`                   | Your professional role                                 |
| `bio`                     | A short biography with Markdown support                |
| `theme`                   | One of the included theme names                        |
| `basePath`                | Repository path for GitHub Pages, such as `/portfolio` |
| `potrait_image`           | Profile image path under `static/`                     |
| `expertises`              | Skills displayed near your introduction                |
| `cards_before_pagination` | Initial number of cards per paginated section          |

Available themes are `light`, `ocean-light`, `forest-light`, `sunset-light`,
`dark`, `ocean-dark`, `forest-dark`, and `sunset-dark`.

### Section types

Open Portfolio includes four section layouts:

- `cards`: compact entries for certifications, awards, and publications.
- `cards_with_link`: descriptive entries with a destination, useful for
  experience and education.
- `cards_with_icons`: named skill groups with icons and tags.
- `cards_outside`: cards generated from Markdown files in a configured folder.

Reorder the entries under `sections` to reorder the page. Remove a section to
hide it, or add another section using one of the supported types.

## Add projects and custom pages

For a Markdown-backed section, point `path` at its content directory:

```yaml
- title: Projects
  type: cards_outside
  path: src/content/projects/
  truncation_limit: 150
```

Then create a Markdown file such as
`src/content/projects/my-project.md`:

```markdown
---
title: My Project
description: A concise explanation of the work.
date: 2026-07-23
tags:
  - SvelteKit
  - TypeScript
link: https://github.com/your-username/my-project
image: images/project-cover.jpg
---

# My Project

Tell the full story here.
```

Store that project’s images in `src/content/projects/images/`. You can create
additional collections—research, writing, talks, or anything else—by adding a
folder under `src/content/` and a matching `cards_outside` section.

## Validate and build

```bash
npm test
npm run check
npm run build
```

`npm test` verifies that the YAML configuration is readable and contains the
required top-level fields.

## Deploy to GitHub Pages

1. Fork or copy this repository.
2. Set `settings.basePath` in `portfolio-data.yaml` to
   `/<your-repository-name>`.
3. In the repository settings, open **Pages** and choose **GitHub Actions** as
   the source.
4. Push to `main`.

The included workflow validates and builds the site, then publishes the static
output. Future pushes deploy automatically.

## Project structure

```text
src/
├── content/
│   ├── data/portfolio-data.yaml
│   ├── projects/
│   └── blogs/
├── lib/components/
├── routes/
└── styles/
static/
├── images/
├── icons/
└── CV.pdf
```

## Contributing

Contributions are welcome. Open an issue for a bug or proposal, then send a
focused pull request. Before submitting:

```bash
npm test
npm run check
npm run build
```

## License

[MIT](LICENSE)
