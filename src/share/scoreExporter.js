/**
 * ScoreExporter - Generates a styled canvas victory image badge for downloading and social sharing
 */
export class ScoreExporter {
    static generateVictoryCard(score, level, length, playerRank = 'Top 10') {
        const width = 600;
        const height = 400;
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // Background dark gradient
        const bgGrad = ctx.createLinearGradient(0, 0, width, height);
        bgGrad.addColorStop(0, '#0d1117');
        bgGrad.addColorStop(1, '#161b22');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, width, height);

        // Border glow
        ctx.strokeStyle = '#58a6ff';
        ctx.lineWidth = 6;
        ctx.strokeRect(10, 10, width - 20, height - 20);

        // Title
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px "Space Grotesk", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText('🐍 SNAKE GAME VICTORY CARD', width / 2, 70);

        // Subtitle
        ctx.fillStyle = '#58a6ff';
        ctx.font = '600 18px "JetBrains Mono", monospace';
        ctx.fillText(`Rank: ${playerRank} Player`, width / 2, 105);

        // Score Box
        ctx.fillStyle = '#21262d';
        ctx.fillRect(50, 140, 500, 140);
        ctx.strokeStyle = '#30363d';
        ctx.lineWidth = 2;
        ctx.strokeRect(50, 140, 500, 140);

        // Stats inside box
        ctx.fillStyle = '#ffd700';
        ctx.font = 'bold 48px "JetBrains Mono", monospace';
        ctx.fillText(`${score} PTS`, width / 2, 210);

        ctx.fillStyle = '#8b949e';
        ctx.font = '16px "Space Grotesk", sans-serif';
        ctx.fillText(`Level Reached: ${level}  |  Snake Length: ${length}`, width / 2, 250);

        // Footer Branding
        ctx.fillStyle = '#8b949e';
        ctx.font = '14px "Space Grotesk", sans-serif';
        ctx.fillText('Play online at pythonics.vercel.app', width / 2, 355);

        return canvas.toDataURL('image/png');
    }

    static downloadVictoryCard(score, level, length) {
        const dataUrl = this.generateVictoryCard(score, level, length);
        const link = document.createElement('a');
        link.download = `snake-high-score-${score}.png`;
        link.href = dataUrl;
        link.click();
    }
}
