import Quad from './quad'
import { Color } from './util'

export class TexTint {

  quad: Quad
  tint?: Color

  constructor(quad: Quad, tint?: Color) {
    this.quad = quad
    this.tint = tint
  }

}
