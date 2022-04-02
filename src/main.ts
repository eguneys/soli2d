
import Canvas from './canvas'
import Play from './play'

import { Transform } from './math'
import { Vec2, Rectangle, Matrix } from './math'


function manual(element: HTMLElement) {

  const vSource = `#version 300 es
in vec2 aVertexPosition;
uniform mat3 projectionMatrix;

void main() {
  gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0, 1);
}
`

  const fSource = `#version 300 es
precision highp float;

out vec4 outColor;

void main() {
  outColor = vec4(1.0, 1.0, 0.0, 1.0);
}

`

  let canvas = new Canvas(element, 1920, 1080)
  let play = new Play(canvas)

  play.glOnce()

  play.glClear()

  let sun = new Transform()
  sun.scale.set_in(100, 100)


  let earth_orbit = new Transform()
  earth_orbit.translate.set_in(500, 0)

  let earth = new Transform()
  earth.scale.set_in(50, 50)

  let moon_orbit = new Transform()
  moon_orbit.translate.set_in(130, 100)

  let moon = new Transform()
  moon.scale.set_in(30, 30)

  let solar_orbit = new Transform()
  solar_orbit.translate.set_in(500, 500)

  let sun_orbit = new Transform()

  sun_orbit._set_parent(solar_orbit)
  sun._set_parent(sun_orbit)
  earth_orbit._set_parent(solar_orbit)
  earth._set_parent(earth_orbit)
  moon_orbit._set_parent(earth_orbit)
  moon._set_parent(moon_orbit)

  solar_orbit._update_world()

  let e_r = 0
  setInterval(() => {
    solar_orbit.rotation = e_r * 0.2
    earth_orbit.rotation = e_r
    e_r += Math.PI * 0.01
    solar_orbit._update_world()
  }, 16)

  let els = [moon, sun, earth]

  let nb = 24000

  let { program, 
    uniformData,
    indexBuffer, 
    attributeBuffer,
    vao } = play.glProgram(vSource, fSource, nb)

  let _indexBuffer = new Uint16Array(nb * 3)
  let _attributeBuffer = new Float32Array(nb * 6)


  loop((dt: number, dt0: number) => {

    play.glClear()

    play.glUse(program, uniformData)

    let aIndex = 0,
      iIndex = 0

    els.map(trans => Rectangle.unit.transform(trans.world)).forEach((el, i) => {
      let { vertexData, indices } = el
      for (let k = 0; k < vertexData.length; k+= 2) {
        _attributeBuffer[aIndex++] = vertexData[k]
        _attributeBuffer[aIndex++] = vertexData[k+1]
      }

      for (let k = 0; k < indices.length; k++) {
        _indexBuffer[iIndex++] = i * 4 + indices[k]
      }
    })

    play.glAttribUpdate(attributeBuffer, _attributeBuffer)
    play.glIndexUpdate(indexBuffer, _indexBuffer)

    play.glDraw(nb * 4, vao)

  })
}

function loop(fn: (dt: number, dt0: number) => void) {
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
    requestAnimationFrame(step)
  }
  requestAnimationFrame(step)
}

export default function app(element: HTMLElement) {

  manual(element)

}
