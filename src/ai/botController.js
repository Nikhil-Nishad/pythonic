/**
 * BotController - Manages AI Rival Snake movement, path calculation, and battle state
 */
import { AStarPathfinder } from './pathfinding.js';

export class BotController {
    constructor(gridSize = 20) {
        this.gridSize = gridSize;
        this.reset();
    }

    reset() {
        const startX = 3;
        const startY = 3;
        this.body = [
            { x: startX, y: startY },
            { x: startX - 1, y: startY },
            { x: startX - 2, y: startY }
        ];
        this.direction = 'right';
        this.nextDirection = 'right';
        this.score = 0;
        this.color = '#ff6b9d';
        this.glow = 'rgba(255, 107, 157, 0.8)';
    }

    updateNextDirection(targetFood, obstacles = [], playerBody = []) {
        if (!targetFood) return;

        const start = this.body[0];
        const allBodies = [...this.body, ...playerBody];

        const path = AStarPathfinder.findPath(start, targetFood, this.gridSize, obstacles, allBodies);
        if (path && path.length > 0) {
            this.nextDirection = path[0];
        }
    }

    move(targetFood, obstacles = [], playerBody = []) {
        this.updateNextDirection(targetFood, obstacles, playerBody);
        this.direction = this.nextDirection;

        let dx = 0, dy = 0;
        if (this.direction === 'up') dy = -1;
        if (this.direction === 'down') dy = 1;
        if (this.direction === 'left') dx = -1;
        if (this.direction === 'right') dx = 1;

        const head = this.body[0];
        const newHead = { x: head.x + dx, y: head.y + dy };

        // Check grid boundary collision
        if (newHead.x < 0 || newHead.x >= this.gridSize ||
            newHead.y < 0 || newHead.y >= this.gridSize) {
            return { collided: true };
        }

        // Check self collision
        if (this.body.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
            return { collided: true };
        }

        // Check player collision
        if (playerBody.some(seg => seg.x === newHead.x && seg.y === newHead.y)) {
            return { collided: true };
        }

        this.body.unshift(newHead);

        // Check food eat
        let ateFood = false;
        if (targetFood && newHead.x === targetFood.x && newHead.y === targetFood.y) {
            this.score += 10;
            ateFood = true;
        } else {
            this.body.pop();
        }

        return { collided: false, ateFood: ateFood };
    }
}
