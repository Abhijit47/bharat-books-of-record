import { getPixels } from '@unpic/pixels'
import { getDominantColor } from '@unpic/placeholder'
import { encode } from 'blurhash'
import { promises as fs } from 'node:fs'

export async function getDominantColorFromImageFile(filePath: string) {
  // Read the image data from a file
  const pngData = await fs.readFile(filePath)

  // Decode the image data into raw pixel data
  const { data } = await getPixels(pngData)

  // Argument of type 'Uint8Array<ArrayBufferLike>' is not assignable to parameter of type 'Uint8ClampedArray<ArrayBufferLike>'.
  const clampedData = new Uint8ClampedArray(data.buffer)

  // Get the dominant color
  return getDominantColor(clampedData)
}

export async function blurhash(url: string) {
  const jpgData = await getPixels(url)
  const data = Uint8ClampedArray.from(jpgData.data)
  const blurrhashed = encode(data, jpgData.width, jpgData.height, 4, 4)

  return blurrhashed
}

// export async function getBlurhashPlaceholder(url: string) {
//   const imgData = getPixels(url)
//   const data = Uint8ClampedArray.from(imgData.data)
// }
