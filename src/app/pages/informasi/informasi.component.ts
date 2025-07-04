import { Component } from '@angular/core';

interface InfoCard {
  title: string;
  description: string;
  link: string;
}

@Component({
  selector: 'app-informasi',
  imports: [],
  templateUrl: './informasi.component.html',
  styleUrl: './informasi.component.scss',
  standalone: true,
})
export class InformasiComponent {
  readonly infoCards: InfoCard[] = Array(6).fill({
    title: 'Panduan Membaca Dengan Benar',
    description:
      'Mimin, akan memberikan tips dan solusi yg benar untuk menjadi seorang kutu buku dengan benar.',
    link: '#',
  });
}
