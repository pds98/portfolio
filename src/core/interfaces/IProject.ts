import type { GalleryImage } from '../models/Project';

export interface IProject {
    id: number;
    title: string;
    shortDescription: string;
    longDescription: string;
    technologies: string[];
    githubUrl: string;
    demoUrl: string;
    image: string;
    gallery?: GalleryImage[];
}
