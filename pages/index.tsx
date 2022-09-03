import useSWR from 'swr'

import React, { useState, useRef, useEffect } from 'react'
import Cropper from 'react-cropper'
import 'cropperjs/dist/cropper.css'
//import './Demo.css'
import { Form, TextArea } from 'semantic-ui-react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
//window.Buffer = window.Buffer || require('buffer').Buffer

const defaultSrc =
  'https://tom.imgix.net/photo-1432405972618-c60b0225b8f9.jpeg?fit=crop&q=80'

const fetcher = (url: string) => fetch(url).then((res) => res.json())

export default function Index() {
  const [image, setImage] = useState(defaultSrc)
  const [cropData, setCropData] = useState('#')
  const [cropper, setCropper] = useState<Cropper>()
  const [fullSrcSet, setSrcSet] = useState('')
  const [isCopied, setIsCopied] = useState(false)
  const [baseURL, setBaseUrl] = useState('THIS SHOULD CHANGE')
  const imageRef = useRef<HTMLImageElement>(null)
  useEffect(() => {}, [cropData])

  const { data, error } = useSWR('/api/upload', fetcher)

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>

  async function uploadPicturesToSource(data) {
    console.log(data.name)

    await fetch(
      `https://api.imgix.com/api/v1/sources/upload/62e31fcb03d7afea23063596/` +
        data.name,
      {
        method: 'POST',
        body: data,
        headers: {
          Authorization: 'Bearer ' + 'DELETED',
          'Content-Type': data.type,
        },
      },
    )
  }

  const onChange = (e) => {
    e.preventDefault()
    let files
    if (e.dataTransfer) {
      files = e.dataTransfer.files
    } else if (e.target) {
      files = e.target.files
    }
    const reader = new FileReader()
    reader.onload = () => {
      setImage(reader.result) //adds it to display
      uploadPicturesToSource(files[0])
    }
    reader.readAsDataURL(files[0])
    setBaseUrl('https://sourcerer.imgix.net/' + files[0].name)
  }

  const srcsetGenerateFunction = (finalSrcSetString: any) => {
    setSrcSet(finalSrcSetString)
  }

  const createSrcSet = () => {
    console.log('createSrcSet function')
    console.log(image)

    const xValue = Math.round(cropper.getData().x)
    const yValue = Math.round(cropper.getData().y)
    const widthValue = Math.round(cropper.getData().width)
    const heightValue = Math.round(cropper.getData().height)

    let size = 100
    let imgSrcSet = ''
    let finalSrcSetString = ''
    const incrementPercentage = 8
    const maxSize = 8192

    while (size <= maxSize) {
      const evenSize = 2 * Math.round(size / 2)
      imgSrcSet += `${baseURL}?auto=format,compress&w=${evenSize}&rect=${xValue},${yValue},${widthValue},${heightValue} ${evenSize}w`
      size *= 1 + (incrementPercentage / 100) * 2

      if (size < maxSize) {
        imgSrcSet += ', '
      }
    }

    finalSrcSetString = `<img srcset="${imgSrcSet}" src="${baseURL}&auto=format,compress&&rect=${xValue},${yValue},${widthValue},${heightValue}" sizes="(min-width: 1024px) 600px, (min-width: 600px) 50vw, 100vw" />`

    srcsetGenerateFunction(finalSrcSetString)
    setCropData(
      `${baseURL}?auto=format,compress&rect=${xValue},${yValue},${widthValue},${heightValue}`,
    )
    console.log('cropData is' + cropData)

    // console.log(finalSrcSetString);
  }

  const getCropData = () => {
    if (typeof cropper !== 'undefined') {
      // setCropData(cropper.getCroppedCanvas().toDataURL());
      createSrcSet()
    }
  }

  const onCopyText = () => {
    setIsCopied(true)
    setTimeout(() => {
      setIsCopied(false)
    }, 1000)
  }

  const setToDefaultImage = (e) => {
    // console.log(e);
    setImage(e)
  }

  return (
    <div>
      <h1>Srcset generator</h1>
      <h3>Select an image</h3>
      <div className="row">
        <div className="column">
          <img
            src="https://tom.imgix.net/photo-1432405972618-c60b0225b8f9.jpeg?fit=crop&q=80&w=400&auto=format"
            alt="Waterfall"
            style={{ width: '100%' }}
            onClick={() =>
              setToDefaultImage(
                'https://tom.imgix.net/photo-1432405972618-c60b0225b8f9.jpeg?fit=crop&q=80',
              )
            }
          />
        </div>
        <div className="column">
          <img
            src="https://tom.imgix.net/photo-1418985991508-e47386d96a71.jpeg?fit=crop&q=80&w=400&auto=format"
            alt="Snow"
            style={{ width: '100%' }}
            onClick={() =>
              setToDefaultImage(
                'https://tom.imgix.net/photo-1418985991508-e47386d96a71.jpeg?fit=crop&q=80',
              )
            }
          />
        </div>
        <div className="column">
          <img
            src="https://tom.imgix.net/photo-1473580044384-7ba9967e16a0.jpeg?fit=crop&q=80&w=400&auto=format"
            alt="Mountains"
            style={{ width: '100%' }}
            onClick={() =>
              setToDefaultImage(
                'https://tom.imgix.net/photo-1473580044384-7ba9967e16a0.jpeg?fit=crop&q=80',
              )
            }
          />
        </div>
      </div>
      <div style={{ width: '100%' }}>
        <input type="file" onChange={onChange} />

        {/* <input type="file" onChange={onChange} />
        <button>Use default img</button> */}
        <br />
        <br />

        <Cropper
          style={{ height: 'auto', width: '100%' }}
          initialAspectRatio={1}
          preview=".img-preview"
          src={image}
          ref={imageRef}
          viewMode={1}
          zoomable={false}
          guides={true}
          minCropBoxHeight={10}
          minCropBoxWidth={10}
          background={false}
          responsive={true}
          checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
          onInitialized={(instance) => {
            setCropper(instance)
          }}
        />
      </div>

      <div>
        <div className="box" style={{ width: '50%', float: 'right' }}>
          <h1>Preview</h1>
          <div
            className="img-preview"
            style={{ width: '100%', float: 'left', height: '300px' }}
          />
        </div>
        <div
          className="box"
          style={{ width: '50%', float: 'right', height: '300px' }}
        >
          <h1>
            <span>Crop</span>
            <button style={{ float: 'right' }} onClick={getCropData}>
              Crop Image
            </button>
          </h1>
          <img style={{ width: '40%' }} src={cropData} alt="after cropped" />
        </div>
      </div>
      <br style={{ clear: 'both' }} />

      <br />
      <br />
      <br />
      <CopyToClipboard text={fullSrcSet} onCopy={onCopyText}>
        <div className="copy-area">
          <button>Copy to Clipboard</button>
          <span className={`copy-feedback ${isCopied ? 'active' : ''}`}>
            Copied!
          </span>
        </div>
      </CopyToClipboard>
      <Form>
        <TextArea
          placeholder="Your srcset will generate here"
          value={fullSrcSet}
          style={{ minHeight: 500, minWidth: 1000 }}
        />
      </Form>
    </div>
  )
}
