import type { IProject } from '../interfaces/IProject';

export interface GalleryImage {
    url: string;
    caption: string;
}

export class Project implements IProject {
    private _id: number;
    private _title: string;
    private _shortDescription: string;
    private _longDescription: string;
    private _technologies: string[];
    private _githubUrl: string;
    private _demoUrl: string;
    private _image: string;
    private _gallery: GalleryImage[];

    constructor(config: {
        id: number;
        title: string;
        shortDescription: string;
        longDescription: string;
        technologies: string[];
        githubUrl: string;
        demoUrl: string;
        image: string;
        gallery?: GalleryImage[];
    }) {
        this._id = config.id;
        this._title = config.title;
        this._shortDescription = config.shortDescription;
        this._longDescription = config.longDescription;
        this._technologies = config.technologies;
        this._githubUrl = config.githubUrl;
        this._demoUrl = config.demoUrl;
        this._image = config.image;
        this._gallery = config.gallery || [];
    }

    get id(): number { return this._id; }
    get title(): string { return this._title; }
    get shortDescription(): string { return this._shortDescription; }
    get longDescription(): string { return this._longDescription; }
    get technologies(): string[] { return this._technologies; }
    get githubUrl(): string { return this._githubUrl; }
    get demoUrl(): string { return this._demoUrl; }
    get image(): string { return this._image; }
    get gallery(): GalleryImage[] { return this._gallery; }

    public getTechStack(): string {
        return this.technologies.join(', ');
    }

    public hasLiveDemo(): boolean {
        return !!this.demoUrl;
    }
}
