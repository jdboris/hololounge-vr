export default class GameDto {
  id = null;
  title = "";
  posterUrl = "";
  trailerUrl = "";
  summary = "";
  playerMinimum = 1;
  playerMaximum = 1;
  hasLocalMultiplayer = false;
  hasOnlineMultiplayer = false;
  sortOrder = null;
  tags = [];

  constructor(data = {}) {
    Object.assign(this, data);

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

    if (this.sortOrder < 1) {
      this.sortOrder = null;
    }

    if (isNaN(this.sortOrder)) {
      this.sortOrder = null;
    }

    Object.freeze(this);
  }
}
