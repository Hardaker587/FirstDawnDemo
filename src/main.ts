import { Game } from "./service/game.service";
import "./style.css";

const game = document.querySelector<HTMLCanvasElement>("#game")!;

new Game(game);
