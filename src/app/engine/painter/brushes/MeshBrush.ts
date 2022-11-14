import { IBrush } from "./IBrush";
import { Color3, Mesh, Scene, StandardMaterial, Vector3, VertexBuffer, WebXRInputSource } from "@babylonjs/core";

const SIMULTANEOUS_ADDED_VERTICES = 2;
const VERTEX_BUFFER_STRIDE = 3;

const BRUSH_SIZE_MIN = .01;
const BRUSH_SIZE_MAX = 1;

interface MeshBrushProps {
  scene: Scene,
}

export class MeshBrush implements IBrush {
  private scene: Scene;
  private scale: number;

  private mesh: Mesh;

  private indices: Uint32Array;
  private positions: Float32Array;

  private currentIndex: number = 0;
  private currentIndexBufferSize: number = 2;

  public init ({scene}: MeshBrushProps) {
    this.scene = scene;
  }

  public setSize(val: number) {
    this.scale = val <= 0 ? BRUSH_SIZE_MIN : val >= BRUSH_SIZE_MAX ? BRUSH_SIZE_MAX : val;
  }

  public setColor (val: Color3) {
    if (!this.mesh) return;
    (this.mesh.material as StandardMaterial).diffuseColor = val;
  }

  public start() {
    this.initMesh();
    this.resetState();
  }

  public end() {
    this.flushBuffers();
  }

  public paint(controller: WebXRInputSource) {
    const pos = controller.pointer.position.clone();
    const up  = controller.pointer.up.normalize().scale(this.scale);
    this.addPoint(pos, up);
  }

  private initMesh() {
    this.mesh = new Mesh(null, this.scene);
    this.mesh.material = new StandardMaterial(null, this.scene);
    this.mesh.material.backFaceCulling = false;
  }

  private resetState() {
    this.updateBuffers()

    this.mesh.setIndices(this.indices, null, true);
    this.mesh.setVerticesData(VertexBuffer.PositionKind, this.positions, true, VERTEX_BUFFER_STRIDE);

    this.currentIndex = 0;
  }

  private addPoint(pos, up) {
    if (this.isBufferFilled()) {
      this.resize();
      this.updateBuffers();
    }

    const pos_ = pos.add(up);

    const lastIndex = this.currentIndex - 2;

    this.pushVertex(pos);
    this.pushVertex(pos_);

    this.pushTriangle(lastIndex,   lastIndex,   lastIndex+2, lastIndex+1); // ∆ 0 2 1
    this.pushTriangle(lastIndex+1, lastIndex+2, lastIndex+3, lastIndex+1); // ∆ 2 3 1

    this.mesh.updateIndices(this.indices, 0);
    this.mesh.setVerticesData(VertexBuffer.PositionKind, this.positions, true, VERTEX_BUFFER_STRIDE);
  }

  private initBuffers () {
    return [
      new Float32Array(this.currentIndexBufferSize * VERTEX_BUFFER_STRIDE),
      new Uint32Array(this.currentIndexBufferSize * VERTEX_BUFFER_STRIDE * SIMULTANEOUS_ADDED_VERTICES)
    ]
  }

  private flushBuffers () {
    const [posBuff, idxBuff] = this.initBuffers();

    this.indices   = idxBuff as Uint32Array;
    this.positions = posBuff as Float32Array;
  }

  private updateBuffers () {
    const [posBuff, idxBuff] = this.initBuffers();

    posBuff.set(this.positions || []);
    idxBuff.set(this.indices || []);

    this.indices   = idxBuff as Uint32Array;
    this.positions = posBuff as Float32Array;
  }

  public isBufferFilled(): boolean {
    return this.currentIndexBufferSize <= this.currentIndex + SIMULTANEOUS_ADDED_VERTICES;
  }

  public resize (mult = 2) {
    this.currentIndexBufferSize *= mult;
  }

  private pushVertex (pos: Vector3) {
    const i = this.currentIndex * VERTEX_BUFFER_STRIDE;

    this.positions[i]   = pos.x;
    this.positions[i+1] = pos.y;
    this.positions[i+2] = pos.z;

    this.currentIndex++;
  }

  private pushTriangle(index, v1, v2, v3) {
    const i = index * VERTEX_BUFFER_STRIDE;
    this.indices[i]   = v1;
    this.indices[i+1] = v2;
    this.indices[i+2] = v3;
  }

}
