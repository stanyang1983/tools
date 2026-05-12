import { Injectable } from '@angular/core';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  route: string;
  tags: string[];
  isNew?: boolean;
}

export const TOOL_CATEGORIES = ['全部', '文字', '編碼', '色彩', '圖片', '開發', '格式化'];

@Injectable({ providedIn: 'root' })
export class ToolsService {
  private tools: Tool[] = [
    {
      id: 'bg-remover',
      name: 'AI 去背工具',
      description: '使用 RMBG-1.4 模型在瀏覽器本地端去除圖片背景，無需上傳伺服器',
      icon: '✂️',
      category: '圖片',
      route: '/tools/bg-remover',
      tags: ['去背', 'AI', 'RMBG', '圖片'],
      isNew: true,
    },
    {
      id: 'image-converter',
      name: '圖片格式轉換',
      description: '支援 PNG、JPEG、WebP、BMP、GIF、AVIF 等格式互轉，可調整品質與尺寸',
      icon: '🖼',
      category: '圖片',
      route: '/tools/image-converter',
      tags: ['PNG', 'JPEG', 'WebP', 'AVIF', 'BMP', '圖片'],
      isNew: true,
    },
    {
      id: 'json-formatter',
      name: 'JSON 格式化',
      description: '格式化、壓縮、驗證 JSON 資料，支援語法高亮',
      icon: '{ }',
      category: '格式化',
      route: '/tools/json-formatter',
      tags: ['JSON', '格式化', '驗證'],
    },
    {
      id: 'base64',
      name: 'Base64 編解碼',
      description: '將文字或檔案進行 Base64 編碼與解碼',
      icon: '64',
      category: '編碼',
      route: '/tools/base64',
      tags: ['Base64', '編碼', '解碼'],
    },
    {
      id: 'text-diff',
      name: '文字差異比對',
      description: '比較兩段文字的差異，逐行高亮顯示變更',
      icon: '⇄',
      category: '文字',
      route: '/tools/text-diff',
      tags: ['Diff', '比對', '文字'],
    },
    {
      id: 'color-picker',
      name: '色彩轉換',
      description: 'HEX、RGB、HSL 格式互相轉換，一鍵複製',
      icon: '🎨',
      category: '色彩',
      route: '/tools/color-picker',
      tags: ['HEX', 'RGB', 'HSL', '色彩'],
      isNew: true,
    },
  ];

  getAll(): Tool[] {
    return this.tools;
  }

  getById(id: string): Tool | undefined {
    return this.tools.find(t => t.id === id);
  }

  getByCategory(category: string): Tool[] {
    if (category === '全部') return this.tools;
    return this.tools.filter(t => t.category === category);
  }

  search(query: string): Tool[] {
    const q = query.toLowerCase();
    return this.tools.filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.tags.some(tag => tag.toLowerCase().includes(q))
    );
  }
}
