export interface UserModel {
  uid: string;
  displayName: string | null;
  email: string | null;
  role?: string;
}



export interface Resultado {
  fecha: Date;
  puntaje: number;
}


export interface CompletedExercises {
  ejercicio1?: SimpleExercise;
  ejercicio2?: SimpleExercise;
  ejercicio3?: SimpleExercise;
  ejercicio4?: SimpleExercise;
  ejercicio5?: SimpleExercise;
  expressive_tecnica3?: ExpressiveExercise;
  gratitude_tecnica2?: GratitudeExercise;
}

export interface SimpleExercise {
  attempts: number;
  categoryId: string;
  completed_at: Date;
  duration: number;
  methodId: string;
  title: string;
}

export interface ExpressiveExercise {
  attempts: number;
  categoryId: string;
  created_at: Date;
  methodId: string;
  title: string;
  entries: { [entryId: string]: ExpressiveEntry };
}

export interface ExpressiveEntry {
  content: string;
  created_at: Date;
  duration: number;
}

export interface comments {
  comment: string;
  timestamp: Date;
  methodId: string;
}

export interface GratitudeExercise {
  attempts: number;
  categoryId: string;
  created_at: Date;
  methodId: string;
  title: string;
  entries: { [entryId: string]: GratitudeEntry };
}

export interface GratitudeEntry {
  created_at: Date;
  duration: number;
  gratitude_entries: string[];
}


export interface Usuario {
  id: string;
  displayName: string;
  email: string;
  estado: boolean;
  picture: string;
  resultados: {
    [categoria: string]: Resultado;
  };
  completed_exercises: CompletedExercises;
  comments?:{ [entryId: string]: comments };
}

export interface Nivel {
  id: string;
  nombre: string;
  descripcion: string;
  audioUrl: string;

}

