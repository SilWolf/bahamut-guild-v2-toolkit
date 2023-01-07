const IMGUR_CLIENT_ID = 'aef87581a602ff3'

export const postImgurImage = (file: File): Promise<{ link: string }> => {
  const formData = new FormData()
  formData.append('image', file)
  // formData.append('type', 'base64')

  return fetch('https://api.imgur.com/3/image', {
    method: 'POST',
    headers: new Headers({
      Authorization: `Client-ID ${IMGUR_CLIENT_ID}`,
    }),
    body: formData,
  })
    .then((res) => {
      return res.json()
    })
    .then((json) => json.data)
    .catch((e) => {
      console.log(e)
    })
}
