import Canvas from './canvas'
import { generateProgram } from './program'

import { Texture } from './types'
import { Matrix } from './math'

export default class Play {


  get gl() { return this.canvas.gl }

  get width(): number { return this.canvas.width }
  get height(): number { return this.canvas.height }

  projectionMatrix: Matrix

  constructor(readonly canvas: Canvas) { 
    this.projectionMatrix = Matrix.projection(this.width, this.height)
  }


  glOnce = () => {

    let { gl } = this

    if (!gl) { return }

    gl.viewport(0, 0, this.width, this.height)
    gl.clearColor(0, 0, 0, 1)


    gl.enable(gl.BLEND)
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA)
  }

  glProgram = (vSource: string, fSource: string, nb: number) => {

    let { gl } = this

    let { program, uniformData, attributeData } = 
      generateProgram(gl, vSource, fSource)

    //gl.uniform1i(uniformData['uSampler'].location, 0)

    let vao = gl.createVertexArray()
    gl.bindVertexArray(vao)

    let attributeBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, attributeBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, nb * 6 * 4, gl.DYNAMIC_DRAW)
    
    let indexBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, nb * 3 * 4, gl.DYNAMIC_DRAW)

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
      uniformData,
      indexBuffer,
      attributeBuffer,
      vao
    }
  }
  
  glUse(program, uniformData) {
    let { gl } = this

    gl.useProgram(program)


    gl.uniformMatrix3fv(uniformData['projectionMatrix'].location, false, this.projectionMatrix.array_t)
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
