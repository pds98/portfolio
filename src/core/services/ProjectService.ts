import { Project } from '../models/Project';

export class ProjectService {
    private static instance: ProjectService;
    private projects: Project[] = [];

    private constructor() {
        // Singleton pattern
    }

    public static getInstance(): ProjectService {
        if (!ProjectService.instance) {
            ProjectService.instance = new ProjectService();
        }
        return ProjectService.instance;
    }

    public addProject(project: Project): void {
        this.projects.push(project);
    }

    public getProjects(): Project[] {
        return [...this.projects];
    }

    public getProjectById(id: number): Project | undefined {
        return this.projects.find(project => project.id === id);
    }
}
