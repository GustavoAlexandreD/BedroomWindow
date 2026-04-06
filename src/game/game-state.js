class GameState {
  constructor() {
    this.isGameOver = false;
    this.score = 0;
  }

  gameOver() {
    this.isGameOver = true;
  }
}