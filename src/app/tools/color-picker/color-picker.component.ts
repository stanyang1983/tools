import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-color-picker',
  imports: [FormsModule],
  templateUrl: './color-picker.component.html',
  styleUrl: './color-picker.component.scss'
})
export class ColorPickerComponent {
  hex = signal('#6366f1');
  showToast = signal(false);
  toastMsg = signal('');

  rgb = computed(() => this.hexToRgb(this.hex()));
  hsl = computed(() => this.rgbToHsl(this.rgb()));

  get rgbString() {
    const { r, g, b } = this.rgb();
    return `rgb(${r}, ${g}, ${b})`;
  }

  get hslString() {
    const { h, s, l } = this.hsl();
    return `hsl(${h}, ${s}%, ${l}%)`;
  }

  onHexInput(val: string) {
    if (/^#[0-9A-Fa-f]{6}$/.test(val)) this.hex.set(val);
  }

  onRgbInput(part: 'r' | 'g' | 'b', val: number) {
    const c = { ...this.rgb(), [part]: Math.min(255, Math.max(0, val)) };
    this.hex.set(this.rgbToHex(c.r, c.g, c.b));
  }

  async copy(text: string, label: string) {
    await navigator.clipboard.writeText(text);
    this.toastMsg.set(`已複製 ${label}`);
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 2000);
  }

  private hexToRgb(hex: string) {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  }

  private rgbToHex(r: number, g: number, b: number) {
    return '#' + [r, g, b].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  private rgbToHsl({ r, g, b }: { r: number; g: number; b: number }) {
    const rr = r / 255, gg = g / 255, bb = b / 255;
    const max = Math.max(rr, gg, bb), min = Math.min(rr, gg, bb);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case rr: h = ((gg - bb) / d + (gg < bb ? 6 : 0)) / 6; break;
        case gg: h = ((bb - rr) / d + 2) / 6; break;
        case bb: h = ((rr - gg) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  }
}
