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
  isDragging=false;
  base64Image:string | null = null;
  nameImg = '';
  headers = ['data:image/jpeg;base64,','data:image/png;base64,','data:image/jpg;base64,','data:application/octet-stream;base64,'];




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
    if(this.base64Image === null)return;


    this.firestoreService.updateColor(
      this.colors[0].id,
      this.hexToFlutterColor(this.colorValue2)
    );

    this.firestoreService.updateImage('marciano3.png', this.base64Image).subscribe((res) => {
      console.log('Imagen actualizada con éxito:', res);
    }, (error) => {
      console.error('Error al actualizar la imagen:', error);
    });
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

    // Obtener la imagen en base64
    this.firestoreService.getImageBase64('marciano3.png').subscribe((base64) => {
      this.base64Image = base64;
      console.log('Imagen en Base64:', this.base64Image);
    });
  }

  onDragEnter(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      const file = event.dataTransfer.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.base64Image = reader.result as string;
        this.nameImg = file.name;
      };
      reader.readAsDataURL(file);
    }
  }

  hasValidHeader(image: string | null): boolean {
    if(!image)return false;
    return this.headers.some(header => image.startsWith(header));
}

}
