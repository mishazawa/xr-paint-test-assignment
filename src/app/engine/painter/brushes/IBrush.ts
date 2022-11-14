import { Color3, WebXRInputSource } from "@babylonjs/core";

export interface IBrush {
  start: () => void,
  end: () => void,
  paint: (controller: WebXRInputSource) => void,
  setSize: (val:number) => void,
  setColor: (val: Color3) => void,
  init: (props: Partial<any>) => void,
}
