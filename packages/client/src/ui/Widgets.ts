export function createButton(label: string, onClick: () => void): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.innerText = label;
  btn.onclick = onClick;
  return btn;
}
