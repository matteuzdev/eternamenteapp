import { Component, ChangeDetectionStrategy, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { CoupleStoreService } from '../../services/couple-store.service';
import { DataService, Guest } from '../../services/data.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, switchMap, map } from 'rxjs';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-dashboard-overview',
  standalone: true,
  imports: [CommonModule, MatIconModule, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="h-full flex flex-col space-y-6">
      <div class="flex items-end flex-wrap gap-4 justify-between">
        <div>
          <h1 class="text-[32px] font-serif font-bold tracking-tight text-bento-text">Dashboard</h1>
          <div class="text-bento-text/60 mt-1 font-medium text-sm">Visualização em tempo real de <span class="text-bento-text">{{ coupleName() }}</span></div>
        </div>
      </div>

      <!-- Bento Grid Layout -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 auto-rows-min gap-5">
        
        <!-- Invite Hero -->
        <a [href]="'/i/' + coupleId() + '/c/preview'" target="_blank"
           class="group lg:col-span-2 lg:row-span-2 bg-bento-card rounded-bento border border-bento-border shadow-bento p-6 flex flex-col justify-between overflow-hidden relative min-h-[300px] cursor-pointer hover:shadow-lg transition-shadow">
          <div class="absolute inset-0 bg-cover bg-center before:absolute before:inset-0 before:bg-gradient-to-b before:from-black/20 before:to-black/60 pointer-events-none transition-transform duration-700 group-hover:scale-105"
               [style.backgroundImage]="'url(' + (coverImage() || 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&q=80&w=800') + ')'"></div>
          
          <div class="relative z-10 w-max px-3 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xs text-white uppercase tracking-wider font-semibold mb-auto flex items-center gap-2 group-hover:bg-white/30 transition-colors">
            <mat-icon class="text-white text-[16px] w-[16px] h-[16px]">visibility</mat-icon> Preview do Convite
          </div>
          
          <div class="relative z-10 text-white mt-auto truncate max-w-full">
            <div class="text-[42px] font-serif leading-tight mb-2 truncate" [style.fontFamily]="fontFamily() === 'sans' ? 'sans-serif' : 'serif'">
               {{ coupleName() }}
            </div>
            <div class="italic text-white/90 truncate">{{ dateOrPlaceholder() }} • {{ venueOrPlaceholder() }}</div>
          </div>
        </a>

        <!-- RSVP Stats (Confirmed) -->
        <div class="lg:col-span-1 lg:row-span-1 bg-bento-card rounded-bento border border-bento-border shadow-bento p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div class="text-[48px] font-light text-bento-accent leading-none">{{ confirmedCount$ | async }}</div>
          <div class="text-[12px] uppercase tracking-widest mt-2 text-bento-text/60 font-semibold">Confirmados</div>
          <div class="text-[11px] text-bento-text/40 mt-3 font-medium">de {{ (guests$ | async)?.length || 0 }} convidados total</div>
        </div>

        <!-- Countdown / Pendentes -->
        <div class="lg:col-span-1 lg:row-span-1 bg-bento-accent rounded-bento shadow-bento p-6 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div class="text-[48px] font-bold text-white font-serif leading-none">{{ pendingCount$ | async }}</div>
          <div class="text-[12px] uppercase tracking-widest mt-2 text-white/80 font-semibold">Pendentes</div>
        </div>

        <!-- Guest List (Recent) -->
        <div class="lg:col-span-1 lg:row-span-2 bg-bento-card rounded-bento border border-bento-border shadow-bento p-6 flex flex-col">
          <div class="text-[14px] font-semibold text-bento-text mb-4 flex justify-between items-center">
            <span>Últimas Respostas</span>
            <span class="text-[11px] text-bento-accent cursor-pointer hover:underline">Ver todos</span>
          </div>
          
          <div class="flex-1 overflow-y-auto space-y-0.5">
            @if ((recentGuests$ | async)?.length === 0) {
              <p class="text-bento-text/50 text-sm mt-4 text-center">Nenhum convidado ainda.</p>
            } @else {
              @for (g of recentGuests$ | async; track g.id) {
                <div class="flex items-center py-3 border-b border-bento-bg last:border-0">
                  <div class="w-2 h-2 rounded-full mr-3 shrink-0" 
                    [class.bg-bento-confirmed]="g.status === 'confirmed'"
                    [class.bg-bento-pending]="g.status === 'pending'"
                    [class.bg-rose-400]="g.status === 'declined'">
                  </div>
                  <div class="text-[13px] font-medium text-bento-text truncate">{{g.name}}</div>
                  <div class="text-[11px] text-bento-text/50 ml-auto shrink-0 pl-2">{{g.groupName || 'Sem grupo'}}</div>
                </div>
              }
            }
          </div>
        </div>

        <!-- Gifts/Progress -->
        <div class="lg:col-span-1 lg:row-span-1 bg-bento-card rounded-bento border border-bento-border shadow-bento p-6 flex flex-col justify-center">
          <div class="text-[12px] uppercase tracking-widest text-bento-text/50 mb-1 font-semibold">Lua de Mel</div>
          <div class="text-[24px] font-semibold text-bento-text mb-3">Recusados: {{ declinedCount$ | async }}</div>
          <div class="h-2 bg-bento-bg rounded-full overflow-hidden w-full">
            <div class="h-full bg-rose-300 rounded-full" [style.width]="'30%'"></div>
          </div>
          <div class="text-[11px] text-bento-text/50 mt-2 font-medium">Não poderão comparecer</div>
        </div>

        <!-- Actions -->
        <div class="lg:col-span-2 lg:row-span-1 grid grid-cols-1 sm:grid-cols-3 gap-4 auto-rows-max">
          <div (click)="copyInviteLink()" class="h-14 rounded-btn bg-bento-accent text-white flex items-center justify-center font-semibold text-sm cursor-pointer hover:opacity-90 transition-opacity whitespace-nowrap px-4 gap-2">
            <mat-icon class="text-[18px] w-[18px] h-[18px]">content_copy</mat-icon> Copiar Link Base
          </div>
          <div class="h-14 rounded-btn bg-white border border-bento-border text-bento-text flex items-center justify-center font-semibold text-sm cursor-pointer hover:bg-bento-bg transition-colors whitespace-nowrap px-4">
            Disparar Convites
          </div>
          <div class="h-14 rounded-btn bg-white border border-bento-border text-bento-text flex items-center justify-center font-semibold text-sm cursor-pointer hover:bg-bento-bg transition-colors whitespace-nowrap px-4">
            Gerar Relatório
          </div>
        </div>
      </div>
    </div>
  `
})
export class OverviewPage {
  private dataService = inject(DataService);
  private coupleStore = inject(CoupleStoreService);

  coupleName = computed(() => this.coupleStore.currentCouple()?.names || 'Nosso Grande Dia');
  coupleId = computed(() => this.coupleStore.currentCouple()?.id);
  coverImage = computed(() => this.coupleStore.currentCouple()?.themeConfig?.coverImage || '');
  fontFamily = computed(() => 'serif');
  dateOrPlaceholder = computed(() => this.coupleStore.currentCouple()?.weddingDate || 'Data a definir');
  venueOrPlaceholder = computed(() => this.coupleStore.currentCouple()?.venue || 'Local a definir');

  guests$ = toObservable(this.coupleStore.currentCouple).pipe(
    filter(c => c !== undefined && c !== null),
    switchMap(c => this.dataService.getGuests(c!.id!))
  );

  confirmedCount$ = this.guests$.pipe(map(g => g.filter(x => x.status === 'confirmed').length));
  declinedCount$ = this.guests$.pipe(map(g => g.filter(x => x.status === 'declined').length));
  pendingCount$ = this.guests$.pipe(map(g => g.filter(x => x.status === 'pending').length));

  recentGuests$ = this.guests$.pipe(
    map(g => [...g].sort((a,b) => b.updatedAt.toMillis() - a.updatedAt.toMillis()).slice(0, 5))
  );

  copyInviteLink() {
    const cid = this.coupleId();
    if (!cid) return;
    const url = `${window.location.origin}/i/${cid}/c/preview`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Link copiado!');
    });
  }
}
