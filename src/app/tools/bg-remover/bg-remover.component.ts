import {
  Component, signal, ElementRef, ViewChild, OnDestroy, NgZone
} from '@angular/core';

type Phase = 'ready' | 'processing' | 'done' | 'error';

@Component({
  selector: 'app-bg-remover',
  imports: [],
  templateUrl: './bg-remover.component.html',
  styleUrl: './bg-remover.component.scss'
})
export class BgRemoverComponent implements OnDestroy {
  @ViewChild('fileInput') fileInputRef!: ElementRef<HTMLInputElement>;

  phase = signal<Phase>('ready');
  statusMsg = signal('');
  progressPct = signal(0);
  progressFile = signal('');
  isDragging = signal(false);
  sourceDataUrl = signal('');
  resultDataUrl = signal('');
  sourceFile = signal<File | null>(null);
  errorMsg = signal('');
  showOriginal = signal(false);

  private resultObjectUrl = '';

  constructor(private zone: NgZone) {}

  ngOnDestroy() {
    if (this.resultObjectUrl) URL.revokeObjectURL(this.resultObjectUrl);
  }

  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragging.set(true); }
  onDragLeave() { this.isDragging.set(false); }
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
    this.resultDataUrl.set('');
    this.showOriginal.set(false);
    this.phase.set('ready');

    const reader = new FileReader();
    reader.onload = (ev) => this.sourceDataUrl.set(ev.target!.result as string);
    reader.readAsDataURL(file);
  }

  async process() {
    const file = this.sourceFile();
    if (!file || this.phase() === 'processing') return;

    this.phase.set('processing');
    this.progressPct.set(0);
    this.progressFile.set('');
    this.statusMsg.set('準備中...');
    if (this.resultObjectUrl) URL.revokeObjectURL(this.resultObjectUrl);
    this.resultDataUrl.set('');

    try {
      const { removeBackground } = await import('@imgly/background-removal');

      const blob = await removeBackground(file, {
        progress: (key: string, current: number, total: number) => {
          this.zone.run(() => {
            const pct = total > 0 ? Math.round((current / total) * 100) : 0;
            this.progressPct.set(pct);
            this.progressFile.set(key.replace(/^fetch:/, '').split('/').pop() ?? key);
            if (pct < 100) {
              this.statusMsg.set(`下載模型 ${pct}%`);
            } else {
              this.statusMsg.set('推論中...');
            }
          });
        },
      } as any);

      this.resultObjectUrl = URL.createObjectURL(blob);
      this.resultDataUrl.set(this.resultObjectUrl);
      this.phase.set('done');
    } catch (e: any) {
      this.phase.set('error');
      this.errorMsg.set(e.message ?? '去背失敗，請重試');
    }
  }

  download() {
    const name = this.sourceFile()?.name.replace(/\.[^.]+$/, '') ?? 'result';
    const a = document.createElement('a');
    a.href = this.resultDataUrl();
    a.download = `${name}-nobg.png`;
    a.click();
  }

  reset() {
    this.sourceFile.set(null);
    this.sourceDataUrl.set('');
    this.resultDataUrl.set('');
    this.phase.set('ready');
    this.showOriginal.set(false);
    if (this.fileInputRef) this.fileInputRef.nativeElement.value = '';
  }
}
