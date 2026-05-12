import { Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ToolsService } from '../../shared/tools.service';
import { LayoutService } from '../../shared/layout.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {
  searchQuery = signal('');
  showSearch = signal(false);

  constructor(
    private tools: ToolsService,
    private router: Router,
    public layout: LayoutService,
  ) {}

  onSearch(q: string) { this.searchQuery.set(q); }

  get results() {
    const q = this.searchQuery();
    return q.length > 1 ? this.tools.search(q) : [];
  }

  navigate(route: string) {
    this.router.navigateByUrl(route);
    this.searchQuery.set('');
    this.showSearch.set(false);
    this.layout.close();
  }

  toggleSearch() {
    this.showSearch.update(v => !v);
    if (!this.showSearch()) this.searchQuery.set('');
  }
}
