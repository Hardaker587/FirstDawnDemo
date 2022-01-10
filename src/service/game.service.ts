import * as BABYLON from "@babylonjs/core";
import { Planet } from "./planet.service";
import "@babylonjs/core/Debug/debugLayer";
import "@babylonjs/inspector";
import { PlanetOptions } from "../types/types";

import * as uuid from "uuid";
import { PlanetType } from "../enums/planet-type.enum";
import { Roughness } from "../enums/roughness.enum";
import { AtmosphericColor } from "../enums/atmospheric-color.enum";
import { AtmosphericDensity } from "../enums/atmospheric-density.enum";

// add game object to window

declare global {
  interface Window {
    game: any;
  }
}

interface engineOptions {
  antialias: boolean;
}

// function randomEnum<T>(anEnum: T): T[keyof T] {
//   const enumValues = Object.keys(anEnum)
//     .map((n) => Number.parseInt(n))
//     .filter((n) => !Number.isNaN(n)) as unknown as T[keyof T][];
//   const randomIndex = Math.floor(Math.random() * enumValues.length);
//   const randomEnumValue = enumValues[randomIndex];
//   console.log({ anEnum, randomIndex, value: enumValues[randomIndex] });
//   return randomEnumValue;
// }

function randomEnumValue<T>(enumeration: T): T[keyof T] {
  const values = Object.keys(enumeration);
  const enumKey = values[Math.floor(Math.random() * values.length)];
  const randomEnumValue = enumeration[enumKey];
  return randomEnumValue;
}

export class Game {
  engine: BABYLON.Engine;
  scene: BABYLON.Scene;
  camera: BABYLON.Camera;
  light: BABYLON.Light;
  planet: any;

  constructor(element: HTMLCanvasElement) {
    const engineOptions: engineOptions = {
      antialias: false,
    };

    window.game = this;
    // set up the main engine
    this.engine = new BABYLON.Engine(element, undefined, engineOptions, false);
    // set up the main scene
    this.scene = new BABYLON.Scene(this.engine);
    // set up the main camera
    this.camera = new BABYLON.ArcRotateCamera(
      "camera",
      Math.PI / 2,
      Math.PI / 3.2,
      4.5,
      BABYLON.Vector3.Zero(),
      this.scene
    );
    this.camera.attachControl(element, true);
    // set up the main lighting source
    this.light = new BABYLON.HemisphericLight(
      "light",
      new BABYLON.Vector3(0.5, 1, 0),
      this.scene
    );

    //make us a skybox they said, sure I said
    var skybox = BABYLON.MeshBuilder.CreateBox(
      "skyBox",
      { size: 1000.0 },
      this.scene
    );
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", this.scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture(
      "/skyboxes/skybox",
      this.scene,
      ["_px.png", "_py.png", "_pz.png", "_nx.png", "_ny.png", "_nz.png"]
    );
    skyboxMaterial.reflectionTexture.coordinatesMode =
      BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skybox.material = skyboxMaterial;

    // insert planet m'ere

    const randomPlanet: PlanetOptions = {
      terrainSeed: uuid.v4(),
      type: randomEnumValue(PlanetType),
      roughness: randomEnumValue(Roughness),
      seaLevel: Math.floor(Math.random() * 50),
      atmosphereColor: randomEnumValue(AtmosphericColor),
      atmosphereDensity: randomEnumValue(AtmosphericDensity),
      meshOptions: { diameter: 1, diameterX: 1, subdivisions: 25 },
      landMassSize: Math.floor(Math.random() * 100),
    };

    this.planet = new Planet("planet", randomPlanet ?? {}, this.scene);

    // make it pretty
    this.prepareGraphicalPipeline();

    if (process.env.NODE_ENV != "production") {
      this.scene.debugLayer.show({ embedMode: true, overlay: true });
    }
    // render that biatch
    this.engine.runRenderLoop(() => this.render());
  }

  render() {
    // insert planet animation m'ere
    this.planet.rotateAround(
      BABYLON.Vector3.Zero(),
      new BABYLON.Vector3(0, 1, 0),
      0.001
    );
    this.planet.mesh.atmosphereMesh.rotateAround(
      BABYLON.Vector3.Zero(),
      new BABYLON.Vector3(0, 1, 0),
      0.0003
    );
    this.scene.render();
  }

  prepareGraphicalPipeline(): BABYLON.DefaultRenderingPipeline {
    const pipeline = new BABYLON.DefaultRenderingPipeline(
      "default",
      true,
      this.scene,
      [this.camera]
    );

    pipeline.imageProcessingEnabled = true;
    pipeline.imageProcessing.contrast = 1.2;
    pipeline.fxaaEnabled = false;
    pipeline.bloomEnabled = true;
    pipeline.sharpenEnabled = true;
    pipeline.grainEnabled = true;
    pipeline.grain.intensity = 5;
    pipeline.grain.animated = true;
    pipeline.sharpen.colorAmount = 1;
    pipeline.samples = 4;
    pipeline.sharpen.edgeAmount = 0.4;

    return pipeline;
  }
}
