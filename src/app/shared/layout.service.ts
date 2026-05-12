import { Injectable, signal, effect } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class LayoutService {
  sidebarOpen = signal(false);

  toggle() { this.sidebarOpen.update(v => !v); }
  close()  { this.sidebarOpen.set(false); }
}
