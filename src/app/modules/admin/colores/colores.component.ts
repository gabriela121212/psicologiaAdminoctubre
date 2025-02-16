import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '@core/services/firestore.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-colores',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './colores.component.html',
  styleUrl: './colores.component.css',
})
export class ColoresComponent implements OnInit {
  private router = inject(Router);
  users: any[] = [];
  colors: any = [];
  colorValue: string = '#3284FF';
  colorValue2: string = '#FFAB00';

  decimalToHexColor(decimal: number): string {
    let r = (decimal >> 16) & 0xff;
    let g = (decimal >> 8) & 0xff;
    let b = decimal & 0xff;

    return `#${r.toString(16).padStart(2, '0')}${g
      .toString(16)
      .padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  hexToFlutterColor(hex: string): number {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const a = 255;
    return (a << 24) | (r << 16) | (g << 8) | b;
  }

  onColorChange(event: any) {
    this.colorValue = event.target.value;
  }

  onColorChange2(event: any) {
    this.colorValue2 = event.target.value;
  }

  onkeyClikPublic() {
    this.firestoreService.updateColor(
      this.colors[0].id,
      this.hexToFlutterColor(this.colorValue2)
    );
  }

  tematicas() {
    this.router.navigate(['/tematicas']);
  }

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit() {
    this.firestoreService.getPublic().subscribe((data) => {
      this.colors = data;
      this.colorValue2 = this.decimalToHexColor(data[0].color);
      console.log(this.colors);
      console.log('colorrrrr ' + this.colorValue2);
    });
  }
}
