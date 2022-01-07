import { AtmosphericColor } from "../enums/atmospheric-color.enum";
import { AtmosphericDensity } from "../enums/atmospheric-density.enum";
import { PlanetType } from "../enums/planet-type.enum";
import { Roughness } from "../enums/roughness.enum";

type PlanetOptions = {
  terrainSeed: string;
  type: PlanetType;
  landMassSize: number;
  roughness: Roughness;
  seaLevel: number;
  atmosphereDensity: AtmosphericDensity;
  atmosphereColor: AtmosphericColor;
  meshOptions: { diameter: number; diameterX: number; subdivisions: number };
};

type NoiseSettings = Array<{
  shift: number;
  passes: number;
  strength: number;
  roughness: number;
  resistance: number;
  min: number;
  hard: boolean;
}>;

export { NoiseSettings, PlanetOptions };
