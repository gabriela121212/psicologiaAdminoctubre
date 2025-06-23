import { Component, OnInit,inject,ViewChild, ElementRef } from '@angular/core';
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
  nuevosVideos: [string, number,File][] = [];



  onkeyClikPublic(){
    console.log(this.methodsList)
    this.firestoreService.updateMethods(this.seleccion.toLowerCase(), this.methodsList);

    if(this.nuevosVideos.length ===0)return;
    this.firestoreService.updateVideos(this.nuevosVideos).subscribe({
      next: () => console.log("Videos subidos correctamente."),
      error: (err) => console.error("Error al subir videos:", err)
    });

  }

  atrasTecnicasG(){
    this.mostrarEstructura1 = true;
    this.mostrarEstructura1_1 = false;
  }




  mostrarEstructura1: boolean = true; 
  mostrarEstructura1_1: boolean = false; 
  arrayVideos: string[] = [];
  objtTecnica1: Exercise[] = [];
  numId = 0;

  ocultarEstructura1() {
    this.arrayVideos = [];
    this.mostrarEstructura1 = false; 
    this.mostrarEstructura1_1 = true;
    this.objtTecnica1 = this.methodsList[0]['exercises'];
    this.objtTecnica1.sort((a, b) => a.order - b.order);
    this.objtTecnica1.forEach((exercise) => {this.arrayVideos.push(exercise.videoUrl);});
  }


  addTecnicas(){
    this.objtTecnica1.push({
      id:"0",
      title:"titulo de ejemplo",
      description:"descripcion de ejemeplo",
      duration:10,
      videoUrl:this.arrayVideos[0],
      order:(this.objtTecnica1.length+1)});
      this.objtTecnica1.sort((a, b) => a.order - b.order);
      this.arrayVideos = [];
      this.objtTecnica1.forEach((exercise) => {this.arrayVideos.push(exercise.videoUrl);});

  }

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  

   // Abre el explorador de archivos
   openFileExplorer(idG:number) {
    this.fileInput.nativeElement.click();
    this.numId = idG;
  }

  // Maneja el archivo seleccionado
  onFileSelected(event: Event) {
    //aqui explusar archivo repetido seleccionado//
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      console.log("si llega o no llega")
      if(this.objtTecnica1[this.numId].id === "0"){
        ///debe ser id//
        console.log(this.numId)
        if(!this.nuevosVideos.map(([_, num]) => num).includes(this.numId) || this.nuevosVideos.length === 0){
          console.log("no fue la vida como la planemaos añadidirua")
          this.nuevosVideos.push(["nada",this.numId,file]);
          console.log(this.nuevosVideos);
        }else{
          this.nuevosVideos.forEach(([_, num],index) => {
            if (num === this.numId) {
              this.nuevosVideos[index][2] = file;
            }
          });
        }
      }else{
        ///debe ser id//
        if(!this.nuevosVideos.map(([_, num]) => num).includes(this.numId)  || this.nuevosVideos.length === 0){
          console.log("no fue la vida como la planemaos")
          this.nuevosVideos.push([this.objtTecnica1[this.numId].videoUrl,this.numId,file]);
          console.log(this.nuevosVideos);
        }else{
          this.nuevosVideos.forEach(([_, num],index) => {
            if (num === this.numId) {
              this.nuevosVideos[index][2] = file;
            }
          });
          
        }
      }
      this.objtTecnica1[this.numId].videoUrl = URL.createObjectURL(file);
      this.arrayVideos = [];
      this.objtTecnica1.sort((a, b) => a.order - b.order);
      this.objtTecnica1.forEach((exercise) => {this.arrayVideos.push(exercise.videoUrl);});
      console.log(this.objtTecnica1)
    }
  }
  

  
  actualizarSeleccion() {
    this.mostrarEstructura1_1 = false;
    this.mostrarEstructura1 = true; 
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
