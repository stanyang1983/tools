import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent),
  },
  {
    path: 'tools/json-formatter',
    loadComponent: () => import('./tools/json-formatter/json-formatter.component').then(m => m.JsonFormatterComponent),
  },
  {
    path: 'tools/base64',
    loadComponent: () => import('./tools/base64/base64.component').then(m => m.Base64Component),
  },
  {
    path: 'tools/color-picker',
    loadComponent: () => import('./tools/color-picker/color-picker.component').then(m => m.ColorPickerComponent),
  },
  {
    path: 'tools/text-diff',
    loadComponent: () => import('./tools/text-diff/text-diff.component').then(m => m.TextDiffComponent),
  },
  {
    path: 'tools/image-converter',
    loadComponent: () => import('./tools/image-converter/image-converter.component').then(m => m.ImageConverterComponent),
  },
  {
    path: '**',
    redirectTo: '',
  },
];
