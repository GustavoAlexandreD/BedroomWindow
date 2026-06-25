export class EntityManager {
  constructor() {
    this.entities = [];
  }

  // Roda a cada frame calculando física, IA, colisões e temporizadores.
  update(dt) {
    this.entities.forEach(e => {
        if (e.update) {
            e.update(dt);
        }
    });
  }
}