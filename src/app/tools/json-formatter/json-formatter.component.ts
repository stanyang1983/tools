import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-json-formatter',
  imports: [FormsModule],
  templateUrl: './json-formatter.component.html',
  styleUrl: './json-formatter.component.scss'
})
export class JsonFormatterComponent {
  input = signal('');
  output = signal('');
  error = signal('');
  showToast = signal(false);
  indentSize = signal(2);

  format() {
    try {
      const parsed = JSON.parse(this.input());
      this.output.set(JSON.stringify(parsed, null, this.indentSize()));
      this.error.set('');
    } catch (e: any) {
      this.error.set(e.message);
      this.output.set('');
    }
  }

  minify() {
    try {
      const parsed = JSON.parse(this.input());
      this.output.set(JSON.stringify(parsed));
      this.error.set('');
    } catch (e: any) {
      this.error.set(e.message);
      this.output.set('');
    }
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

  loadSample() {
    this.input.set(JSON.stringify({
      name: 'ToolsHub',
      version: '1.0.0',
      tools: ['JSON格式化', 'Base64', '色彩轉換', '文字比對'],
      config: { dark: true, language: 'zh-TW' }
    }));
  }
}
