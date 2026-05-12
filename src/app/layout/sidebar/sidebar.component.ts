import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ToolsService, TOOL_CATEGORIES } from '../../shared/tools.service';
import { LayoutService } from '../../shared/layout.service';
import { ThemeService } from '../../shared/theme.service';

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  categories = TOOL_CATEGORIES;
  activeCategory = signal('全部');
  collapsed = signal(false);

  constructor(
    private toolsService: ToolsService,
    public layout: LayoutService,
    public theme: ThemeService,
  ) {}

  get tools() {
    return this.toolsService.getByCategory(this.activeCategory());
  }

  setCategory(cat: string) {
    this.activeCategory.set(cat);
  }

  toggleCollapse() {
    this.collapsed.update(v => !v);
  }

  navigate() {
    this.layout.close();
  }
}
