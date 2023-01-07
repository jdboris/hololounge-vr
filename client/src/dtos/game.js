export default class Game {
  id = null;
  title = "";
  posterUrl = "";
  trailerUrl = "";
  summary = "";
  playerMinimum = 1;
  playerMaximum = 1;
  hasLocalMultiplayer = false;
  hasOnlineMultiplayer = false;
  tags = [];

  constructor(data = {}) {
    Object.assign(this, data);
    this.validate();
  }

  validate() {
    if (this.playerMinimum <= 0) {
      this.playerMinimum = 1;
    }

    if (this.playerMaximum <= 0) {
      this.playerMaximum = 1;
    }

    if (this.playerMinimum > this.playerMaximum) {
      this.playerMaximum = this.playerMinimum;
    }

    if (this.playerMaximum > 1) {
      if (!this.hasLocalMultiplayer && !this.hasOnlineMultiplayer) {
        this.hasLocalMultiplayer = true;
      }
    }

    if (this.playerMaximum <= 1) {
      this.hasLocalMultiplayer = false;
      this.hasOnlineMultiplayer = false;
    }

    return true;
  }
}
