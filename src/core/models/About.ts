import type { IAbout } from '../interfaces/IAbout';

export class About implements IAbout {
    private _name: string;
    private _title: string;
    private _description: string;
    private _image: string;
    private _resumeUrl?: string;
    private _socialLinks: {
        github?: string;
        linkedin?: string;
        twitter?: string;
        email: string;
    };

    constructor(
        name: string,
        title: string,
        description: string,
        image: string,
        socialLinks: { github?: string; linkedin?: string; twitter?: string; email: string },
        resumeUrl?: string
    ) {
        this._name = name;
        this._title = title;
        this._description = description;
        this._image = image;
        this._socialLinks = socialLinks;
        this._resumeUrl = resumeUrl;
    }

    get name(): string { return this._name; }
    get title(): string { return this._title; }
    get description(): string { return this._description; }
    get image(): string { return this._image; }
    get resumeUrl(): string | undefined { return this._resumeUrl; }
    get socialLinks(): { github?: string; linkedin?: string; twitter?: string; email: string } {
        return { ...this._socialLinks };
    }
}
