
import Canvas from './canvas'
import Play from './play'

function manual(element: HTMLElement) {

  const vSource = `#version 300 es
in vec2 aVertexPosition;

void main() {
  gl_Position = vec4(aVertexPosition, 0, 1);
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


  let { program, 
    indexBuffer, 
    attributeBuffer,
    vao } = play.glProgram(vSource, fSource)

  play.glUse(program)

  let nb = 1

  let _indexBuffer = new Uint16Array(nb * 3)
  let _attributeBuffer = new Float32Array(nb * 6)
  
  _attributeBuffer[0] = 0
  _attributeBuffer[1] = 0
  _attributeBuffer[2] = 0
  _attributeBuffer[3] = 1
  _attributeBuffer[4] = 1
  _attributeBuffer[5] = 1

  _indexBuffer[0] = 0
  _indexBuffer[1] = 1
  _indexBuffer[2] = 2

  play.glAttribUpdate(attributeBuffer, _attributeBuffer)
  play.glIndexUpdate(indexBuffer, _indexBuffer)

  play.glClear()
  play.glDraw(8, vao)


}

export default function app(element: HTMLElement) {

  manual(element)

}
