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


  //no vale refactorizar//
  onInputFocus(cadenaTe:string) {
    const index = this.tema.findIndex(t => t.toLowerCase() === cadenaTe.toLowerCase());
    if (index === -1) {
      this.auxiliar = cadenaTe;
    }
  }


  onkeyClikPublic(){
    this.firestoreService.updateTitle("estrés",this.title_1);
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
      console.log(this.tema); 
      console.log(data)
    });
  }

}
