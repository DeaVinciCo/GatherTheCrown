import Phaser from 'phaser';
import { SkillNode, SkillTreeState } from '@game/shared';
import { createButton } from './Widgets';

const SKILL_TREE_REGISTRY_KEY = 'skillTreeState';

function getSkillTreeState(scene: Phaser.Scene): SkillTreeState {
  const state = scene.registry.get(SKILL_TREE_REGISTRY_KEY) as SkillTreeState | undefined;
  if (state?.unlockedSkillIds) {
    return {
      unlockedSkillIds: [...state.unlockedSkillIds],
    };
  }

  return {
    unlockedSkillIds: [],
  };
}

function saveSkillTreeState(scene: Phaser.Scene, state: SkillTreeState): void {
  scene.registry.set(SKILL_TREE_REGISTRY_KEY, state);
}

function canUnlock(node: SkillNode, unlockedSkillIds: string[]): boolean {
  return node.requires.every((requiredSkillId) => unlockedSkillIds.includes(requiredSkillId));
}

export function showSkillTree(
  scene: Phaser.Scene,
  container: HTMLElement,
  nodes: SkillNode[]
): void {
  const state = getSkillTreeState(scene);

  nodes.forEach((node) => {
    const isUnlocked = state.unlockedSkillIds.includes(node.skill.id);
    const unlockable = canUnlock(node, state.unlockedSkillIds);
    const statusLabel = isUnlocked ? 'Unlocked' : unlockable ? `Unlock (${node.skill.cost})` : 'Locked';

    const buttonLabel = `${node.skill.name} - ${statusLabel}`;
    const button = createButton(buttonLabel, () => {
      const currentState = getSkillTreeState(scene);

      if (
        currentState.unlockedSkillIds.includes(node.skill.id) ||
        !canUnlock(node, currentState.unlockedSkillIds)
      ) {
        return;
      }

      currentState.unlockedSkillIds.push(node.skill.id);
      saveSkillTreeState(scene, currentState);

      button.disabled = true;
      button.innerText = `${node.skill.name} - Unlocked`;
    });

    if (isUnlocked || !unlockable) {
      button.disabled = true;
    }

    button.title = node.skill.description;
    container.appendChild(button);
  });
}

export { SKILL_TREE_REGISTRY_KEY };
