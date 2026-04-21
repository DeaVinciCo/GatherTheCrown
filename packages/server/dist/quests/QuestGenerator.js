export class QuestGenerator {
    static generate(playerLevel, area) {
        const objectiveCount = Math.min(3, Math.max(1, Math.floor(playerLevel / 10) + 1));
        const objectives = [];
        for (let i = 1; i <= objectiveCount; i++) {
            const target = playerLevel * i;
            objectives.push({
                id: `${area}-${i}`,
                description: `Defeat ${target} enemies in ${area}`,
                target,
                progress: 0
            });
        }
        return {
            id: `${area}-${playerLevel}-${Date.now()}`,
            name: `${area} Quest`,
            area,
            level: playerLevel,
            objectives
        };
    }
}
