export interface IAbout {
    name: string;
    title: string;
    description: string;
    image: string;
    resumeUrl?: string;
    socialLinks: {
        github?: string;
        linkedin?: string;
        twitter?: string;
        email: string;
    };
}
