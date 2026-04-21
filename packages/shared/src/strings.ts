export const STRINGS = {
  en: {
    title: 'Gather The Crown: Creats & Foes',
    menu_start: 'Forge Your Hero',
    menu_forest: 'Forest Run',
    menu_trial: 'Crown Trial I',
    menu_arena: 'Battle Arena',
    locked_tooltip: 'Unlock by progressing the story.'
  },
  es: {
    title: 'Reúne la Corona: Criaturas y Enemigos',
    menu_start: 'Forja tu héroe',
    menu_forest: 'Ruta del Bosque',
    menu_trial: 'Prueba de la Corona I',
    menu_arena: 'Arena de Batalla',
    locked_tooltip: 'Desbloquéalo avanzando en la historia.'
  }
} as const;

export type LanguageCode = keyof typeof STRINGS;
export type StringKey = keyof (typeof STRINGS)['en'];
