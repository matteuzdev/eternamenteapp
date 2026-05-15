import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen bg-bento-bg text-bento-text flex flex-col md:flex-row font-sans">
      
      <!-- Sidebar -->
      <aside class="w-full md:w-64 bg-bento-bg border-r border-bento-border flex flex-col">
        <div class="px-10 py-10">
          <div class="text-2xl font-serif text-bento-accent font-bold tracking-tight">Eternamente</div>
        </div>
        
        <nav class="flex-1 px-6 space-y-2">
          <a routerLink="/dashboard" routerLinkActive="bg-bento-card border-bento-border shadow-sm text-bento-text font-semibold" [routerLinkActiveOptions]="{exact: true}" 
             class="flex items-center space-x-3 px-4 py-3 rounded-bento border border-transparent text-bento-text/70 hover:bg-bento-card hover:border-bento-border transition-all">
            <mat-icon>dashboard</mat-icon>
            <span class="text-sm">Visão Geral</span>
          </a>
          
          <a routerLink="/dashboard/guests" routerLinkActive="bg-bento-card border-bento-border shadow-sm text-bento-text font-semibold"
             class="flex items-center space-x-3 px-4 py-3 rounded-bento border border-transparent text-bento-text/70 hover:bg-bento-card hover:border-bento-border transition-all">
            <mat-icon>people</mat-icon>
            <span class="text-sm">Convidados</span>
          </a>

          <a routerLink="/dashboard/editor" routerLinkActive="bg-bento-card border-bento-border shadow-sm text-bento-text font-semibold"
             class="flex items-center space-x-3 px-4 py-3 rounded-bento border border-transparent text-bento-text/70 hover:bg-bento-card hover:border-bento-border transition-all">
            <mat-icon>edit</mat-icon>
            <span class="text-sm">Convite & Visual</span>
          </a>

          <a routerLink="/dashboard/gifts" routerLinkActive="bg-bento-card border-bento-border shadow-sm text-bento-text font-semibold"
             class="flex items-center space-x-3 px-4 py-3 rounded-bento border border-transparent text-bento-text/70 hover:bg-bento-card hover:border-bento-border transition-all">
            <mat-icon>card_giftcard</mat-icon>
            <span class="text-sm">Presentes</span>
          </a>
        </nav>
        
        <div class="p-6 border-t border-bento-border">
          <button (click)="logout()" class="w-full flex items-center space-x-3 px-4 py-3 rounded-bento text-bento-text/60 hover:bg-bento-card hover:text-bento-text hover:border hover:border-bento-border border border-transparent transition-all">
            <mat-icon>logout</mat-icon>
            <span class="text-sm font-medium">Sair</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <main class="flex-1 p-6 md:p-8 lg:p-10 overflow-y-auto w-full">
        <div class="max-w-[1024px] mx-auto w-full">
          <router-outlet></router-outlet>
        </div>
      </main>
    </div>
  `
})
export class DashboardLayout {
  constructor(private auth: AuthService) {}

  logout() {
    this.auth.logout();
  }
}
