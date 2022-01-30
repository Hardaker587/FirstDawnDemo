import { PlanetOptions } from "../types/types";
import * as BABYLON from "@babylonjs/core";
import { PlanetType } from "../enums/planet-type.enum";
import { Roughness } from "../enums/roughness.enum";
import { AtmosphericColor } from "../enums/atmospheric-color.enum";
import { AtmosphericDensity } from "../enums/atmospheric-density.enum";
import { randomEnumValue } from "../utilities/general.utility";
import * as uuid from "uuid";
import { firebaseDB } from "./firebase.service";

export class GeneratorService {
  engine: BABYLON.Engine;
  scene: BABYLON.Scene;
  camera: BABYLON.Camera;

  constructor(
    scene: BABYLON.Scene,
    engine: BABYLON.Engine,
    camera: BABYLON.Camera
  ) {
    this.scene = scene;
    this.engine = engine;
    this.camera = camera;
  }

  public async generatePlanetForExport(iterations: number) {
    console.log("Starting generation");
    console.time(`Generating ${iterations}`);
    for (let i = 0; i < iterations; i++) {
      const randomPlanet: PlanetOptions = {
        terrainSeed: uuid.v4(),
        type: randomEnumValue(PlanetType),
        roughness: randomEnumValue(Roughness),
        seaLevel: Math.floor(Math.random() * 50),
        atmosphereColor: randomEnumValue(AtmosphericColor),
        atmosphereDensity: randomEnumValue(AtmosphericDensity),
        meshOptions: { diameter: 1, diameterX: 1, subdivisions: 25 },
        landMassSize: Math.floor(Math.random() * 100),
        clouds: Math.random() < 0.5,
        rings: Math.random() < 0.5,
        moon: Math.random() < 0.5,
        distanceFromParentStar: Math.random(),
      };
      console.log(`Generating planet ${i + 1} - ${randomPlanet.terrainSeed}`);
      const skybox = Math.floor(Math.random() * 4);

      console.log(`Saving planet ${i} - ${randomPlanet.terrainSeed}`);
      await firebaseDB.addDocument(
        "generated-planets",
        randomPlanet.terrainSeed,
        {
          ...randomPlanet,
          skybox,
        }
      );
    }
    console.timeEnd(`Generating ${iterations}`);
  }
}
