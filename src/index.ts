export { default as Canvas } from './canvas'
export { default as Play } from './play'
export { default as Quad } from './quad'
export * from './math'
export * from './shaders'
export * from './util'


import Canvas from './canvas'
import Play from './play'
import { Rectangle, Transform } from './math'
import { vSource, fSource } from './shaders'
import { color_rgb, Color } from './util'


export const Soli2d = (element: HTMLElement, image: HTMLImageElement, width: number, height: number) => {

  let canvas = new Canvas(element, width, height)
  let play = new Play(canvas)

  play.glOnce()
  play.glClear()

  let stage = new Transform()

  let nb = 24000

  let { program, 
    uniformData,
    indexBuffer, 
    attributeBuffer,
    vao } = play.glProgram(vSource, fSource, nb)

 
  let _indexBuffer = new Uint16Array(nb * 3)
  let _attributeBuffer = new Float32Array(nb * 6)



  let { glTexture } = play.glTexture()
  play.glUseTexture(glTexture, image)

  loop((dt: number, dt0: number) => {

    play.glClear()

    play.glUse(program, uniformData)

    let aIndex = 0,
      iIndex = 0,
      iNb = 0


    stage._flat.forEach((el, i) => {
      let { world, quad, tint } = el
      if (!quad) {
        return
      }

      let {vertexData, indices } = Rectangle.unit.transform(world)
      let { texture, fsUv } = quad

      let tintData = color_rgb(tint)

      for (let k = 0; k < vertexData.length; k+= 2) {
        _attributeBuffer[aIndex++] = vertexData[k]
        _attributeBuffer[aIndex++] = vertexData[k+1]

        _attributeBuffer[aIndex++] = fsUv[k]
        _attributeBuffer[aIndex++] = fsUv[k+1]

        _attributeBuffer[aIndex++] = tintData[0]
        _attributeBuffer[aIndex++] = tintData[1]
        _attributeBuffer[aIndex++] = tintData[2]
      }

      for (let k = 0; k < indices.length; k++) {
        _indexBuffer[iIndex++] = iNb * 4 + indices[k]
      }

      iNb++;
    })

    play.glAttribUpdate(attributeBuffer, _attributeBuffer)
    play.glIndexUpdate(indexBuffer, _indexBuffer)

    play.glDraw(iNb * 6, vao)


  })


  return stage
}



export function loop(fn: (dt: number, dt0: number) => void) {
  let fixed_dt = 1000/60
  let timestamp0: number | undefined,
  min_dt = fixed_dt,
    max_dt = fixed_dt * 2,
    dt0 = fixed_dt

  let elapsed = 0

  function step(timestamp: number) {
    let dt = timestamp0 ? timestamp - timestamp0 : fixed_dt

    dt = Math.min(max_dt, Math.max(min_dt, dt))

    fn(dt, dt0)

    dt0 = dt
    timestamp0 = timestamp
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}
