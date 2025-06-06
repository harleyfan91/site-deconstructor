
declare module 'node-vibrant' {
  interface Swatch { hex: string }
  interface Palette { [name: string]: Swatch | null }
  export default class Vibrant {
    constructor(image: string)
    static from(src: string): Vibrant
    getPalette(): Promise<Palette>
  }
}

