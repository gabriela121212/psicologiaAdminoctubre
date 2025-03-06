import { Component, OnInit,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '@core/services/firestore.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 

interface Question {
  options: string[];
  order: number;
  title: string;
  values: number[];
}

interface Category {
  id: string;
  title: string;
  colors: string[];
  order: number;
  questions?: Question[];
}

interface Pregunta {
  texto: string;
  respuestas: string[];
}



@Component({
  standalone: true,
  selector: 'app-cuestionarios',
  imports: [CommonModule,FormsModule],
  templateUrl: './cuestionarios.component.html',
  styleUrl: './cuestionarios.component.css'
})
export class CuestionariosComponent {
  base64Image:string | null = null;
  base64Image2:string | null = null;
  nameImg = '';
  headers = ['data:image/jpeg;base64,','data:image/png;base64,','data:image/jpg;base64,','data:application/octet-stream;base64,'];
  isDragging=false;
  isDragging2=false;
  opciones: string[] = [];
  seleccion: string = 'Estrés';
  categories: Category[] = [];
  preguntas:Pregunta[] = [];
  endQ:Question[] = [];




  actualizarSeleccion() {
    this.searchQuestion(this.seleccion);
  }
  
  onkeyClikPublic(){
    this.endQ = [];
    ///////////////////////////////////////
    var n = 1;
    this.preguntas.forEach(p => {
      p.texto = n+"."+p.texto.split(".")[1];
      n++;
    });
    ///////////////////////////////////////
    this.preguntas.forEach((p) => {
      this.endQ.push({
        options: p.respuestas,
        order: parseInt(p.texto.split(".")[0]),
        title: p.texto.split(".")[1],
        values: [0,1,2,3]
      });
    });
    console.log("ques",this.endQ);
    this.firestoreService.updateQuestions(this.seleccion.toLowerCase(), this.endQ);
  }

  addQuestions(){
    this.preguntas.push({texto: "0.¿Pregunta de ejemplo?", respuestas: ["Raramente", "Algunas veces", "Frecuentemente", " Muy frecuentemente"]});
  }

  deleteQuestion(i:number){
    console.log("borrando pregunta",i);
    var pe = this.preguntas[i];
    var n = 1;
    this.preguntas = this.preguntas.filter(p => p !== pe);
    this.preguntas.forEach(p => {
      p.texto = n+"."+p.texto.split(".")[1];
      n++;
    });
  }

  trackByIndex(index: number): number {
    return index;
  }


  constructor(private firestoreService: FirestoreService) {}

  ngOnInit() {
    this.firestoreService.fetchCategoriesWithQuestions().subscribe((data) => {
      // Limpiar las opciones antes de llenarlas
      this.opciones = []; 
      this.preguntas = [];
      this.endQ = [];
      // Llenar con los nuevos datos
      const tema = data.map((doc) => doc.title); 
      this.opciones.push(tema[1]);
      this.opciones.push(tema[0]);    
      this.opciones.push(tema[3]);
      this.opciones.push(tema[2]);
  
      console.log("Opciones:", this.opciones);

      // Limpiar las categorías antes de asignar las nuevas
      this.categories = []; 
      this.categories = data;
  
      console.log("Questions:", this.categories);
  
      this.searchQuestion(this.seleccion);
    });
    this.firestoreService.getImageBase64('cuadroTextoa.png').subscribe((base64) => { this.base64Image = base64; });
    this.firestoreService.getImageBase64('corazon.png').subscribe((base64) => { this.base64Image2 = base64; });
  }
  

  searchQuestion(element:string){
    this.preguntas = [];
    this.endQ = [];
    this.categories.forEach((category) => {
      if(category.title === element){
        if(category.questions?.length === 0){
          this.preguntas = [];
          return;
        }
        category.questions?.sort((a, b) => a.order - b.order);
        category.questions?.forEach(({title,options,order}) => {
          this.preguntas.push({texto: order+"."+title, respuestas: options});
        });
      }
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
