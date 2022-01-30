import { firebaseDB } from "../src/service/firebase.service";
import { Game } from "./service/game.service";

const planet_list: HTMLDivElement = document.getElementById("planet-list");

let params = new URLSearchParams(window.location.search);
firebaseDB
  .queryDocuments(
    "generated-planets",
    { key: "terrainSeed", operator: "!=", value: "null" },
    100
  )
  .then((res) => {
    const list_holder = document.createElement("div");
    res.forEach((planet, index) => {
      const list_item = document.createElement("div");
      list_item.innerText = `${index}. ${planet.id}`;
      list_item.setAttribute("class", "planet");
      list_item.addEventListener("click", () => {
        params.set("seed", planet.id);
        window.location.search = params.toString();
      });
      list_holder.appendChild(list_item);
    });
    planet_list.appendChild(list_holder);
  });

const game = document.querySelector<HTMLCanvasElement>("#planet-view")!;

new Game(game);
