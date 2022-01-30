import * as BABYLON from "@babylonjs/core";
import { PlanetMaterialManager } from "./textures.service";
import { PlanetOptions } from "../types/types";

import * as uuid from "uuid";

type PlanetMeshOptions = {
  subdivisions?: number;
};

export class PlanetMesh extends BABYLON.TransformNode {
  planetMesh: BABYLON.Mesh;
  atmosphereMesh: BABYLON.Mesh;
  faces: Array<BABYLON.Mesh>;
  _scene: BABYLON.Scene;
  protected _subdivisions: number;
  protected _material: BABYLON.Material;
  protected _atmosphereMaterial: BABYLON.Material;

  constructor(
    name: string = "planet-mesh",
    options: PlanetMeshOptions,
    scene: BABYLON.Scene
  ) {
    super(name);
    this._scene = scene;
    this._subdivisions = options.subdivisions || 10;

    this.buildMeshes();
    this.setInspectableProperties();

    scene.addTransformNode(this);

    const statusContainer = document.getElementById("currentStatus");
    if (statusContainer) statusContainer.innerText = "Loading mesh...";
  }

  set material(value: BABYLON.Material) {
    this._material = value;
    this.applyMaterial();
  }

  set atmosphereMaterial(value: BABYLON.Material) {
    this._atmosphereMaterial = value;
    this.applyMaterial();
  }

  /**
   * To allow dynamic LOD change
   */
  set subdivisions(value: number) {
    this._subdivisions = value;
    this.buildMeshes();
  }

  get subdivisions(): number {
    return this._subdivisions;
  }

  protected buildMeshes() {
    this.deleteFaces();
    this.generateFaces(this._scene);
    this.generateAtmosphere();
    this.applyMaterial();
  }

  protected deleteFaces() {
    if (!this.faces) {
      return;
    }

    for (let i = 0; i < 6; i++) {
      this.faces[i].dispose();
    }

    this.planetMesh.dispose();
    this.atmosphereMesh.dispose();
  }

  protected generateFaces(scene: BABYLON.Scene) {
    this.faces = [];

    for (let i = 0; i < 6; i++) {
      this.faces[i] = BABYLON.MeshBuilder.CreateGround(
        `${this.name}Face${i}`,
        {
          width: 1,
          height: 1,
          subdivisions: this.subdivisions,
          updatable: true,
        },
        scene
      );
      this.uvmapFace(this.faces[i], i);
      this.spherizeFace(this.faces[i]);
      this.translateFace(this.faces[i], i);
      this.faces[i].setParent(this);
      this.faces[i].isVisible = false;
    }

    this.planetMesh = BABYLON.Mesh.MergeMeshes(
      this.faces,
      false,
      this.subdivisions > 100
    );
    this.planetMesh.setParent(this);
    this.smoothNormalsOfSphereMesh(this.planetMesh);
  }

  protected generateAtmosphere() {
    this.atmosphereMesh = BABYLON.MeshBuilder.CreateSphere(
      `${this.name}Atmosphere`,
      { segments: this._subdivisions * 2, diameter: 2 },
      this._scene
    );
    this.atmosphereMesh.scaling.multiplyInPlace(
      new BABYLON.Vector3(1.005, 1.005, 1.005)
    );
    this.atmosphereMesh.setParent(this);
  }

  /**
   * @see https://www.youtube.com/watch?v=QN39W020LqU
   */
  protected uvmapFace(face: BABYLON.Mesh, faceIndex: number) {
    let cubemapTile = { x: 1, y: 2 };
    if (faceIndex < 4) {
      cubemapTile = { x: faceIndex, y: 1 };
    } else if (faceIndex === 5) {
      cubemapTile = { x: 1, y: 0 };
    }
    const uvs = face.getVerticesData(BABYLON.VertexBuffer.UVKind);
    const numberOfVertices = uvs.length / 2;

    for (let i = 0; i < numberOfVertices; i++) {
      const a = i * 2;
      uvs[a] = (uvs[a] + cubemapTile.x) / 4;
      uvs[a + 1] = (uvs[a + 1] + cubemapTile.y) / 3;
    }
    face.setVerticesData(BABYLON.VertexBuffer.UVKind, uvs);
  }

  protected spherizeFace(face: BABYLON.Mesh) {
    face.updateMeshPositions((positions) => {
      const numberOfVertices = positions.length / 3;
      for (let i = 0; i < numberOfVertices; i++) {
        const a = i * 3;
        const vec = new BABYLON.Vector3(positions[a], 0.5, positions[a + 2]);
        vec.normalize();
        positions[a] = vec.x;
        positions[a + 1] = vec.y - 0.5;
        positions[a + 2] = vec.z;
      }
    }, true);
  }

  protected translateFace(face: BABYLON.Mesh, faceIndex: number) {
    if (faceIndex < 4) {
      face.rotate(new BABYLON.Vector3(1, 0, 0), -Math.PI / 2);
      face.rotate(
        new BABYLON.Vector3(0, 0, 1),
        -(Math.PI / 2) * (faceIndex - 2)
      );
    } else if (faceIndex === 5) {
      face.rotate(new BABYLON.Vector3(1, 0, 0), (Math.PI / 2) * 2);
      face.rotate(new BABYLON.Vector3(0, 1, 0), -(Math.PI / 2));
    } else {
      face.rotate(new BABYLON.Vector3(0, 1, 0), Math.PI / 2);
    }

    face.translate(new BABYLON.Vector3(0, 1, 0), 0.5);
  }

  protected smoothNormalsOfSphereMesh(mesh: BABYLON.Mesh) {
    const positions = mesh.getVerticesData(BABYLON.VertexBuffer.PositionKind);
    mesh.setVerticesData(BABYLON.VertexBuffer.NormalKind, positions);
  }

  protected applyMaterial() {
    if (this._material) {
      for (let i = 0; i < 6; i++) {
        this.faces[i].material = this._material;
      }
    }
    this.planetMesh.material = this._material;
    this.atmosphereMesh.material = this._atmosphereMaterial;
  }

  /**
   * @see https://doc.babylonjs.com/how_to/debug_layer#inspector
   */
  protected setInspectableProperties() {
    this.inspectableCustomProperties = [
      {
        label: "Subdivisions",
        propertyName: "subdivisions",
        type: BABYLON.InspectableType.Slider,
        min: 3,
        max: 128,
        step: 1,
      },
    ];
  }
}

class Planet extends BABYLON.TransformNode {
  mesh: PlanetMesh;
  materialManager: PlanetMaterialManager;
  scene: BABYLON.Scene;
  engine: BABYLON.Engine;
  camera: BABYLON.Camera;
  options: PlanetOptions;

  constructor(
    name: string = "planet",
    options: any,
    scene: BABYLON.Scene,
    engine: BABYLON.Engine,
    camera: BABYLON.Camera
  ) {
    super(name);
    this.scene = scene;
    this.engine = engine;
    this.camera = camera;
    this.options = {
      terrainSeed: uuid.v4(), // 'Foo' was also a good initial value
      type: "terrestrial",
      landMassSize: 80,
      roughness: 2,
      seaLevel: 25,
      atmosphereDensity: 2,
      atmosphereColor: "blue",
      meshOptions: { diameter: 1, diameterX: 1, subdivisions: 25 },
      ...options,
    };

    const statsContainer = document.getElementById("stats");
    const statsOptions = Object.keys(this.options);

    if (statsContainer) {
      statsOptions.forEach((option: any) => {
        const node = document.createElement("p");
        node.innerText = `${option}: ${this.options[option]}`;
        statsContainer?.appendChild(node);
      });
    }

    this.mesh = new PlanetMesh(name, this.options.meshOptions as any, scene);
    this.mesh.setParent(this);

    this.materialManager = new PlanetMaterialManager(
      "myPlanetMat",
      this.options,
      scene,
      this.engine,
      this.camera
    );
    this.mesh.material = this.materialManager.raw;
    this.mesh.atmosphereMaterial = this.materialManager.rawAtmosphere;

    if (this.options.moon) {
      const moon = BABYLON.MeshBuilder.CreateSphere("moon", {}, scene);
      moon.parent = this.mesh;
      const moonMaterial = new BABYLON.StandardMaterial("moonmaterial", scene);
      moonMaterial.diffuseTexture = new BABYLON.Texture(
        "/textures/2k_moon.jpg",
        scene
      );
      moonMaterial.bumpTexture = new BABYLON.Texture(
        "/textures/2k_moon_normal.png",
        scene
      );
      moon.material = moonMaterial;
      moon.position.x = -1.2;
      moon.position.y = 1.2;

      moon.scaling.x = 0.5;
      moon.scaling.y = 0.5;
      moon.scaling.z = 0.5;
    }

    if (this.options.rings) {
      var rings = BABYLON.Mesh.CreateGround("rings", 4, 4, 3, scene);
      rings.parent = this.mesh;
      var ringsMaterial = new BABYLON.StandardMaterial("ringsMaterial", scene);
      ringsMaterial.diffuseTexture = new BABYLON.Texture(
        "/textures/rings.png",
        scene
      );
      ringsMaterial.diffuseTexture.hasAlpha = true;
      ringsMaterial.backFaceCulling = false;
      rings.material = ringsMaterial;
      rings.receiveShadows = true;
    }

    this.setInspectableProperties();
    this.setDisposeProcess();
  }

  set subdivisions(value: number) {
    this.mesh.subdivisions = value;
  }

  get subdivisions(): number {
    return this.mesh.subdivisions;
  }

  set noiseSettings(value: string) {
    this.materialManager.noiseSettings = JSON.parse(value);
    setTimeout(() => {
      this.mesh.material = this.materialManager.raw;
    }, 100);
  }

  get noiseSettings(): string {
    return JSON.stringify(this.materialManager.noiseSettings);
  }

  /**
   * @see https://doc.babylonjs.com/how_to/debug_layer#inspector
   */
  protected setInspectableProperties() {
    this.inspectableCustomProperties = [
      {
        label: "Subdivisions",
        propertyName: "subdivisions",
        type: BABYLON.InspectableType.Slider,
        min: 3,
        max: 256,
        step: 1,
      },
      {
        label: "Noise Settings",
        propertyName: "noiseSettings",
        type: BABYLON.InspectableType.String,
      },
    ];
  }

  protected setDisposeProcess() {
    this.onDisposeObservable.add(() => {
      this.materialManager.dispose();
    });
  }
}

export { Planet };
