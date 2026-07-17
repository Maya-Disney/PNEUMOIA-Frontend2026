// Lecteur de son de notification basé sur un fichier audio importé.
// Les navigateurs bloquent la lecture tant qu'aucune interaction utilisateur
// n'a eu lieu sur la page : on "débloque" l'élément audio dès le premier
// clic/touche/touche clavier pour que le son marche sur tous les navigateurs.
export function createNotifSound(src, volume = 0.6) {
  const audio = new Audio(src);
  audio.preload = "auto";
  audio.volume = volume;

  const unlock = () => {
    audio.play().then(() => {
      audio.pause();
      audio.currentTime = 0;
    }).catch(() => {});
  };
  ["click", "keydown", "touchstart"].forEach(evt =>
    window.addEventListener(evt, unlock, { once: true, passive: true })
  );

  return function playNotifSound() {
    audio.currentTime = 0;
    audio.play().catch(() => {});
  };
}
