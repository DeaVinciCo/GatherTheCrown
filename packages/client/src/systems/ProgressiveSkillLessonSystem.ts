import Phaser from 'phaser';
import { gameRegistry } from '../registry/GameRegistry';
import { SKILL_LESSONS, SkillId } from '../progression/skillLessons';
import { ProgressiveSkillLessonOverlay } from '../ui/ProgressiveSkillLessonOverlay';

export class ProgressiveSkillLessonSystem {
  constructor(private scene: Phaser.Scene) {}

  onSkillUnlocked(skillId: SkillId) {
    gameRegistry.unlockSkill(skillId);
    this.tryPlayLesson(skillId);
  }

  onSkillRelevant(skillId: SkillId) {
    this.tryPlayLesson(skillId);
  }

  private tryPlayLesson(skillId: SkillId) {
    if (!gameRegistry.hasSkill(skillId) && !gameRegistry.shouldPlaySkillLesson(skillId)) {
      // Relevance can trigger first-time learning moments before permanent unlock.
      gameRegistry.unlockSkill(skillId);
    }

    if (!gameRegistry.shouldPlaySkillLesson(skillId)) {
      return;
    }

    const lesson = SKILL_LESSONS[skillId];
    ProgressiveSkillLessonOverlay.show(this.scene, {
      title: lesson.title,
      shortText: lesson.shortText,
      hintText: lesson.hintText
    });
    gameRegistry.markSkillLessonSeen(skillId);
  }
}
