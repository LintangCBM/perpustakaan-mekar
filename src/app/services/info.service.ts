import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { InfoContent } from '../models/info-content.model';

@Injectable({
  providedIn: 'root',
})
export class InfoService {
  private readonly allInfoContent: InfoContent[] = [
    {
      slug: 'pinjam-kembali',
      title: 'Cara Meminjam dan Mengembalikan Buku',
      body: [
        { type: 'h3', content: 'Cara Meminjam Buku' },
        {
          type: 'ol',
          content: [
            'Cari buku yang Anda inginkan melalui fitur pencarian atau daftar buku.',
            'Datang langsung ke perpustakaan dan tunjukkan buku yang ingin dipinjam kepada petugas.',
            'Petugas akan mencatat peminjaman menggunakan ID Buku dan data keanggotaan Anda.',
            'Batas waktu peminjaman adalah 14 hari (2 minggu).',
          ],
        },
        { type: 'h3', content: 'Cara Mengembalikan Buku' },
        {
          type: 'ol',
          content: [
            'Bawa buku yang telah selesai dibaca ke perpustakaan sebelum batas waktu berakhir.',
            'Serahkan buku kepada petugas untuk dicatat dalam sistem.',
            'Pastikan buku dalam kondisi baik dan tidak rusak.',
          ],
        },
      ],
    },
    {
      slug: 'aturan',
      title: 'Aturan & Tata Tertib Perpustakaan',
      body: [
        { type: 'h3', content: 'Kewajiban Pengunjung' },
        {
          type: 'ul',
          content: [
            'Menjaga ketenangan, kebersihan, dan ketertiban di dalam area perpustakaan.',
            'Meletakkan tas dan jaket di loker yang telah disediakan.',
            'Tidak membawa makanan dan minuman ke dalam ruang baca.',
            'Bertanggung jawab atas semua buku yang dipinjam.',
          ],
        },
      ],
    },
    {
      slug: 'donasi',
      title: 'Program Sumbangan Buku',
      body: [
        {
          type: 'p',
          content: 'Informasi mengenai donasi buku akan segera hadir.',
        },
      ],
    },
    {
      slug: 'jadwal',
      title: 'Jadwal Operasional',
      body: [
        { type: 'h3', content: 'Jadwal Operasional Perpustakan Mekar' },
        {
          type: 'ol',
          content: [
            'Peminjaman buku dapat dilakukan setiap hari kerja bisa melalui online jika berada di luar sekolah.',
            'Pengunjung dapat datang ke perpustakaan untuk meminjam atau mengembalikan buku.',
            'Buku yang dipinjam harus dikembalikan sebelum batas waktu yang ditentukan.',
            'Jika terlambat mengembalikan buku, akan dikenakan denda sesuai ketentuan.',
          ],
        },
        { type: 'h3', content: 'Jam Buka' },
        {
          type: 'ul',
          content: ['Senin - Jumat: 08.00 - 17.00', 'Sabtu - Minggu : Tutup'],
        },
      ],
    },
    {
      slug: 'fasilitas',
      title: 'Fasilitas Perpustakaan',
      body: [
        {
          type: 'p',
          content:
            'Perpustakaan Mekar menyediakan berbagai fasilitas untuk mendukung kegiatan literasi pengunjung.',
        },
        { type: 'h3', content: 'Fasilitas Utama' },
        {
          type: 'ul',
          content: [
            'Ruang baca yang nyaman.',
            'Koleksi buku yang beragam.',
            'Akses internet gratis.',
          ],
        },
      ],
    },
    {
      slug: 'keanggotaan',
      title: 'Menjadi Anggota',
      body: [
        {
          type: 'p',
          content: 'Informasi mengenai keanggotaan akan segera hadir.',
        },
      ],
    },
  ];

  constructor() {}

  getContentBySlug(slug: string): Observable<InfoContent | undefined> {
    const content = this.allInfoContent.find((c) => c.slug === slug);
    return of(content);
  }
}
