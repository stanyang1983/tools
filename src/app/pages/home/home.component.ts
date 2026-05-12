import { Component, signal } from '@angular/core';
import { ToolsService, TOOL_CATEGORIES } from '../../shared/tools.service';
import { ToolCardComponent } from '../../shared/tool-card/tool-card.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',
  imports: [ToolCardComponent, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  categories = TOOL_CATEGORIES;
  activeCategory = signal('全部');
  searchQuery = signal('');

  constructor(private toolsService: ToolsService) {}

  get tools() {
    const q = this.searchQuery();
    if (q.length > 1) return this.toolsService.search(q);
    return this.toolsService.getByCategory(this.activeCategory());
  }

  setCategory(cat: string) {
    this.activeCategory.set(cat);
    this.searchQuery.set('');
  }

  onSearch(q: string) {
    this.searchQuery.set(q);
    if (q.length > 0) this.activeCategory.set('全部');
  }
}
