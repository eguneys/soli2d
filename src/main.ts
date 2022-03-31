
import Canvas from './canvas'
import Play from './play'

import { Rectangle, Matrix } from './math'

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

  let nb = 2

  let { program, 
    uniformData,
    indexBuffer, 
    attributeBuffer,
    vao } = play.glProgram(vSource, fSource, nb)

  play.glUse(program, uniformData)


  let _indexBuffer = new Uint16Array(nb * 3)
  let _attributeBuffer = new Float32Array(nb * 6)

  let el = Rectangle.unit.transform(
    Matrix.unit
    .translate(-0.5, 0.5)
    .scale(1900, 100)
    .translate(0.5, 0.5)
    .translate(10, 10))


  let { vertexData, indices } = el

  let aIndex = 0,
    iIndex = 0

  for (let k = 0; k < vertexData.length; k+= 2) {
    _attributeBuffer[aIndex++] = vertexData[k]
    _attributeBuffer[aIndex++] = vertexData[k+1]
  }

  for (let k = 0; k < indices.length; k++) {
    _indexBuffer[iIndex++] = indices[k]
  }

  play.glAttribUpdate(attributeBuffer, _attributeBuffer)
  play.glIndexUpdate(indexBuffer, _indexBuffer)

  play.glClear()
  play.glDraw(8, vao)

}

export default function app(element: HTMLElement) {

  manual(element)

}
