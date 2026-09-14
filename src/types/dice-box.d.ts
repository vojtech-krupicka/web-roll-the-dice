/**
 * @3d-dice/dice-box ships no TypeScript types. This declares only the
 * subset of its API this app actually calls — see `Dice3DArea.tsx`.
 */
declare module "@3d-dice/dice-box" {
  export type DiceRollResult = {
    sides: number;
    groupId: number;
    rollId: number;
    value: number;
    theme?: string;
    themeColor?: string | null;
  };

  export type DiceBoxConfig = {
    id?: string;
    container: string;
    assetPath: string;
    theme?: string;
    themeColor?: string;
    scale?: number;
    gravity?: number;
    mass?: number;
    friction?: number;
    restitution?: number;
    angularDamping?: number;
    linearDamping?: number;
    spinForce?: number;
    throwForce?: number;
    startingHeight?: number;
    settleTimeout?: number;
    offscreen?: boolean;
    delay?: number;
    lightIntensity?: number;
    enableShadows?: boolean;
    shadowTransparency?: number;
  };

  export type DiceNotationEntry = { sides: number; qty: number };

  export type DiceRollOptions = {
    theme?: string;
    /** Hex color — tints the theme's neutral diffuse texture for this roll. */
    themeColor?: string;
    newStartPoint?: boolean;
  };

  export default class DiceBox {
    constructor(config: DiceBoxConfig);
    init(): Promise<this>;
    roll(notation: DiceNotationEntry[], options?: DiceRollOptions): Promise<DiceRollResult[]>;
    clear(): this;
    /** Re-reads the container's actual clientWidth/clientHeight and resizes the renderer to match. */
    resizeWorld(): void;
  }
}
