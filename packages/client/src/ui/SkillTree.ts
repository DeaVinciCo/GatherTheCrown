import Phaser from 'phaser';
import { SkillNode, SkillTreeState } from '@game/shared';
import { createButton } from './Widgets';

export const SKILL_TREE_REGISTRY_KEY = 'skillTreeState';

function getSkillTreeState(scene: Phaser.Scene): SkillTreeState {
  return scene.registry.get(SKILL_TREE_REGISTRY_KEY) ?? { unlockedSkillIds: [] };
}

function saveSkillTreeState(scene: Phaser.Scene, state: SkillTreeState): void {
  scene.registry.set(SKILL_TREE_REGISTRY_KEY, state);
}

export function canUnlock(node: SkillNode, state: SkillTreeState): boolean {
  if (state.unlockedSkillIds.includes(node.id)) return false;
  return node.requires.every((id) => state.unlockedSkillIds.includes(id));
}

export function showSkillTree(
  scene: Phaser.Scene,
  container: HTMLElement,
  nodes: SkillNode[]
) {
  const state = getSkillTreeState(scene);

  nodes.forEach((node) => {
    const btn = createButton(node.skill.name, () => {
      const current = getSkillTreeState(scene);
      if (canUnlock(node, current)) {
        current.unlockedSkillIds.push(node.id);
        saveSkillTreeState(scene, current);
        btn.disabled = true;
      }
    });

    if (!canUnlock(node, state)) {
      btn.disabled = true;
    }

    container.appendChild(btn);
  });
}
