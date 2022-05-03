import * as BABYLON from "@babylonjs/core/Legacy/legacy";
import { PlanetOptions } from "../types/types";
import { firebaseDB } from "../service/firebase.service";

export class ExportService {
  name: string;
  options: PlanetOptions;
  scene: BABYLON.Scene;
  engine: BABYLON.Engine;
  camera: BABYLON.Camera;

  constructor(
    name: string = "planetTexture",
    options: PlanetOptions,
    scene: BABYLON.Scene,
    engine: BABYLON.Engine,
    camera: BABYLON.Camera
  ) {
    this.name = name;
    this.scene = scene;
    this.engine = engine;
    this.camera = camera;
    this.options = options;
  }

  public async saveAndExport() {
    BABYLON.Tools.CreateScreenshotUsingRenderTarget(
      this.engine,
      this.camera,
      2500,
      undefined,
      "image/jpeg",
      undefined,
      undefined,
      `${this.options.terrainSeed}_${this.options.type}_${this.options.atmosphereColor}.jpeg`
    );
    const json = JSON.stringify(this.options);
    var blob = new Blob([json], { type: "application/json" });
    var url = URL.createObjectURL(blob);
    var el = document.createElement("a");
    el.href = url;
    el.download = `${this.options.terrainSeed}_${this.options.type}_${this.options.atmosphereColor}.json`;
    el.click();

    await firebaseDB.addDocument(
      "generated-planets",
      this.options.terrainSeed,
      { ...this.options, created: new Date() * 1000 }
    );
  }
}
