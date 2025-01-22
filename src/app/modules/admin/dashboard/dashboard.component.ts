import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '@core/services/firestore.service';
import { FormsModule } from '@angular/forms';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})

export class DashboardComponent implements OnInit {
  users: any[] = [];
  colors: any = [];
  colorValue: string = '#3284FF';
  colorValue2: string = '#FFAB00';


  decimalToHexColor(decimal: number): string {
    let r = (decimal >> 16) & 0xFF;  
    let g = (decimal >> 8) & 0xFF;   
    let b = decimal & 0xFF;          

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
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

  onkeyClikPublic(){
    this.firestoreService.updateColor(this.colors[0].id,this.hexToFlutterColor(this.colorValue2));
  }


  constructor(private firestoreService: FirestoreService) {}

  ngOnInit() {
    this.firestoreService.getPublic().subscribe((data) => {
      this.colors = data;
      this.colorValue2 = this.decimalToHexColor(data[0].color);
      console.log(this.colors);
      console.log("colorrrrr "+this.colorValue2)
    });
  }
}
