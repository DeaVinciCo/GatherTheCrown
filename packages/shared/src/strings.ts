export type Lang = 'en' | 'es';

export type Strings = {
  title: string;
  menu_start: string;
  menu_forest: string;
  menu_trial: string;
  menu_arena: string;
  locked_tooltip: string;
};

export const STRINGS: Record<Lang, Strings> = {
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
    menu_start: 'Forja Tu Héroe',
    menu_forest: 'Carrera en el Bosque',
    menu_trial: 'Prueba de la Corona I',
    menu_arena: 'Arena de Batalla',
    locked_tooltip: 'Desbloquea progresando en la historia.'
  }
};
