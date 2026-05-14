import { Achievement } from '../progression/achievements';

export class AchievementNotif {
  static showUnlock(achievement: Achievement, duration: number = 3000) {
    const container = document.getElementById('game');
    if (!container) return;

    const notification = document.createElement('div');
    notification.className = 'achievement-notification';
    Object.assign(notification.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '320px',
      background: 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%)',
      color: '#1f2937',
      padding: '16px',
      borderRadius: '10px',
      boxShadow: '0 8px 24px rgba(0, 0, 0, 0.3)',
      zIndex: '9999',
      fontFamily: 'Arial, sans-serif',
      fontWeight: 'bold',
      fontSize: '14px',
      animation: 'slideIn 0.4s ease-out',
      border: '2px solid #fbbf24',
    });

    const header = document.createElement('div');
    header.innerText = '🎖️ Achievement Unlocked!';
    Object.assign(header.style, {
      marginBottom: '8px',
      fontSize: '16px',
      color: '#1f2937',
      fontWeight: 'bold',
    });
    notification.appendChild(header);

    const title = document.createElement('div');
    title.innerText = achievement.title;
    Object.assign(title.style, {
      fontSize: '15px',
      marginBottom: '4px',
      color: '#1f2937',
    });
    notification.appendChild(title);

    const desc = document.createElement('div');
    desc.innerText = achievement.description;
    Object.assign(desc.style, {
      fontSize: '12px',
      color: '#374151',
      fontWeight: 'normal',
    });
    notification.appendChild(desc);

    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from {
          transform: translateX(400px);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes slideOut {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(400px);
          opacity: 0;
        }
      }
      .achievement-notification.exit {
        animation: slideOut 0.4s ease-in forwards;
      }
    `;
    if (!document.head.querySelector('style[data-achievement-animations]')) {
      style.setAttribute('data-achievement-animations', 'true');
      document.head.appendChild(style);
    }

    container.appendChild(notification);

    // Auto-dismiss after duration
    setTimeout(() => {
      notification.classList.add('exit');
      setTimeout(() => notification.remove(), 400);
    }, duration);
  }

  static checkAndNotifyNewAchievements(
    currentAchievements: Achievement[],
    previousCompletedIds: Set<string>
  ) {
    for (const achievement of currentAchievements) {
      if (achievement.completed && !previousCompletedIds.has(achievement.id)) {
        this.showUnlock(achievement);
        previousCompletedIds.add(achievement.id);
      }
    }
  }
}
