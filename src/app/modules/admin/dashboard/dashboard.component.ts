import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService } from '@core/services/firestore.service';
import { Usuario , CompletedExercises} from '@core/models/user.model';
import { Observable,BehaviorSubject } from 'rxjs';
import { NgChartsModule } from 'ng2-charts';
import { ChartType,ChartData,ChartOptions } from 'chart.js';



@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule,NgChartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {


  panel:boolean = false;
  porcentaje:number = 0;
  complete:number = 0;
  task:number = 0;
  arrayComments: string[] = [];
  defaultPicture: string = 'https://firebasestorage.googleapis.com/v0/b/psicologia-app-liid.firebasestorage.app/o/images%2Fusuario.png?alt=media&token=7298268e-3439-492b-8215-fe8629e92fb6';



  usuariosSubject = new BehaviorSubject<Usuario[]>([]);
  constructor(private firestoreService: FirestoreService) {}


    ngOnInit(): void {
    this.firestoreService.getAllUsersRealtime().subscribe({
      next: (users) => {
        console.log(users);
        this.usuariosSubject.next(users);
        this.onTechniqueChange("gratitude")
      },
      error: (err) => console.error(err),
    });
  }

  visibilityPanel(indice: number) {
    this.panel = true;
    console.log('Panel abierto para el usuario en el índice:', indice);
    const arrayEjercicio = this.getCompletedExercisesPercentage(indice);
    this.porcentaje = arrayEjercicio.length * 20;
    this.complete = arrayEjercicio.length;
    this.task = 5 - arrayEjercicio.length;
  }

  visibilityPanelClose() {
    this.panel = false;
  }


    getCompletedExercisesPercentage(index: number): string[] {
      const user = this.usuariosSubject.value[index];
      if (!user || !user.completed_exercises) return [];
      const keys = ['ejercicio1', 'ejercicio2', 'ejercicio3', 'ejercicio4', 'ejercicio5'];
      const completados = keys.filter(key => user.completed_exercises[key as keyof CompletedExercises]);
      return completados
   }

    countGratitude_tecnica2(usuario: Usuario): number{
      const gratitude = usuario.completed_exercises?.gratitude_tecnica2;
      if (!gratitude || !gratitude.entries) return 0;
      return Object.keys(gratitude.entries).length;
    };

    countExpressive_tecnica3(usuario: Usuario): number{
      const gratitude = usuario.completed_exercises?.expressive_tecnica3;
      if (!gratitude || !gratitude.entries) return 0;
      return Object.keys(gratitude.entries).length;
    };

    commentUser(usuario: Usuario): string[] {
    if (!usuario.comments) return [];
    return Object.values(usuario.comments).map(c => c.comment);
  }




    selectedTechnique: string = 'gratitude';
    public pieChartLabels = ['0-5s', '6-10s', '11-20s', '21-30s', '31-60s'];
    public intervals = [
      { label: '0-5s', min: 0, max: 5 },
      { label: '6-10s', min: 6, max: 10 },
      { label: '11-20s', min: 11, max: 20 },
      { label: '21-30s', min: 21, max: 30 },
      { label: '31-60s', min: 31, max: 60 }
    ];

    dataGeneric:number[] = [];     

    public pieChartOptions: ChartOptions<'pie'> = {plugins: {legend: {labels: {color: '#ffffff', font: {size: 12}}}}};
    public pieChartData: ChartData<'pie', number[], string> = {labels: this.pieChartLabels,datasets: [{data: [...this.dataGeneric],label: 'Promedio (gratitude)',backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF']}]};
    public pieChartType: 'pie' = 'pie';




    onTechniqueChange(value: string) {
      this.dataGeneric = [];
      this.dataGeneric =  value === 'gratitude' ? this.calcularPromediosPorEjercicio('gratitude_tecnica2') : this.calcularPromediosPorEjercicio('expressive_tecnica3');      
      console.log(this.dataGeneric);            
      const data = this.porcentuar(this.dataGeneric);
      console.log(data);
      this.pieChartData = {
        labels: this.pieChartLabels,
        datasets: [
          {
            data: [...data],
            label: `Promedio (${value})`
          }
        ]
      };
    }



    calcularPromediosPorEjercicio(idEjercicio: keyof CompletedExercises):number[] {
      const promedios: number[] = [];
      this.usuariosSubject.value.forEach(usuario => {
        const ejercicios = usuario.completed_exercises;
        if (!ejercicios || !ejercicios[idEjercicio]) return;

        const ejercicio = ejercicios[idEjercicio];

        if ('entries' in ejercicio) {
              const entriesObj = ejercicio.entries;
              if (!entriesObj) return;
              const entryValues = Object.values(entriesObj);
              if (entryValues.length === 0) return;
              let suma = 0;
              let contador = 0;
              entryValues.forEach(entry => {
                  const duracion = Number(entry.duration);
                  if (!isNaN(duracion)) {
                    suma += duracion;
                    contador++;
                  }
                });
              if (contador > 0) {
                  const promedio = Math.trunc(suma / contador);
                  promedios.push(promedio);
              }
        }
      });
      return promedios;
    }


    porcentuar(userTimes: number[]): number[] {
      const counts = new Array(this.intervals.length).fill(0);
      userTimes.forEach(time => {
        for (let i = 0; i < this.intervals.length; i++) {
          if (time >= this.intervals[i].min && time <= this.intervals[i].max) {
            counts[i] += time;
            break;
          }
        }
      });
      return counts;
    }



}
