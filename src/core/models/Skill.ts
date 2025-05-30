import type { ISkill } from '../interfaces/ISkill';

export class Skill implements ISkill {
    private _id: number;
    private _name: string;
    private _level: number;
    private _category: 'frontend' | 'backend' | 'tools' | 'soft';
    private _icon?: string;

    constructor(id: number, name: string, level: number, category: 'frontend' | 'backend' | 'tools' | 'soft', icon?: string) {
        this._id = id;
        this._name = name;
        this._level = level;
        this._category = category;
        this._icon = icon;
        this.validateLevel();
    }

    get id(): number { return this._id; }
    get name(): string { return this._name; }
    get level(): number { return this._level; }
    get category(): 'frontend' | 'backend' | 'tools' | 'soft' { return this._category; }
    get icon(): string | undefined { return this._icon; }

    private validateLevel(): void {
        if (this._level < 0 || this._level > 100) {
            throw new Error('Skill level must be between 0 and 100');
        }
    }

    public getLevelCategory(): 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert' {
        if (this._level < 25) return 'Beginner';
        if (this._level < 50) return 'Intermediate';
        if (this._level < 75) return 'Advanced';
        return 'Expert';
    }
}
