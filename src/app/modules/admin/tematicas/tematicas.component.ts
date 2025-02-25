import { Component, OnInit,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '@core/services/firestore.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 


@Component({
  selector: 'app-tematicas',
  standalone: true,
  imports: [CommonModule,FormsModule],
  templateUrl: './tematicas.component.html',
  styleUrl: './tematicas.component.css'
})
export class TematicasComponent  implements OnInit {
  private router = inject(Router);
  tema: any[] = [];
  obj:any = [];
  title_1 = '';
  title_2 = '';
  title_3 = '';
  title_4 = '';
  auxiliar = '';
  colorValue = '#3284FF';
  colorValue_2 = '#3284FF';
  colorValue_3 = '#3284FF';
  colorValue_4 = '#3284FF';
  colorValue_5 = '#3284FF';
  colorValue_6 = '#3284FF';
  colorValue_7 = '#3284FF';
  colorValue_8 = '#3284FF';

  mapa = new Map<string, string>();
  mapa_2 = new Map<string, string[]>();
  
  onColorChange(event: any,color:string) {
    color = event.target.value;
  }

  onFocus(title:string){ 
    this.auxiliar = title;
  }

  onBlur(valor:string){ 
    const clave = this.auxiliar.toLowerCase();
    this.mapa.set(clave, valor);
    console.log('Mapa actualizado:', this.mapa); 
  }

  onkeyClikPublic(){
    var i:number = 0;
    this.firestoreService.updateTitles(this.mapa);
    var colorGroups:string[][] = [
      [this.colorValue_3, this.colorValue_4],
      [this.colorValue, this.colorValue_2],
      [this.colorValue_7, this.colorValue_8],
      [this.colorValue_5, this.colorValue_6]
    ];
    this.obj.forEach((element:any) => {
      if(colorGroups[i].some((value,index) => value !== element.colors[index])){
        console.log("element ",element);
        this.mapa_2.set(element.id, colorGroups[i]);
        i++;
        console.log("mapa 2 ",this.mapa_2);
      }else{
        i++;
      }
    });
    i = 0;
    this.firestoreService.updateColors(this.mapa_2);
  }

  Cuestionario(){

  }

  back(){
    this.router.navigate(['']);
  }

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit() {
    this.firestoreService.getTematicas().subscribe((data) => {
      this.tema = data.map((doc) => doc.title); 
      this.title_1 = this.tema[1];
      this.title_2 = this.tema[0];
      this.title_3 = this.tema[3];
      this.title_4 = this.tema[2];
      this.obj = data;
      this.colorValue = this.obj[1].colors[0];
      this.colorValue_2 = this.obj[1].colors[1];
      this.colorValue_3 = this.obj[0].colors[0];
      this.colorValue_4 = this.obj[0].colors[1];
      this.colorValue_5 = this.obj[3].colors[0];
      this.colorValue_6 = this.obj[3].colors[1];
      this.colorValue_7 = this.obj[2].colors[0];
      this.colorValue_8 = this.obj[2].colors[1];
      console.log(this.tema); 
      console.log(data)
    });
  }

}


