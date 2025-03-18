import { Component, OnInit,inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '@core/services/firestore.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable,BehaviorSubject } from 'rxjs';


export interface Exercise {
  id: string;
  title: string;
  description: string;
  duration: number;
  videoUrl: string;
  order: number;
}

export interface Method {
  id: string;
  title: string;
  description: string;
  route: string;
  order: number;
  exercises: Exercise[];
}

interface Category {
  id: string;
  title: string;
  colors: string[];
  order: number;
  methods?: Method[];
}


@Component({
  standalone: true,
  selector: 'app-menu',
  imports: [CommonModule,FormsModule],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})

export class MenuComponent {
  private router = inject(Router);
  obj: BehaviorSubject<Category[]> = new BehaviorSubject<Category[]>([]);
  auxiliar = '';
  opciones:string[] = [];
  seleccion: string = 'Estrés';
  methodsList:Method[] = [];


  onkeyClikPublic(){
        
  }

  actualizarSeleccion() {
    this.searchMt(this.seleccion);
  }

  searchMt(select:string){
    this.methodsList = [];
    this.obj.value.forEach((category) => {
      if(category.title === select){
        if(category.methods ?.length === 0){
          this.methodsList = [];
          return;
        }
        category.methods?.sort((a, b) => a.order - b.order);
        category.methods?.forEach((metod) => {this.methodsList.push(metod)});
        console.log(this.methodsList);
      }
    });
  }

  Cuestionario(){

  }

  back(){
    this.router.navigate(['']);
  }

  constructor(private firestoreService: FirestoreService) {}

  ngOnInit() {
    this.firestoreService.fetchCategoriesWithMethods().subscribe(
      (categories) => {
        this.opciones = []; 
        this.methodsList = [];
        this.obj.next([])
        this.obj.next(categories);
        // Llenar con los nuevos datos
        const tema = categories.map((doc) => doc.title); 
        this.opciones.push(tema[1]);
        this.opciones.push(tema[0]);    
        this.opciones.push(tema[3]);
        this.opciones.push(tema[2]);
        this.searchMt(this.seleccion);
        console.log('Categorías con métodos y ejercicios:', this.obj);
      },
      (error) => {
        console.error('Error al cargar categorías:', error);
      }
    );
  }
}
