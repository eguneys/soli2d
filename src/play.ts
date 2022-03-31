import Canvas from './canvas'
import { generateProgram } from './program'

import { Texture } from './types'

export default class Play {


  get gl() { return this.canvas.gl }

  get width(): number { return this.canvas.width }
  get height(): number { return this.canvas.height }

  constructor(readonly canvas: Canvas) { }


  glOnce = () => {

    let { gl } = this

    if (!gl) { return }

    gl.viewport(0, 0, this.width, this.height)
    gl.clearColor(0, 0, 0, 1)


    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  }

  glProgram = (vSource: string, fSource: string) => {

    let { gl } = this

    let { program, uniformData, attributeData } = 
      generateProgram(gl, vSource, fSource)

    // gl.uniformMatrix3fv(uniformData['projectionMatrix'].location, false, this.projectionMatrix)
    //gl.uniform1i(uniformData['uSampler'].location, 0)

    let vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    let attributeBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, attributeBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, 24, gl.DYNAMIC_DRAW)
    
    let indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, 32, gl.DYNAMIC_DRAW)

    let stride = 0

    let a1loc = attributeData['aVertexPosition'].location
    gl.enableVertexAttribArray(a1loc)
    gl.vertexAttribPointer(a1loc, 2, gl.FLOAT, false, stride, 0)


      /*
    let a2loc = attributeData['aTextureCoord'].location
    gl.enableVertexAttribArray(a2loc)
    gl.vertexAttribPointer(a2loc, 2, gl.FLOAT, false, stride, 2*4)
       */

    gl.bindVertexArray(null)


    return {
      program,
      indexBuffer,
      attributeBuffer,
      vao
    }
  }
  
  glUse(program) {
    let { gl } = this

    gl.useProgram(program)
  }

  glAttribUpdate(buffer, srcData) {

    let { gl } = this

    gl.bindBuffer(gl.ARRAY_BUFFER, buffer)
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, srcData, 0)
  }

  glIndexUpdate(buffer, srcData) {

    let { gl } = this

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffer)
    gl.bufferSubData(gl.ELEMENT_ARRAY_BUFFER, 0, srcData, 0)
  }

  glClear() {
    let { gl } = this
    gl.clear(gl.COLOR_BUFFER_BIT)
  }

  glDraw(nb, vao) {
    let { gl } = this
    gl.bindVertexArray(vao)
    gl.drawElements(gl.TRIANGLES, nb, gl.UNSIGNED_SHORT, 0)
  }
}
