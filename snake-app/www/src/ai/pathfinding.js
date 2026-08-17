/**
 * Pathfinding - A* Grid Pathfinding algorithm for AI rival snake navigation
 */
export class AStarPathfinder {
    static findPath(start, target, gridSize, obstacles = [], snakeBodies = []) {
        if (!start || !target) return [];

        const isBlocked = (x, y) => {
            if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) return true;
            if (obstacles.some(obs => obs.x === x && obs.y === y)) return true;
            if (snakeBodies.some(seg => seg.x === x && seg.y === y)) return true;
            return false;
        };

        const heuristic = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);

        const openSet = [];
        const closedSet = new Set();
        const cameFrom = new Map();

        const gScore = new Map();
        const fScore = new Map();

        const key = (p) => `${p.x},${p.y}`;

        const startKey = key(start);
        gScore.set(startKey, 0);
        fScore.set(startKey, heuristic(start, target));

        openSet.push({ ...start, f: fScore.get(startKey) });

        while (openSet.length > 0) {
            openSet.sort((a, b) => a.f - b.f);
            const current = openSet.shift();
            const currentKey = key(current);

            if (current.x === target.x && current.y === target.y) {
                // Reconstruct path
                const path = [];
                let currKey = currentKey;
                while (cameFrom.has(currKey)) {
                    const prev = cameFrom.get(currKey);
                    path.unshift(prev.step);
                    currKey = prev.parentKey;
                }
                return path;
            }

            closedSet.add(currentKey);

            const neighbors = [
                { x: current.x, y: current.y - 1, dir: 'up' },
                { x: current.x, y: current.y + 1, dir: 'down' },
                { x: current.x - 1, y: current.y, dir: 'left' },
                { x: current.x + 1, y: current.y, dir: 'right' }
            ];

            for (const n of neighbors) {
                const nKey = key(n);
                if (closedSet.has(nKey) || isBlocked(n.x, n.y)) continue;

                const tentativeG = (gScore.get(currentKey) || 0) + 1;
                if (!gScore.has(nKey) || tentativeG < gScore.get(nKey)) {
                    cameFrom.set(nKey, { parentKey: currentKey, step: n.dir });
                    gScore.set(nKey, tentativeG);
                    const f = tentativeG + heuristic(n, target);
                    fScore.set(nKey, f);

                    if (!openSet.some(item => item.x === n.x && item.y === n.y)) {
                        openSet.push({ x: n.x, y: n.y, f: f });
                    }
                }
            }
        }

        // Fallback: return any valid open neighbor direction to avoid crashing
        const fallbackDirections = ['right', 'down', 'left', 'up'];
        for (const dir of fallbackDirections) {
            let dx = 0, dy = 0;
            if (dir === 'up') dy = -1;
            if (dir === 'down') dy = 1;
            if (dir === 'left') dx = -1;
            if (dir === 'right') dx = 1;

            if (!isBlocked(start.x + dx, start.y + dy)) {
                return [dir];
            }
        }

        return ['right'];
    }
}
