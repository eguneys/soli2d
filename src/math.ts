export class Vec2 {

  static make = (x: number, y: number) =>
    new Vec2(x, y)

  static unit = new Vec2(1, 1)
  static zero = new Vec2(0, 0)

  get vs(): Array<number> {
    return [this.x, this.y]
  }

  constructor(readonly x: number, 
    readonly y: number) {

  }

  addy(n: number) {
    return Vec2.make(this.x, this.y + n)
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


  static unit = Rectangle.make(0, 0, 1, 1)

  
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

  static identity = new Matrix(1, 0, 0, 1, 0, 0)

  static unit = Matrix.identity

  static projection = (width: number, height: number) => {
    let b = 0,
      c = 0 

    let a = 1 / width * 2,
      d = -1 / height * 2,
      tx = -1,
      ty = 1 

    return new Matrix(a, b, c, d, tx, ty)
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

  rotate(r: number): Matrix {

    let cosa = Math.cos(r),
      sina = Math.sin(r)

    let a = cosa * this.a - sina * this.b,
      b = sina * this.a + cosa * this.b,
      c = cosa * this.c - sina * this.d,
      d = sina * this.c + cosa * this.d,
      tx = cosa * this.tx - sina * this.ty,
      ty = sina * this.tx + cosa * this.ty

    return new Matrix(a, b, c, d, tx, ty)
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

  translate(x: number, y: number): Matrix {

    let a = this.a,
      b = this.b,
      c = this.c,
      d = this.d,
      tx = x + this.tx,
      ty = y + this.ty

    return new Matrix(a, b, c, d, tx, ty)
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
}


