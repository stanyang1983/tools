/// <reference lib="webworker" />
import {
  AutoProcessor,
  AutoModelForImageSegmentation,
  RawImage,
  env,
} from '@huggingface/transformers';

env.allowLocalModels = false;
env.useBrowserCache = true;

const MODEL_ID = 'onnx-community/BiRefNet-portrait';

let processor: any = null;
let model: any = null;

function onProgress(p: any) {
  postMessage({ type: 'progress', data: p });
}

async function loadModel() {
  postMessage({ type: 'status', message: '下載模型中（首次約 200 MB）...' });

  processor = await AutoProcessor.from_pretrained(MODEL_ID, {
    progress_callback: onProgress,
  });

  model = await AutoModelForImageSegmentation.from_pretrained(MODEL_ID, {
    dtype: 'fp32',
    progress_callback: onProgress,
  });

  postMessage({ type: 'ready' });
}

async function processImage(imageUrl: string) {
  postMessage({ type: 'status', message: '分析圖片中...' });

  const image = await RawImage.fromURL(imageUrl);
  const { pixel_values } = await processor(image);
  const result = await model({ input: pixel_values });

  // BiRefNet returns { output: Tensor[] } where [0] is the finest-level mask in [0,1]
  const raw = result.output;
  const outputTensor = Array.isArray(raw) ? raw[0] : raw;

  const mask = await RawImage
    .fromTensor(outputTensor.squeeze().mul(255).to('uint8'))
    .resize(image.width, image.height);

  postMessage({
    type: 'mask',
    maskData: mask.data,
    width: image.width,
    height: image.height,
  });
}

addEventListener('message', async ({ data }) => {
  try {
    switch (data.type) {
      case 'load':    await loadModel(); break;
      case 'process': await processImage(data.imageUrl); break;
    }
  } catch (e: any) {
    postMessage({ type: 'error', message: e.message });
  }
});
