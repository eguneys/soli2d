import { TexTint } from './textint'

export class Transform {


  __flat: Array<Transform>
  get _flat() {
    if (!this.__flat) {
      this.__flat = [
        this,
        ...this._children.flatMap(_ => _._flat)
      ]
    }
    return this.__flat
  }


  _parent?: Transform

  constructor(readonly _children: Array<Transform> = [],
              readonly world: Matrix = Matrix.unit,
              readonly _local: Matrix = Matrix.unit) {}

  // sprite props
  textint?: TexTint

  get quad() {
    return this.textint?.quad
  }

  get tint() {
    return this._tint
  }

  set quad(quad: Quad) {
    this.textint = new TexTint(quad, this._tint)
  }

  _tint: Color = 0xffffff
  set tint(tint?: Color) {
    this._tint = tint
    if (this.textint) {
      this.textint.tint = tint
    }
  }

  // transform props
  size: Vec2 = Vec2.unit
  pivot: Vec2 = Vec2.zero
  scale: Vec2 = Vec2.unit
  rotation: number = 0
  translate: Vec2 = Vec2.zero

  get clone() {
    let res = new Transform([], this.world.clone, this._local.clone)
    //res._parent = this._parent
    this._children.forEach(_ => _.clone._set_parent(res))

    res.size = this.size.clone
    res.pivot = this.pivot.clone
    res.scale = this.scale.clone
    res.rotation = this.rotation
    res.translate = this.translate.clone
    res.quad  = this.quad
    res.tint = this.tint


    res._dirty_upto_parent()
    res._update_world()
    return res
  }

  get local() {
    let { size, scale, rotation, translate, pivot } = this

    // TODO GC
    let _scale = scale.mul(size)
    this._local
    .transform_in(_scale, rotation, translate, pivot)

    return this._local
  }

  get x() {
    return this.translate.x
  }
  set x(x: number) {
    this.translate.set_in(x, this.y)
  }

  get y() {
    return this.translate.y
  }
  set y(y: number) {
    this.translate.set_in(this.x, y)
  }

  _dirty_upto_parent() {
    let node = this
    do {
      node.__flat = undefined
    } while(node = node._parent)

  }

  _clean_children() {
    this._children.splice(0)
    this._dirty_upto_parent()
  }

  _set_parent(_parent: Transform) {
    _parent._children.push(this)
    this._parent = _parent

    this._dirty_upto_parent()
  }

  get _next_sibling() {
    return this._parent._children[this._parent._children.indexOf(this) + 1]
  }

  _insert_before(new_child, reference_child) {
    let i_ref = this._children.indexOf(reference_child)
    if (i_ref === -1) {
      i_ref = this._children.length
    }
    new_child._remove()
    this._children.splice(i_ref, 0, new_child)
    new_child._parent = this
    new_child._dirty_upto_parent()
  }

  _replace_child(new_child, old_child) {
    new_child._remove()
    this._children.splice(this._children.indexOf(old_child), 1, new_child)
    new_child._parent = this
    new_child._dirty_upto_parent()
  }


  _remove() {
    if (!this._parent) {
      return
    }
    this._parent._children.splice(this._parent._children.indexOf(this), 1)
    this._parent._dirty_upto_parent()
    this._parent = undefined
  }

  _update_world(_parent_world: Matrix) {
    if (_parent_world) {
      this.world.set_in(_parent_world)
      this.world.mul_in(this.local)
    } else {
      this.world.set_in(this.local)
    }

    let { world } = this

    this._children
    .forEach(child =>
             child._update_world(world))
  }
}




export class Vec2 {

  static make = (x: number, y: number) =>
    new Vec2(x, y)

  static get unit() { return new Vec2(1, 1) }
  static get zero() { return new Vec2(0, 0) }

  get vs(): Array<number> {
    return [this.x, this.y]
  }

  get mul_inverse(): Vec2 {
    return new Vec2(1/this.x, 1/this.y)
  }

  get add_inverse(): Vec2 {
    return new Vec2(-this.x, -this.y)
  }

  get half(): Vec2 {
    return new Vec2(this.x/2, this.y/2)
  }

  get clone(): Vec2 {
    return new Vec2(this.x, this.y)
  }

  constructor(readonly x: number, 
    readonly y: number) { }

  addy(n: number) {
    return Vec2.make(this.x, this.y + n)
  }

  add(v: Vec2) {
    let { clone } = this
    clone.add_in(v)
    return clone
  }

  add_in(v: Vec2) {
    this.x += v.x
    this.y += v.y
  }


  sub(v: Vec2) {
    let { clone } = this
    clone.sub_in(v)
    return clone
  }

  sub_in(v: Vec2) {
    this.x -= v.x
    this.y -= v.y
  }

  mul(v: Vec2) {
    let { clone } = this
    clone.mul_in(v)
    return clone
  }

  mul_in(v: Vec2) {
    this.x *= v.x
    this.y *= v.y
  }

  div(v: Vec2) {
    let { clone } = this
    clone.div_in(v)
    return clone
  }

  div_in(v: Vec2) {
    this.x /= v.x
    this.y /= v.y
  }

  set_in(x: number, y: number = x) {
    this.x = x
    this.y = y
  }
}


export class Rectangle {
  static make = (x: number, y: number,
    w: number, h: number) => new Rectangle([
      Vec2.make(x, y),
      Vec2.make(x + w, y),
      Vec2.make(x + w, y + h),
      Vec2.make(x, y + h)
    ])


  static get unit() { return Rectangle.make(0, 0, 1, 1) }


  get vs() { 
    let { x, y, w, h } = this
    return [x, y, w, h] 
  }

  
  get x1() { return this.vertices[0].x }
  get y1() { return this.vertices[0].y }
  get x2() { return this.vertices[2].x }
  get y2() { return this.vertices[2].y }

  get x() { return this.x1 }
  get y() { return this.y1 }
  get w() { return this.x2 - this.x1 }
  get h() { return this.y2 - this.y1 }

  get vertexData(): Float32Array {
    return new Float32Array(
      this.vertices.flatMap(_ =>
      _.vs))
  }

  get indices(): Uint16Array {
    return new Uint16Array([0, 1, 2, 0, 2, 3])
  }

  constructor(readonly vertices: Array<Vec2>) {
  }

  transform(m: Matrix): Rectangle {
    return new Rectangle(this.vertices.map(_ => m.mVec2(_)))
  }
}

export class Matrix {

  static get identity() { return new Matrix(1, 0, 0, 1, 0, 0) }

  static get unit() { return Matrix.identity }

  static projection = (width: number, height: number) => {
    let b = 0,
      c = 0 

    let a = 1 / width * 2,
      d = -1 / height * 2,
      tx = -1,
      ty = 1 

    return new Matrix(a, b, c, d, tx, ty)
  }


  get clone(): Matrix {
    let { a, b, c, d, tx, ty } = this
    return new Matrix(a,b,c,d,tx,ty)
  }


  get inverse(): Matrix {
    let { a, b, c, d, tx, ty } = this

    let n = a * d - b * c

    let a1 = d / n,
      b1 = -b / n,
      c1 = -c / n,
      d1 = a / n,
      tx1 = (c * ty - d * tx) / n,
      ty1 = -(a * ty - b * tx) / n

    return new Matrix(a1, b1, c1, d1, tx1, ty1)
  }

  readonly array_t: Float32Array

  // a c tx
  // b d ty
  // 0 0 1
  constructor(
    readonly a: number,
    readonly b: number,
    readonly c: number,
    readonly d: number,
    readonly tx: number,
    readonly ty: number) {
    this.array_t = new Float32Array([
      a, b, 0,
      c, d, 0,
      tx, ty, 1
    ])
  }

  rotate_in(r: number): Matrix {

    let cosa = Math.cos(r),
      sina = Math.sin(r)

    let a = this.a * cosa - this.b * sina,
      b = this.a * sina + this.b * cosa,
      c = this.c * cosa - this.d * sina,
      d = this.c * sina + this.d * cosa,
      tx = this.tx * cosa - this.ty * sina,
      ty = this.tx * sina + this.ty * cosa

    this.a = a
    this.b = b
    this.c = c
    this.d = d
    this.tx = tx
    this.ty = ty
  }

  rotate(r: number): Matrix {
    let { clone } = this
    clone.rotate_in(r)
    return clone
  }

  scale(x: number, y: number): Matrix {

    let a = this.a * x,
      b = this.b,
      c = this.c,
      d = this.d * y,
      tx = this.tx,
      ty = this.ty

    return new Matrix(a, b, c, d, tx, ty)
  }

  translate_in(x: number, y: number): Matrix {

    let a = this.a,
      b = this.b,
      c = this.c,
      d = this.d,
      tx = x + this.tx,
      ty = y + this.ty

    this.tx = tx
    this.ty = ty
  }


  translate(x: number, y: number) {
    let { clone } = this
    clone.translate_in(x, y)
    return clone
  }

  scale_in(x: number, y: number) {
    this.a = x
    this.d = y
  }

  mVec2(v: Vec2): Vec2 {

    let a = this.a,
      b = this.b,
      c = this.c,
      d = this.d,
      tx = this.tx,
      ty = this.ty

    let x = a * v.x + c * v.y + tx,
      y = b * v.x + d * v.y + ty

    return Vec2.make(x, y)
  }


  mul_in(m: Matrix) {
    let { a, b, c, d, tx, ty } = this

    this.a = m.a * a + m.b * c
    this.b = m.a * b + m.b * d
    this.c = m.c * a + m.d * c
    this.d = m.c * b + m.d * d

    this.tx = m.tx * a + m.ty * c + tx
    this.ty = m.tx * b + m.ty * d + ty
  }

  set_in(m: Matrix) {
    let { a, b, c, d, tx, ty } = m

    this.a = a
    this.b = b
    this.c = c
    this.d = d
    this.tx = tx
    this.ty = ty
  }

  transform_in(scale: Vec2, rotation: number, translate: Vec2, pivot: Vec2 = Vec2.half) {

    /*
    this.set_in(Matrix.unit)
    this.translate_in(-0.5, -0.5)
    this.scale_in(scale.x, scale.y)
    this.translate_in(0.5, 0.5)
    this.translate_in(-scale.x*0.5, -scale.y*0.5)
    this.rotate_in(rotation)
    //this.translate_in(scale.x * 0.5, scale.y * 0.5)
    this.translate_in(translate.x, translate.y)

   */

   this.a = Math.cos(rotation) * scale.x
   this.b = Math.sin(rotation) * scale.x
   this.c = - Math.sin(rotation) * scale.y
   this.d = Math.cos(rotation) * scale.y

   this.tx = translate.x - (pivot.x * this.a + pivot.y * this.c)
   this.ty = translate.y - (pivot.x * this.b + pivot.y * this.d)
  }

}


