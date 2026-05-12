import { Component, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface DiffLine {
  type: 'added' | 'removed' | 'unchanged';
  content: string;
  lineA?: number;
  lineB?: number;
}

@Component({
  selector: 'app-text-diff',
  imports: [FormsModule],
  templateUrl: './text-diff.component.html',
  styleUrl: './text-diff.component.scss'
})
export class TextDiffComponent {
  textA = signal('');
  textB = signal('');

  diff = computed<DiffLine[]>(() => {
    const a = this.textA().split('\n');
    const b = this.textB().split('\n');
    return this.computeDiff(a, b);
  });

  get stats() {
    const d = this.diff();
    return {
      added: d.filter(l => l.type === 'added').length,
      removed: d.filter(l => l.type === 'removed').length,
      unchanged: d.filter(l => l.type === 'unchanged').length,
    };
  }

  loadSample() {
    this.textA.set('function hello() {\n  console.log("Hello World");\n  return true;\n}');
    this.textB.set('function hello(name: string) {\n  console.log(`Hello ${name}`);\n  return name.length > 0;\n}');
  }

  clear() {
    this.textA.set('');
    this.textB.set('');
  }

  private computeDiff(a: string[], b: string[]): DiffLine[] {
    const dp: number[][] = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
    for (let i = a.length - 1; i >= 0; i--)
      for (let j = b.length - 1; j >= 0; j--)
        dp[i][j] = a[i] === b[j] ? dp[i+1][j+1] + 1 : Math.max(dp[i+1][j], dp[i][j+1]);

    const result: DiffLine[] = [];
    let i = 0, j = 0;
    while (i < a.length || j < b.length) {
      if (i < a.length && j < b.length && a[i] === b[j]) {
        result.push({ type: 'unchanged', content: a[i], lineA: i+1, lineB: j+1 });
        i++; j++;
      } else if (j < b.length && (i >= a.length || dp[i][j+1] >= dp[i+1][j])) {
        result.push({ type: 'added', content: b[j], lineB: j+1 });
        j++;
      } else {
        result.push({ type: 'removed', content: a[i], lineA: i+1 });
        i++;
      }
    }
    return result;
  }
}
