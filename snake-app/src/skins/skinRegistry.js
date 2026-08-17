/**
 * SkinRegistry - Defines visual themes, color palettes, and particle effects for Snake skins
 */
export const SKINS = {
    default: {
        id: 'default',
        name: 'Cyber Blue',
        icon: '🐍',
        unlocked: true,
        colors: {
            head: '#58a6ff',
            body: '#388bfd',
            tail: '#1f6feb',
            glow: 'rgba(88, 166, 255, 0.6)',
            particles: ['#58a6ff', '#a371f7', '#00d9ff']
        },
        description: 'The iconic modern cyberpunk aesthetic.'
    },
    neon_matrix: {
        id: 'neon_matrix',
        name: 'Matrix Code',
        icon: '💻',
        unlocked: false,
        unlockCriteria: 'Reach Score 100',
        requiredScore: 100,
        colors: {
            head: '#3fb950',
            body: '#238636',
            tail: '#2e7d32',
            glow: 'rgba(63, 185, 80, 0.8)',
            particles: ['#3fb950', '#2ea043', '#00ff66']
        },
        description: 'Hacker green digital matrix streams.'
    },
    dragon_fire: {
        id: 'dragon_fire',
        name: 'Dragon Blaze',
        icon: '🔥',
        unlocked: false,
        unlockCriteria: 'Reach Score 200',
        requiredScore: 200,
        colors: {
            head: '#f85149',
            body: '#da3633',
            tail: '#b62324',
            glow: 'rgba(248, 81, 73, 0.8)',
            particles: ['#f85149', '#d29922', '#ff7b72']
        },
        description: 'Fiery crimson and molten orange blaze.'
    },
    retro_pixel: {
        id: 'retro_pixel',
        name: 'Retro Arcade',
        icon: '👾',
        unlocked: false,
        unlockCriteria: 'Reach Level 3',
        requiredLevel: 3,
        colors: {
            head: '#a371f7',
            body: '#8957e5',
            tail: '#6e40c9',
            glow: 'rgba(163, 113, 247, 0.8)',
            particles: ['#a371f7', '#d29922', '#f0883e']
        },
        description: 'Vibrant 80s synthwave arcade neon.'
    },
    golden_royalty: {
        id: 'golden_royalty',
        name: 'Golden Empire',
        icon: '👑',
        unlocked: false,
        unlockCriteria: 'Reach Score 300',
        requiredScore: 300,
        colors: {
            head: '#ffd700',
            body: '#d29922',
            tail: '#9e6a03',
            glow: 'rgba(255, 215, 0, 0.9)',
            particles: ['#ffd700', '#ffffff', '#e3b341']
        },
        description: 'Shimmering pure gold fit for a ruler.'
    }
};

export class SkinRegistry {
    static getSkin(skinId) {
        return SKINS[skinId] || SKINS.default;
    }

    static getAllSkins() {
        return Object.values(SKINS);
    }
}
