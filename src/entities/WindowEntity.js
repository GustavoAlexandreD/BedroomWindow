class WindowEntity {
  constructor(position) {
    this.state = "idle"; // idle | monster | friend | breaking
    this.timer = 0;
    this.health = 100;
  }

  update(dt) {
    if (this.state === "monster") {
      this.timer += dt;
      if (this.timer > 3) {
        this.break();
      }
    }
  }

  break() {
    this.state = "breaking";
  }
}