import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../services/auth.service';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-bento-bg text-bento-text font-sans selection:bg-bento-border">
      <nav class="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between">
        <div class="text-2xl font-serif tracking-tight text-bento-accent font-bold">Eternamente</div>
        <button 
          (click)="login()"
          class="px-6 py-3 bg-bento-accent text-white rounded-btn font-semibold hover:opacity-90 transition-opacity">
          Entrar
        </button>
      </nav>

      <main class="max-w-7xl mx-auto px-6 pt-20 pb-32 grid lg:grid-cols-2 gap-16 items-center">
        <div class="space-y-8">
          <div class="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-white border border-bento-border shadow-sm text-sm font-semibold text-bento-text/70">
            <mat-icon class="text-bento-accent text-base h-4 w-4">favorite</mat-icon>
            <span>O convite digital definitivo</span>
          </div>
          
          <h1 class="text-5xl lg:text-[72px] font-serif tracking-tight text-bento-text leading-[1.1]">
            Cada amor merece uma entrada digna.
          </h1>
          
          <p class="text-[18px] text-bento-text/70 leading-relaxed max-w-lg">
            Crie sua página de casamento em minutos, acompanhe confirmações em tempo real e ofereça a melhor experiência para seus convidados.
          </p>

          <div class="flex flex-col sm:flex-row gap-4 pt-4">
            <button 
              (click)="login()"
              class="px-8 py-4 bg-bento-accent text-white rounded-btn font-semibold hover:opacity-90 transition-all shadow-bento flex items-center justify-center space-x-2">
              <span>Criar Meu Convite</span>
              <mat-icon>arrow_forward</mat-icon>
            </button>
          </div>
        </div>

        <div class="relative">
          <div class="absolute inset-0 bg-bento-border/50 rounded-bento transform rotate-3 scale-105 transition-transform duration-700 hover:rotate-6"></div>
          <img 
            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=2000" 
            alt="Casamento romântico" 
            referrerpolicy="no-referrer"
            class="relative z-10 w-full h-[600px] object-cover rounded-bento shadow-bento"
          />
        </div>
      </main>
    </div>
  `
})
export class LandingPage {
  constructor(private auth: AuthService) {}

  login() {
    this.auth.loginWithGoogle();
  }
}
