import { Injectable, signal } from '@angular/core';
import { auth } from '../firebase';
import { onAuthStateChanged, User, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import { Router } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AuthService {
  user = signal<User | null | undefined>(undefined);

  constructor(private router: Router) {
    onAuthStateChanged(auth, (user: User | null) => {
      this.user.set(user);
    });
  }

  async loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      this.router.navigate(['/dashboard']);
    } catch (error) {
      console.error('Login failed', error);
    }
  }

  async logout() {
    await signOut(auth);
    this.router.navigate(['/']);
  }
}
