import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../../shared/icon/icon';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, Icon],
  templateUrl: './footer.html',
  styleUrls: ['./footer.css'],
})
export class Footer {
  protected readonly year = new Date().getFullYear();
}
