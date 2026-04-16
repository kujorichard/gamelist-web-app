export type GamePlatform = 'all' | 'browser' | 'windows';

export type GameSortBy = 'release-date' | 'popularity' | 'alphabetical' | 'relevance';

export interface GameScreenshot {
    id: number;
    image: string;
}

export interface MinimumSystemRequirements {
    os: string;
    processor: string;
    memory: string;
    graphics: string;
    storage: string;
}

export interface GameSummary {
    id: number;
    title: string;
    thumbnail: string;
    short_description: string;
    game_url: string;
    genre: string;
    platform: string;
    publisher: string;
    developer: string;
    release_date: string;
    freetogame_profile_url: string;
}

export interface GameDetails extends GameSummary {
    description: string;
    screenshots: GameScreenshot[];
    minimum_system_requirements: MinimumSystemRequirements | null;
    status: string;
}

export interface GamesByTagQuery {
    tag: string;
    platform?: GamePlatform;
    sortBy?: GameSortBy;
}

export interface GamesByPlatformCategoryQuery {
    platform?: GamePlatform;
    category?: string;
    sortBy?: GameSortBy;
}