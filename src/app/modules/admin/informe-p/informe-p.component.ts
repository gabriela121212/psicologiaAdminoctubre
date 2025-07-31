import { Component, OnInit,inject,ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FirestoreService } from '@core/services/firestore.service';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router'; 
import {Nivel} from '@core/models/user.model';

@Component({
  standalone: true,
  selector: 'app-informe-p',
  imports: [CommonModule,FormsModule],
  templateUrl: './informe-p.component.html',
  styleUrl: './informe-p.component.css'
})
export class InformePComponent {
  private router = inject(Router);
    tema: any[] = [];
    obj:any = [];
    base64Image:string | null = null;
    isDragging2=false;
    base64Image2:string | null = null;
    audio!: HTMLAudioElement;
    isPlaying: boolean = false;
    headers = ['data:image/jpeg;base64,','data:image/png;base64,','data:image/jpg;base64,','data:application/octet-stream;base64,'];
    
    
    niveles: Nivel[] = [];
    selectedNivelId: string | null = null; // guardará el id seleccionado
    descripcionSeleccionada: string = '';
    descripcionEditada: string = '';

    onkeyClikPublic(){

        if (this.selectedNivelId && this.descripcionEditada) {
    this.firestoreService
      .updateDescripcionNivel('estrés', this.selectedNivelId, this.descripcionEditada)
      .then(() => {
        console.log('Descripción actualizada correctamente.');
      })
      .catch((error) => {
        console.error('Error al actualizar la descripción:', error);
      });
  } else {
    console.warn('Debe seleccionar un nivel y editar una descripción.');
  }

  // Aquí mantienes tu lógica para subir imágenes si es necesario
  if (this.base64Image === null || this.base64Image2 === null) return;

  this.firestoreService.updateImage('textoAudio.png', this.base64Image).subscribe(
    (res) => {
      console.log('Imagen actualizada con éxito:', res);
    },
    (error) => {
      console.error('Error al actualizar la imagen:', error);
    }
  );
      
      if(this.base64Image === null || this.base64Image2 === null)return;

      this.firestoreService.updateImage('textoAudio.png', this.base64Image).subscribe((res) => {
        console.log('Imagen actualizada con éxito:', res);
      }, (error) => {
        console.error('Error al actualizar la imagen:', error);
      });

      this.firestoreService.updateImage('loginAdmin.png', this.base64Image2).subscribe((res) => {
        console.log('Imagen actualizada con éxito:', res);
      }, (error) => {
        console.error('Error al actualizar la imagen:', error);
      });

      this.firestoreService.updateAudio('AudioInformePersonalizado.m4a', this.audio).subscribe(() => {
        console.log('¡Audio actualizado correctamente en Firebase!');
      }, error => {
        console.error('Error al actualizar el audio:', error);
      });

      


    }
  
    Cuestionario(){
  
    }
  
    constructor(private firestoreService: FirestoreService) {}
  
    ngOnInit() {

      //Obtener el Nivel
  
  this.firestoreService.getNivelesFromEstres().subscribe(niveles => {
      this.niveles = niveles;
      if (niveles.length > 0) {
        this.selectedNivelId = niveles[0].id || null;
        this.updateDescripcion(this.selectedNivelId);
      }
    });
    


      // Obtener la imagen en base64
      this.firestoreService.getImageBase64('textoAudio.png').subscribe((base64) => {
        this.base64Image = base64;
        console.log('Imagen en Base64:', this.base64Image);
      });
       // Obtener la imagen en base64
       this.firestoreService.getImageBase64('loginAdmin.png').subscribe((base64) => {
        this.base64Image2 = base64;
        console.log('Imagen en Base64:', this.base64Image2);
      });

      this.firestoreService.getAudioUrl('AudioInformePersonalizado.m4a').subscribe(url => {
        this.audio = new Audio(url); // Crear el audio
      });

    }
  
updateDescripcion(id: string | null, autoPlay: boolean = false) {
  if (!id) {
    this.descripcionSeleccionada = '';
    this.descripcionEditada = '';
    if (this.audio) {
      this.audio.pause();
      this.audio = null!;
      this.isPlaying = false;
    }
    return;
  }
  const nivel = this.niveles.find(n => n.id === id);
  this.descripcionSeleccionada = nivel ? nivel.descripcion : '';
  this.descripcionEditada = this.descripcionSeleccionada;

  if (this.audio) {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying = false;
  }

  if (nivel?.audioUrl) {
    this.audio = new Audio(nivel.audioUrl);
    this.audio.onended = () => {
      this.isPlaying = false;
    };

    if (autoPlay) {
      this.audio.play().then(() => {
        this.isPlaying = true;
      }).catch(err => {
        console.warn('Error al reproducir audio:', err);
      });
    }
  } else {
    this.audio = null!;
  }
}


onChangeNivel(event: any) {
  const id = event.target.value;
  this.selectedNivelId = id;
  this.updateDescripcion(id, false); // NO autoplay al cambiar con selector
}


  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput2') fileInput2!: ElementRef<HTMLInputElement>;
  @ViewChild('fileInput3') fileInput3!: ElementRef<HTMLInputElement>;
  audioUrl: string | null = null;


    // Abre el explorador de archivos
  openFileExplorer() {
    this.fileInput.nativeElement.click();
  }
  openFileExplorer2() {
    this.fileInput2.nativeElement.click();
  }
  
  // Abre el explorador de archivos
  openFileExplorer3() {
    this.fileInput3.nativeElement.click();
  }

  // Maneja la selección de archivos
  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.base64Image2 = reader.result as string;
      };

      reader.readAsDataURL(file);
    }
  }

  onFileSelected2(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        this.base64Image = reader.result as string;
      };

      reader.readAsDataURL(file);
    }
  }

  // Maneja el archivo seleccionado
  onFileSelected3(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0 && this.selectedNivelId) {
    const file = input.files[0];

    // Subir y actualizar el audio para el nivel seleccionado
    this.firestoreService.updateNivelAudio('estrés', this.selectedNivelId, file).subscribe({
      next: () => {
        console.log('Audio actualizado correctamente.');
        // Recargar el audio en el componente
        this.audioUrl = URL.createObjectURL(file);
        this.audio = new Audio(this.audioUrl);
        this.isPlaying = false;
      },
      error: (err) => {
        console.error('Error al subir el audio:', err);
      }
    });
  }
}

  





  hasValidHeader(image: string | null): boolean {
    if(!image)return false;
    return this.headers.some(header => image.startsWith(header));
}

toggleAudio() {
  if (this.audio) {
    if (this.isPlaying) {
      this.audio.pause();
      this.isPlaying = false;
    } else {
      this.audio.play().then(() => {
        this.isPlaying = true;
      }).catch(err => {
        console.warn('Error al reproducir audio:', err);
        this.isPlaying = false;
      });
    }
    this.audio.onended = () => {
      this.isPlaying = false;
    };
  }
}

ngOnDestroy() {
  if (this.audio) {
    this.audio.pause();
    this.isPlaying = false;
  }
}
}

