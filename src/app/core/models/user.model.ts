export interface UserModel {
  uid: string;
  displayName: string | null;
  email: string | null;
  role?: string;
}
