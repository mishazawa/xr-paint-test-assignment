import { Color3, WebXRInputSource } from "@babylonjs/core";

export interface IBrush {
  init: (props: Partial<any>) => void,
  start: () => void,
  paint: (controller: WebXRInputSource) => void,
  end: () => void,
  setSize: (val:number) => void,
  setColor: (val: Color3) => void,
}
