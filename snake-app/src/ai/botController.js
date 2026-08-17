/**
 * BotController - Manages AI Rival Snake movement with adaptive difficulty system.
 * 
 * Difficulty Levels:
 *   - EASY   (score 0–199):    Random safe move 60% of the time; A* 40%
 *   - MEDIUM (score 200–499):  Random safe move 35% of the time; A* 65%
 *   - HARD   (score 500–999):  Random safe move 15% of the time; A* 85%
 *   - EXPERT (score 1000+):    Pure A* pathfinding with smart fallback
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
        // Difficulty tracks player score passed in from game
        this._playerScore = 0;
    }

    /**
     * Calculate current AI skill level based on player score.
     * Returns { astarProb, name, label }
     */
    _getDifficulty(playerScore) {
        if (playerScore >= 1000) return { astarProb: 1.00, name: 'Expert', label: '🔴 EXPERT' };
        if (playerScore >= 500)  return { astarProb: 0.85, name: 'Hard',   label: '🟠 HARD'   };
        if (playerScore >= 200)  return { astarProb: 0.65, name: 'Medium', label: '🟡 MEDIUM'  };
        return                          { astarProb: 0.40, name: 'Easy',   label: '🟢 EASY'    };
    }

    /**
     * Pick a random safe neighbor direction (not into wall or body).
     * Returns a direction string, or null if all neighbours are blocked.
     */
    _safeRandomDirection(obstacles, playerBody) {
        const head = this.body[0];
        const allBodies = [...this.body, ...playerBody];
        const dirs = ['up', 'down', 'left', 'right'];
        // Shuffle for randomness
        for (let i = dirs.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
        }
        for (const dir of dirs) {
            let dx = 0, dy = 0;
            if (dir === 'up')    dy = -1;
            if (dir === 'down')  dy =  1;
            if (dir === 'left')  dx = -1;
            if (dir === 'right') dx =  1;
            const nx = head.x + dx;
            const ny = head.y + dy;
            if (nx < 0 || nx >= this.gridSize || ny < 0 || ny >= this.gridSize) continue;
            if (allBodies.some(s => s.x === nx && s.y === ny)) continue;
            if (obstacles.some(o => o.x === nx && o.y === ny)) continue;
            return dir;
        }
        return null;
    }

    updateNextDirection(targetFood, obstacles = [], playerBody = [], playerScore = 0) {
        if (!targetFood) return;

        const diff = this._getDifficulty(playerScore);
        this._playerScore = playerScore;
        this.currentDifficulty = diff;

        // Decide: use A* or a random safe move based on difficulty probability
        const useAstar = Math.random() < diff.astarProb;

        if (useAstar) {
            const start = this.body[0];
            const allBodies = [...this.body, ...playerBody];
            const path = AStarPathfinder.findPath(start, targetFood, this.gridSize, obstacles, allBodies);
            if (path && path.length > 0) {
                this.nextDirection = path[0];
                return;
            }
        }

        // Fallback: random safe direction (simulates suboptimal routing)
        const safeFallback = this._safeRandomDirection(obstacles, playerBody);
        if (safeFallback) {
            this.nextDirection = safeFallback;
        }
        // If truly stuck, leave nextDirection unchanged
    }

    move(targetFood, obstacles = [], playerBody = [], playerScore = 0) {
        this.updateNextDirection(targetFood, obstacles, playerBody, playerScore);
        this.direction = this.nextDirection;

        let dx = 0, dy = 0;
        if (this.direction === 'up')    dy = -1;
        if (this.direction === 'down')  dy =  1;
        if (this.direction === 'left')  dx = -1;
        if (this.direction === 'right') dx =  1;

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

        return { collided: false, ateFood };
    }
}
