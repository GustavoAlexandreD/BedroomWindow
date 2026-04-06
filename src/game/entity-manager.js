class EntityManager {
  constructor() {
    this.windows = [];
  }

  update(dt) {
    this.windows.forEach(w => w.update(dt));
  }

  draw(renderer) {
    this.windows.forEach(w => renderer.draw(w));
  }
}