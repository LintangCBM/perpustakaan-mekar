import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'buku/:id',
    renderMode: RenderMode.Server,
  },
  {
    path: 'informasi/:slug',
    renderMode: RenderMode.Server,
  },
];
