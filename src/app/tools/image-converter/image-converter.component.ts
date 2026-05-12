import { Component, signal, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';

export const OUTPUT_FORMATS = [
  { value: 'image/png',  label: 'PNG',  ext: 'png',  hasQuality: false },
  { value: 'image/jpeg', label: 'JPEG', ext: 'jpg',  hasQuality: true  },
  { value: 'image/webp', label: 'WebP', ext: 'webp', hasQuality: true  },
  { value: 'image/avif', label: 'AVIF', ext: 'avif', hasQuality: true  },
  { value: 'image/bmp',  label: 'BMP',  ext: 'bmp',  hasQuality: false },
] as const;

export interface ConvertedResult {
  format: string;
  ext: string;
  dataUrl: string;
  blob: Blob;
  size: number;
  width: number;
  height: number;
}

@Component({
  selector: 'app-image-converter',
  imports: [FormsModule],
  templateUrl: './image-converter.component.html',
  styleUrl: './image-converter.component.scss'
})
export class ImageConverterComponent {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  isDragging = signal(false);
  isProcessing = signal(false);

  sourceFile = signal<File | null>(null);
  sourceDataUrl = signal('');
  sourceInfo = signal<{ width: number; height: number; size: number; type: string } | null>(null);

  outputFormats = OUTPUT_FORMATS;
  selectedFormat = signal('image/png');
  quality = signal(90);
  scaleMode = signal<'original' | 'percent' | 'pixels'>('original');
  scalePercent = signal(100);
  scaleWidth = signal(0);
  scaleHeight = signal(0);
  keepAspect = signal(true);
  bgColor = signal('#ffffff');
  convertAll = signal(false);

  results = signal<ConvertedResult[]>([]);

  get selectedFormatMeta() {
    return OUTPUT_FORMATS.find(f => f.value === this.selectedFormat()) ?? OUTPUT_FORMATS[0];
  }

  get hasQuality() {
    return this.selectedFormatMeta.hasQuality || this.convertAll();
  }

  onDragOver(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(true);
  }

  onDragLeave() {
    this.isDragging.set(false);
  }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);
    const file = e.dataTransfer?.files[0];
    if (file) this.loadFile(file);
  }

  onFileSelect(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (file) this.loadFile(file);
  }

  private loadFile(file: File) {
    if (!file.type.startsWith('image/')) return;
    this.sourceFile.set(file);
    this.results.set([]);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target!.result as string;
      this.sourceDataUrl.set(dataUrl);
      const img = new Image();
      img.onload = () => {
        this.sourceInfo.set({ width: img.naturalWidth, height: img.naturalHeight, size: file.size, type: file.type });
        this.scaleWidth.set(img.naturalWidth);
        this.scaleHeight.set(img.naturalHeight);
      };
      img.src = dataUrl;
    };
    reader.readAsDataURL(file);
  }

  onWidthChange(w: number) {
    const info = this.sourceInfo();
    if (this.keepAspect() && info) {
      this.scaleHeight.set(Math.round(w * (info.height / info.width)));
    }
    this.scaleWidth.set(w);
  }

  onHeightChange(h: number) {
    const info = this.sourceInfo();
    if (this.keepAspect() && info) {
      this.scaleWidth.set(Math.round(h * (info.width / info.height)));
    }
    this.scaleHeight.set(h);
  }

  async convert() {
    const info = this.sourceInfo();
    const src = this.sourceDataUrl();
    if (!info || !src) return;

    this.isProcessing.set(true);
    this.results.set([]);

    const img = await this.loadImage(src);
    const { w, h } = this.getTargetSize(info);

    const fmts = this.convertAll()
      ? OUTPUT_FORMATS.map(f => f.value)
      : [this.selectedFormat()];

    const converted: ConvertedResult[] = [];
    for (const fmt of fmts) {
      const r = await this.renderToFormat(img, w, h, fmt);
      if (r) converted.push(r);
    }

    this.results.set(converted);
    this.isProcessing.set(false);
  }

  private getTargetSize(info: { width: number; height: number }) {
    if (this.scaleMode() === 'percent') {
      const p = this.scalePercent() / 100;
      return { w: Math.round(info.width * p), h: Math.round(info.height * p) };
    }
    if (this.scaleMode() === 'pixels') {
      return { w: this.scaleWidth(), h: this.scaleHeight() };
    }
    return { w: info.width, h: info.height };
  }

  private loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
  }

  private async renderToFormat(img: HTMLImageElement, w: number, h: number, mimeType: string): Promise<ConvertedResult | null> {
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d')!;

    if (mimeType === 'image/jpeg' || mimeType === 'image/bmp') {
      ctx.fillStyle = this.bgColor();
      ctx.fillRect(0, 0, w, h);
    }
    ctx.drawImage(img, 0, 0, w, h);

    const qualityVal = this.quality() / 100;
    const fmt = OUTPUT_FORMATS.find(f => f.value === mimeType)!;

    return new Promise(resolve => {
      canvas.toBlob(blob => {
        if (!blob) { resolve(null); return; }
        const dataUrl = canvas.toDataURL(mimeType, qualityVal);
        resolve({ format: fmt.label, ext: fmt.ext, dataUrl, blob, size: blob.size, width: w, height: h });
      }, mimeType, qualityVal);
    });
  }

  download(result: ConvertedResult) {
    const baseName = this.sourceFile()?.name.replace(/\.[^.]+$/, '') ?? 'image';
    const a = document.createElement('a');
    a.href = result.dataUrl;
    a.download = `${baseName}.${result.ext}`;
    a.click();
  }

  downloadAll() {
    this.results().forEach(r => this.download(r));
  }

  clear() {
    this.sourceFile.set(null);
    this.sourceDataUrl.set('');
    this.sourceInfo.set(null);
    this.results.set([]);
    if (this.fileInputRef) this.fileInputRef.nativeElement.value = '';
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
  }

  compressionRatio(result: ConvertedResult): string {
    const src = this.sourceInfo()?.size ?? 1;
    const diff = ((1 - result.size / src) * 100);
    return (diff >= 0 ? '-' : '+') + Math.abs(diff).toFixed(1) + '%';
  }

  isSmaller(result: ConvertedResult): boolean {
    return result.size < (this.sourceInfo()?.size ?? Infinity);
  }
}
