import type { Theme } from "$lib/stores/themeStore";

export interface Metadata {
    date: string;
    title: string;
    link: string;
    tags: string[] | string;
    description: string;
    skip: boolean;
    display_order?: number;
    image?: string;
}

export type ContentListItem = {
    slug: string;
    metadata: Metadata;
    rawContent: string;
};

interface BaseContentItem {
    [key: string]: any;
}

interface Section {
    path?: string;
    title: string;
    type: string;
    content?: BaseContentItem[];
    truncation_limit?: number;
}

export interface Skill {
    name: string;
    description: string;
    icon: string;
    skills: string[];
}

interface Settings {
    basePath: string;
    theme: Theme;
    name: string;
    title: string;
    bio: string;
    potrait_image: string;
    expertises: string[];
    [key: string]: any;
}

export interface PortfolioData {
    settings: Settings;
    sections: Section[];
    social: BaseContentItem[];
    [key: string]: any;
}

export interface PortfolioSection {
    path?: string;
    title: string;
    route?: string;
    type: string;
    content?: BaseContentItem[];
    truncation_limit?: number;
}

export interface ContentSection {
    content: BaseContentItem[];
    tags: string[];
}

export interface ContentItem {
    slug: string;
    type: string;
    metadata: Metadata;
    html: string;
    nextItem?: ContentReference;
}

export interface ContentReference {
    slug: string;
    title: string;
    type: string;
}

export interface MarkdownContent {
    slug: string;
    metadata: Metadata;
    html: string;
}

export interface PageData {
    content: {
        [sectionName: string]: ContentSection;
    };
}