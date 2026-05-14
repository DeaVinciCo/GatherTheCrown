import Phaser from 'phaser';
import { SkillNode } from '@game/shared';
import { createButton } from './Widgets';

export function showSkillTree(
  scene: Phaser.Scene,
  container: HTMLElement,
  nodes: SkillNode[]
) {
  const unlocked: string[] = scene.registry.get('unlockedSkills') || [];

  nodes.forEach((node) => {
    const btn = createButton(node.skill.name, () => {
      const current: string[] = scene.registry.get('unlockedSkills') || [];
      const prereqsMet = node.requires.every((id) => current.includes(id));

      if (prereqsMet && !current.includes(node.skill.id)) {
        current.push(node.skill.id);
        scene.registry.set('unlockedSkills', current);
        btn.disabled = true;
      }
    });

    if (unlocked.includes(node.skill.id)) {
      btn.disabled = true;
    }

    container.appendChild(btn);
  });
}
