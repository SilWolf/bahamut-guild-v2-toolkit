const characters =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcefghijklmnopqrstuvwxyz0123456789_'

export const generateRandomId = (): string => {
  return new Array(12)
    .fill('0')
    .map(() => characters[Math.floor(characters.length * Math.random())])
    .join('')
}
