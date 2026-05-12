import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-base64',
  imports: [FormsModule],
  templateUrl: './base64.component.html',
  styleUrl: './base64.component.scss'
})
export class Base64Component {
  input = signal('');
  output = signal('');
  error = signal('');
  showToast = signal(false);

  encode() {
    try {
      this.output.set(btoa(unescape(encodeURIComponent(this.input()))));
      this.error.set('');
    } catch (e: any) {
      this.error.set('編碼失敗：' + e.message);
    }
  }

  decode() {
    try {
      this.output.set(decodeURIComponent(escape(atob(this.input()))));
      this.error.set('');
    } catch (e: any) {
      this.error.set('解碼失敗：輸入不是有效的 Base64 字串');
    }
  }

  swap() {
    const tmp = this.input();
    this.input.set(this.output());
    this.output.set(tmp);
  }

  clear() {
    this.input.set('');
    this.output.set('');
    this.error.set('');
  }

  async copy() {
    if (!this.output()) return;
    await navigator.clipboard.writeText(this.output());
    this.showToast.set(true);
    setTimeout(() => this.showToast.set(false), 2000);
  }
}
