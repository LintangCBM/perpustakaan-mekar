import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface InfoCard {
  title: string;
  description: string;
  routerLink: string;
}

@Component({
  selector: 'app-informasi',
  imports: [RouterLink],
  templateUrl: './informasi.component.html',
  styleUrl: './informasi.component.scss',
  standalone: true,
})
export class InformasiComponent {
  readonly infoCards: InfoCard[] = [
    {
      title: 'Cara Meminjam & Mengembalikan Buku',
      description:
        'Langkah-langkah mudah untuk meminjam dan mengembalikan buku favorit Anda dari perpustakaan kami.',
      routerLink: '/informasi/pinjam-kembali',
    },
    {
      title: 'Aturan & Tata Tertib',
      description:
        'Pahami peraturan perpustakaan untuk menjaga kenyamanan dan kelestarian koleksi buku kita.',
      routerLink: '/informasi/aturan',
    },
    {
      title: 'Program Sumbangan Buku',
      description:
        'Ikut serta dalam memperkaya koleksi kami dengan menyumbangkan buku yang bermanfaat.',
      routerLink: '/informasi/donasi',
    },
    {
      title: 'Jadwal Operasional',
      description:
        'Ketahui jam buka dan tutup perpustakaan agar kunjungan Anda lebih terencana.',
      routerLink: '/informasi/jadwal',
    },
    {
      title: 'Fasilitas Perpustakaan',
      description:
        'Lihat fasilitas apa saja yang tersedia untuk mendukung kegiatan literasi Anda di sini.',
      routerLink: '/informasi/fasilitas',
    },
    {
      title: 'Menjadi Anggota',
      description:
        'Informasi lengkap tentang cara mendaftar dan keuntungan menjadi anggota perpustakaan.',
      routerLink: '/informasi/keanggotaan',
    },
  ];
}
