import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Tool } from '../tools.service';

@Component({
  selector: 'app-tool-card',
  imports: [RouterLink],
  templateUrl: './tool-card.component.html',
  styleUrl: './tool-card.component.scss'
})
export class ToolCardComponent {
  @Input({ required: true }) tool!: Tool;
}
