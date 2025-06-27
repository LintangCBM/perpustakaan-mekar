import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

export interface Book {
  id: string | number;
  title: string;
  author: string;
  coverImageUrl: string;
  isFavorite?: boolean;
  categories: string[];
}

@Component({
  selector: 'app-book-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.scss',
  standalone: true,
})
export class BookCardComponent {
  @Input() book!: Book;
  @Output() favoriteToggled = new EventEmitter<string | number>();

  onToggleFavorite(event: MouseEvent) {
    event.stopPropagation();
    if (this.book) {
      this.favoriteToggled.emit(this.book.id);
    }
  }

  viewDetails(event: MouseEvent) {
    event.stopPropagation();
    console.log('View details for:', this.book.title);
  }
}
