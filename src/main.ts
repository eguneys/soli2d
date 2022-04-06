import bunny_png from '../assets/bunny.png'
import sprites_png from '../assets/sprites.png'

import Canvas from './canvas'
import Play from './play'

import Quad from './quad'
import { Transform } from './math'
import { Vec2, Rectangle, Matrix } from './math'

import { TexTint } from './textint'

import { color_rgb, Color } from './util'

import { vSource, fSource } from './shaders'

import { Soli2d } from './index'


let rate = 1000/60
const ticks = {
  one: rate,
  seconds: 60 * rate
}

function load_image(path: string): Promise<HTMLImageElement> {
  return new Promise(resolve => {
    let res = new Image()
    res.onload = () => resolve(res)
    res.src = path
  })
}

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


function basic_container(element, image) {

  const vSource = `#version 300 es
in vec2 aVertexPosition;
in vec2 aTextureCoord;

uniform mat3 projectionMatrix;

out vec2 vTextureCoord;

void main() {
  gl_Position = vec4((projectionMatrix * vec3(aVertexPosition, 1.0)).xy, 0, 1);

  vTextureCoord = aTextureCoord;
}
`

  const fSource = `#version 300 es
precision highp float;

in vec2 vTextureCoord;
out vec4 outColor;

uniform sampler2D uSampler;

void main() {
  //outColor = vec4(1.0, 1.0, 0.0, 1.0);
  vec4 color = texture(uSampler, vTextureCoord);
  outColor = vec4(color.rgb * color.a, color.a);
}

`

  let canvas = new Canvas(element, 800, 600)
  let play = new Play(canvas)

  play.glOnce({
    color: 0x1099bb
  })

  play.glClear()




  let els = []
  let quads = []

  let container = new Transform()
  container.translate.set_in(canvas.width / 2,
                             canvas.height / 2)


  for (let i = 0; i < 25; i++) {
    let bunny = new Transform()
    bunny.translate
    .set_in((i % 5) * 40, Math.floor(i/5) * 40)
    bunny.scale.set_in(26, 37)

    bunny._set_parent(container)

    els.push(bunny)
    quads.push(Quad.make(image, 0, 0))
  }

  //container.pivot.set_in(6, 6)
  container._update_world()


  loop((dt: number, dt0: number) => {
    container.rotation -= Math.PI * (dt / (ticks.seconds * 2))
    container._update_world()
  })

  let { glTexture } = play.glTexture()
  play.glUseTexture(glTexture, image)

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

      let { texture, fsUv } = quads[i]

      for (let k = 0; k < vertexData.length; k+= 2) {
        _attributeBuffer[aIndex++] = vertexData[k]
        _attributeBuffer[aIndex++] = vertexData[k+1]

        _attributeBuffer[aIndex++] = fsUv[k]
        _attributeBuffer[aIndex++] = fsUv[k+1]
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

const basic_tinting = (element: HTMLElement, image: HTMLImageElement) => {

  let canvas = new Canvas(element, 800, 600)
  let play = new Play(canvas)

  play.glOnce()

  play.glClear()


  let els = []
  let quads = []

  let stuff = []

  let stage = new Transform()
  let totalDudes = 20

  for (let i = 0; i < totalDudes; i++) {
    let dude = new Transform()
    dude.size.set_in(128, 128)
    dude.scale.set_in(0.8 + Math.random() * 0.3)

    dude.translate.set_in(Math.random() * canvas.width,
                          Math.random() * canvas.height)

    dude._set_parent(stage)
    els.push(dude)
    quads.push(new TexTint(
      Quad.make(image, 0, 0, 128, 128),
      Math.random() * 0xffffff
    ))

    stuff.push({
      direction: Math.random() * Math.PI * 2,
      turningSpeed: Math.random() - 0.8,
      speed: 2 + Math.random() * 2
    })
  }

  let dudeBounds = Rectangle.make(-100,
                                  -100,
  canvas.width + 100 * 2,
  canvas.height + 100 * 2)

  loop((dt: number, dt0: number) => {
    
    stuff.forEach((stuff, i) => {
      let el = els[i]
      stuff.direction += stuff.turningSpeed * 0.01
      el.x += Math.sin(stuff.direction) * stuff.speed
      el.y += Math.cos(stuff.direction) * stuff.speed
      el.rotation = -stuff.direction - Math.PI / 2 

      if (el.x < dudeBounds.x) {
        el.x += dudeBounds.w
      } else if (el.x > dudeBounds.x2) {
        el.x -= dudeBounds.w
      }

      if (el.y < dudeBounds.y) {
        el.y += dudeBounds.h
      } else if (el.y > dudeBounds.y2) {
        el.y -= dudeBounds.h
      }

      stage._update_world()
    })
  })

  console.log(dudeBounds)

  stage._update_world()

  let { glTexture } = play.glTexture()
  play.glUseTexture(glTexture, image)

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
      let { quad, tint } = quads[i]
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
        _indexBuffer[iIndex++] = i * 4 + indices[k]
      }
    })


    play.glAttribUpdate(attributeBuffer, _attributeBuffer)
    play.glIndexUpdate(indexBuffer, _indexBuffer)

    play.glDraw(nb * 4, vao)

  })


}


const soli_setup = (element: HTMLElement, image: HTMLImageElement) => {

  let root = Soli2d(element, image, 320, 180)


  let res = new Transform()
  res.size.set_in(128, 128)
  res.quad = Quad.make(image, 0, 0, 128, 128),
  res.tint = Math.random() * 0xffffff

  res._set_parent(root)

  res._update_world()

}

export default function app(element: HTMLElement) {

  //manual(element)
  load_image(sprites_png).then(image => {
    //basic_container(element, image)
    //basic_tinting(element, image)
    soli_setup(element, image)
  })

}
