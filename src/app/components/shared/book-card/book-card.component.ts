import { Component, Input, Output, EventEmitter } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Book } from '../../../models/book.model';

@Component({
  selector: 'app-book-card',
  imports: [RouterLink],
  templateUrl: './book-card.component.html',
  styleUrl: './book-card.component.scss',
  standalone: true,
})
export class BookCardComponent {
  @Input() book!: Book;
  @Output() favoriteToggled = new EventEmitter<string>();

  onToggleFavorite(event: MouseEvent) {
    event.stopPropagation();
    if (this.book) {
      this.favoriteToggled.emit(this.book.id);
    }
  }
}
