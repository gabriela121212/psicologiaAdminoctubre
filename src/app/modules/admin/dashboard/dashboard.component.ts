import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirestoreService,Method } from '@core/services/firestore.service';
import { Usuario , CompletedExercises} from '@core/models/user.model';
import { Observable,BehaviorSubject } from 'rxjs';
import { NgChartsModule } from 'ng2-charts';
import { ChartType,ChartData,ChartOptions } from 'chart.js';
import { routes } from 'src/app/app.routes';



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
  selectedMethodId: string = ''; // ID del método seleccionado
  metodos: Method[] = []; // Lista de métodos cargados
  routes: { route: string; title: string }[] = [];
  rutasConTitulos = [
  { route: 'gratitude', title: 'Técnica 2: Ejercicio de gratitud' },
  { route: 'expressive', title: 'Técnica 3: Ejercicio Escritura Expresiva' }
];
  selectedTechniqueTitle: string = ''; // Título de la técnica seleccionada
filteredRoutes: { route: string; title: string }[] = [];

  
selectedRoute: string = ''; 
  ngOnInit(): void {
     this.onTechniqueChange(this.selectedTechnique);
  this.obtenerTitulosMetodos();
  this.firestoreService.getAllUsersRealtime().subscribe({
    next: (users) => {
      const ordenados = users.sort((a, b) => {
        // Primero por estado (activos antes que inactivos)
        if (a.estado && !b.estado) return -1;
        if (!a.estado && b.estado) return 1;
        // Si el estado es igual, ordenar por nombre
        const nombreA = (a.displayName || '').toLowerCase();
        const nombreB = (b.displayName || '').toLowerCase();
        return nombreA.localeCompare(nombreB);
      });

      this.usuariosSubject.next(ordenados);
      this.onTechniqueChange("gratitude");
    },
    error: (err) => console.error(err),
  });
}
  obtenerTitulosMetodos(): void {
    this.firestoreService.fetchCategoriesWithMethods().subscribe((categorias) => {
      // Extraer rutas y títulos de las técnicas (métodos)
      const rutasConTitulos = categorias.flatMap((categoria: any) =>
        (categoria.methods || []).map((metodo: Method) => ({
          route: metodo.route,
          title: metodo.title
        }))
      );

      this.routes = rutasConTitulos; // Guardar las rutas y títulos
      this.selectedRoute = rutasConTitulos[0]?.route || ''; // Establecer la primera ruta como seleccionada
      this.selectedTechniqueTitle = rutasConTitulos[0]?.title || ''; // Establecer el título de la primera técnica
      console.log('Métodos cargados:', this.routes);
    });
  }
  obtenerTitulosMetodos1(): void {
  this.firestoreService.fetchCategoriesWithMethods().subscribe((categorias) => {
    const rutasConTitulos = categorias.flatMap((categoria: any) =>
      (categoria.methods || []).map((metodo: Method) => ({
        route: metodo.route,
        title: metodo.title
      }))
    );

    this.routes = rutasConTitulos;
console.log('Métodos obtenidos:', rutasConTitulos);

    this.filteredRoutes = rutasConTitulos.filter(r =>
      r.route === 'tecnica2' || r.route === 'tecnica3'
    );

    // Establecer selección inicial
    this.selectedTechnique = this.filteredRoutes[0]?.route || '';
    this.selectedTechniqueTitle = this.filteredRoutes[0]?.title || '';

    // Ejecutar cambio inicial de datos
    this.onTechniqueChange(this.selectedTechnique);
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

  // Filtrar comentarios que tengan methodId igual a la ruta seleccionada
  return Object.values(usuario.comments)
    .filter(c => c.methodId === this.selectedRoute)
    .map(c => c.comment);
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

    public pieChartOptions: ChartOptions<'pie'> = {
  plugins: {
    tooltip: {
      bodyFont: {
        size: 10
      },
      padding: 20,
      backgroundColor: '#333',
      titleFont: {
        size: 14
      }
    },
    legend: {
      labels: {
        color: '#ffffff',
        font: {
          size: 12
        }
      }
    }
  }
};

    public pieChartData: ChartData<'pie', number[], string> = {labels: this.pieChartLabels,datasets: [{data: [...this.dataGeneric],label: 'Promedio (gratitude)',backgroundColor: ['#FF6384','#36A2EB','#FFCE56','#4BC0C0','#9966FF']}]};
    public pieChartType: 'pie' = 'pie';
    









onTechniqueChange(value: string) {
  const selectedRouteObj = this.rutasConTitulos.find(routeObj => routeObj.route === value);
  this.selectedTechniqueTitle = selectedRouteObj ? selectedRouteObj.title : '';

  const nuevosDatos = value === 'gratitude'
    ? this.calcularPromediosPorEjercicio('gratitude_tecnica2')
    : this.calcularPromediosPorEjercicio('expressive_tecnica3');

  const dataPorcentual = this.porcentuar(nuevosDatos);

  if (JSON.stringify(this.pieChartData.datasets[0]?.data) !== JSON.stringify(dataPorcentual)) {
    this.dataGeneric = nuevosDatos;

    this.pieChartData = {
      labels: this.pieChartLabels,
      datasets: [
        {
          data: [...dataPorcentual],
          label: `Promedio (${this.selectedTechniqueTitle})`
        }
      ]
    };

    console.log('✅ Datos cambiaron, gráfico actualizado:', dataPorcentual);
  } else {
    console.log('⏸️ Datos no cambiaron, gráfico NO redibujado.');
  }
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
