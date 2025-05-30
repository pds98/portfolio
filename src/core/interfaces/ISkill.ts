export interface ISkill {
    id: number;
    name: string;
    level: number; // 0-100
    category: 'frontend' | 'backend' | 'tools' | 'soft';
    icon?: string;
}
