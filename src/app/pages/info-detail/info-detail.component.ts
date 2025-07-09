import { Component } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable, switchMap } from 'rxjs';
import { AsyncPipe, Location } from '@angular/common';
import { InfoService } from '../../services/info.service';
import { InfoContent } from '../../models/info-content.model';

@Component({
  selector: 'app-info-detail',
  imports: [AsyncPipe, RouterLink],
  templateUrl: './info-detail.component.html',
  styleUrl: './info-detail.component.scss',
  standalone: true,
})
export class InfoDetailComponent {
  readonly content$: Observable<InfoContent | undefined>;

  constructor(
    private route: ActivatedRoute,
    private infoService: InfoService,
    private location: Location
  ) {
    this.content$ = this.route.paramMap.pipe(
      switchMap((params) => {
        const slug = params.get('slug');
        return this.infoService.getContentBySlug(slug!);
      })
    );
  }

  goBack(): void {
    this.location.back();
  }
}
