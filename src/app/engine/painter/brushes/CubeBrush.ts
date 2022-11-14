import { Color3, Mesh, MeshBuilder, StandardMaterial, Vector3, WebXRInputSource } from "@babylonjs/core";

import { IBrush } from "./IBrush";

import { ControllerHandler } from "../ControllerHandler";

interface CubeBrushProps {
  controller: ControllerHandler,
}

export class CubeBrush implements IBrush {

  private mesh: Mesh | undefined;
  private controller: ControllerHandler;

  public init({controller}:CubeBrushProps) {
    this.controller = controller;
  }

  public setSize(val: number) {
    if (!this.mesh) return;
    this.mesh.scaling = Vector3.One().scale(val);
  }

  public setColor (val: Color3) {
    (this.mesh.material as StandardMaterial).diffuseColor = val;
  }

  public start() {
    this.mesh = MeshBuilder.CreateBox(null, { size: .1 });
    this.mesh.material = new StandardMaterial(null);
    this.mesh.position = this.controller.position;
    this.mesh.rotationQuaternion = this.controller.pointer.rotationQuaternion; // just set reference
  }

  public end() {

  }

  public paint(controller: WebXRInputSource) {
    const pos = controller.pointer.position.clone();
    this.mesh.position = pos;
  }
}
