import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CoupleStoreService } from '../../services/couple-store.service';
import { DataService, Gift } from '../../services/data.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, switchMap, map } from 'rxjs';

@Component({
  selector: 'app-dashboard-gifts',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-5xl space-y-8 pb-12">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 class="text-[32px] font-display font-bold tracking-tight text-bento-accent">Lista de Presentes</h1>
          <p class="text-bento-text/60 mt-1 font-medium text-sm">Gerencie os itens da sua lista e veja as reservas.</p>
        </div>
        <button type="button" (click)="toggleForm()" class="px-5 py-2.5 bg-bento-accent text-white rounded-btn font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm whitespace-nowrap">
          <mat-icon>{{ showForm() ? 'close' : 'add' }}</mat-icon> {{ showForm() ? 'Cancelar' : 'Adicionar Presente' }}
        </button>
      </div>

      <!-- Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div class="bg-bento-card border-t-4 border-t-bento-accent rounded-bento border-x border-b border-bento-border shadow-sm p-5 text-center">
          <div class="text-[28px] font-serif font-bold text-bento-accent">{{ (gifts$ | async)?.length || 0 }}</div>
          <div class="text-[10px] tracking-widest text-bento-text/50 uppercase mt-2 font-semibold">Total de Itens</div>
        </div>
        <div class="bg-bento-card border-t-4 border-t-bento-confirmed rounded-bento border-x border-b border-bento-border shadow-sm p-5 text-center">
          <div class="text-[28px] font-serif font-bold text-bento-confirmed">{{ (reservedCount$ | async) || 0 }}</div>
          <div class="text-[10px] tracking-widest text-bento-text/50 uppercase mt-2 font-semibold">Reservados</div>
        </div>
        <div class="bg-bento-card border-t-4 border-t-bento-pending rounded-bento border-x border-b border-bento-border shadow-sm p-5 text-center">
          <div class="text-[28px] font-serif font-bold text-bento-pending">{{ (availableCount$ | async) || 0 }}</div>
          <div class="text-[10px] tracking-widest text-bento-text/50 uppercase mt-2 font-semibold">Disponíveis</div>
        </div>
        <div class="bg-bento-card border-t-4 border-t-[#6B1A2A] rounded-bento border-x border-b border-bento-border shadow-sm p-5 text-center">
          <div class="text-xl font-serif font-bold text-[#6B1A2A] mt-2 mb-1">R$ {{ (totalValue$ | async)?.toLocaleString('pt-BR', {minimumFractionDigits:0}) || 0 }}</div>
          <div class="text-[10px] tracking-widest text-bento-text/50 uppercase font-semibold">Valor Total</div>
        </div>
      </div>

      <!-- Add Gift Form -->
      @if (showForm()) {
        <div class="bg-bento-card p-6 border-t-4 border-t-bento-accent rounded-bento border-x border-b border-bento-border shadow-sm animate-in fade-in slide-in-from-top-4">
          <form [formGroup]="giftForm" (ngSubmit)="addGift()" class="space-y-4">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-1.5 md:col-span-2">
                 <label for="giftName" class="text-[10px] uppercase tracking-widest font-semibold text-bento-text/50">Nome do presente *</label>
                 <input id="giftName" formControlName="name" type="text" class="w-full px-3 py-2.5 border border-bento-border rounded-xl focus:ring-2 focus:ring-bento-accent focus:outline-none bg-bento-bg text-sm">
              </div>
              <div class="space-y-1.5">
                 <label for="giftCategory" class="text-[10px] uppercase tracking-widest font-semibold text-bento-text/50">Categoria</label>
                 <input id="giftCategory" formControlName="category" type="text" class="w-full px-3 py-2.5 border border-bento-border rounded-xl focus:ring-2 focus:ring-bento-accent focus:outline-none bg-bento-bg text-sm" placeholder="Ex: Cozinha">
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div class="space-y-1.5">
                 <label for="giftPrice" class="text-[10px] uppercase tracking-widest font-semibold text-bento-text/50">Preço Estimado (R$)</label>
                 <input id="giftPrice" formControlName="price" type="number" class="w-full px-3 py-2.5 border border-bento-border rounded-xl focus:ring-2 focus:ring-bento-accent focus:outline-none bg-bento-bg text-sm">
              </div>
              <div class="space-y-1.5">
                 <label for="giftStore" class="text-[10px] uppercase tracking-widest font-semibold text-bento-text/50">Loja / Marca</label>
                 <input id="giftStore" formControlName="store" type="text" class="w-full px-3 py-2.5 border border-bento-border rounded-xl focus:ring-2 focus:ring-bento-accent focus:outline-none bg-bento-bg text-sm">
              </div>
              <div class="space-y-1.5">
                 <label for="giftLink" class="text-[10px] uppercase tracking-widest font-semibold text-bento-text/50">Link (opcional)</label>
                 <input id="giftLink" formControlName="link" type="text" class="w-full px-3 py-2.5 border border-bento-border rounded-xl focus:ring-2 focus:ring-bento-accent focus:outline-none bg-bento-bg text-sm" placeholder="https://...">
              </div>
            </div>

            <div class="pt-2 flex justify-end gap-3">
              <button type="button" (click)="toggleForm()" class="px-5 py-2.5 font-medium text-sm text-bento-text/60 hover:text-bento-text transition-colors">Cancelar</button>
              <button type="submit" [disabled]="giftForm.invalid" class="px-6 py-2.5 bg-bento-accent text-white rounded-btn font-semibold hover:opacity-90 transition-opacity disabled:opacity-50">Salvar Presente</button>
            </div>
          </form>
        </div>
      }

      <!-- Filter -->
      <div class="flex gap-2 flex-wrap">
         @for (f of filters; track f.id) {
           <button type="button" (click)="filterStatus.set(f.id)"
             class="px-4 py-2 rounded-full border text-xs font-semibold transition-colors"
             [class.border-bento-accent]="filterStatus() === f.id" [class.bg-bento-accent]="filterStatus() === f.id" [class.text-white]="filterStatus() === f.id"
             [class.border-bento-border]="filterStatus() !== f.id" [class.bg-white]="filterStatus() !== f.id" [class.text-bento-text/70]="filterStatus() !== f.id">
             {{ f.label }}
           </button>
         }
      </div>

      <!-- Gifts Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        @if ((filteredGifts$ | async)?.length === 0) {
          <div class="col-span-full py-12 text-center text-bento-text/40 font-serif italic text-lg">
            Nenhum presente encontrado.
          </div>
        }
        @for (gift of filteredGifts$ | async; track gift.id) {
          <div class="bg-bento-card rounded-bento border border-bento-border shadow-sm p-5 flex flex-col relative transition-all"
               [class.opacity-80]="gift.reserved"
               [style.borderTopWidth]="gift.reserved ? '3px' : '3px'"
               [style.borderTopColor]="gift.reserved ? 'var(--color-bento-confirmed)' : 'var(--color-bento-accent)'">
            
            @if (gift.reserved) {
              <div class="absolute top-3 right-3 bg-bento-confirmed text-white text-[9px] uppercase tracking-widest font-bold px-2 py-1 rounded-full">Reservado</div>
            }

            <div class="text-[10px] uppercase tracking-widest font-semibold text-bento-accent mb-1">{{ gift.category || 'Geral' }}</div>
            <div class="text-lg font-serif font-bold text-bento-text mb-1 leading-tight pr-14">{{ gift.name }}</div>
            
            @if (gift.price) {
              <div class="text-sm font-semibold text-bento-accent mb-2">R$ {{ gift.price | number:'1.2-2':'pt-BR' }}</div>
            }

            @if (gift.store || gift.link) {
              <div class="text-xs text-bento-text/60 mb-3 flex items-center gap-1">
                <mat-icon class="text-[14px] w-[14px] h-[14px]">store</mat-icon> 
                {{ gift.store || 'Ver online' }}
                @if (gift.link) {
                  <a [href]="gift.link" target="_blank" class="ml-1 text-bento-accent hover:underline flex items-center"><mat-icon class="text-[12px] w-[12px] h-[12px]">open_in_new</mat-icon></a>
                }
              </div>
            }

            <div class="mt-auto pt-4 border-t border-bento-border/50">
              @if (gift.reserved) {
                <div class="text-sm font-serif italic text-bento-text/70">
                  Reservado por <span class="font-semibold">{{ gift.reservedBy || 'Anônimo' }}</span>
                </div>
                <div class="flex gap-2 mt-3">
                  <button (click)="toggleReserve(gift)" class="px-3 py-1.5 text-xs font-semibold text-bento-accent hover:bg-bento-accent/10 rounded-md transition-colors border border-bento-accent/20">Cancelar</button>
                  <button (click)="deleteGift(gift.id!)" class="px-3 py-1.5 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-md transition-colors border border-red-200">Excluir</button>
                </div>
              } @else {
                <div class="flex gap-2">
                  <button (click)="toggleReserve(gift)" class="flex-1 px-3 py-2 bg-bento-accent/10 text-bento-accent hover:bg-bento-accent/20 text-xs font-bold uppercase tracking-widest rounded-md transition-colors">Testar Reserva</button>
                  <button (click)="deleteGift(gift.id!)" class="px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-md transition-colors border border-red-200"><mat-icon class="text-[16px] w-[16px] h-[16px]">delete</mat-icon></button>
                </div>
              }
            </div>
          </div>
        }
      </div>
    </div>
  `
})
export class GiftsPage {
  private dataService = inject(DataService);
  private coupleStore = inject(CoupleStoreService);
  private fb = inject(FormBuilder);

  showForm = signal(false);
  filterStatus = signal<'all' | 'available' | 'reserved'>('all');

  filters = [
    { id: 'all', label: 'Todos os Itens' },
    { id: 'available', label: 'Disponíveis' },
    { id: 'reserved', label: 'Reservados' }
  ] as const;

  giftForm = this.fb.group({
    name: ['', Validators.required],
    category: [''],
    price: [null as number | null],
    store: [''],
    link: ['']
  });

  gifts$ = toObservable(this.coupleStore.currentCouple).pipe(
    filter(c => !!c),
    switchMap(c => this.dataService.getGifts(c!.id!))
  );

  filteredGifts$ = this.gifts$.pipe(
    map(gifts => {
      const f = this.filterStatus();
      if (f === 'reserved') return gifts.filter(g => g.reserved);
      if (f === 'available') return gifts.filter(g => !g.reserved);
      return gifts;
    })
  );

  reservedCount$ = this.gifts$.pipe(map(g => g.filter(x => x.reserved).length));
  availableCount$ = this.gifts$.pipe(map(g => g.filter(x => !x.reserved).length));
  totalValue$ = this.gifts$.pipe(map(g => g.reduce((sum, item) => sum + (item.price || 0), 0)));

  toggleForm() {
    this.showForm.update(v => !v);
    if (!this.showForm()) {
      this.giftForm.reset();
    }
  }

  async addGift() {
    if (this.giftForm.invalid) return;
    const couple = this.coupleStore.currentCouple();
    if (!couple?.id) return;

    const giftId = crypto.randomUUID();
    const data = {
      ...this.giftForm.value,
      reserved: false,
      price: this.giftForm.value.price || 0
    } as any;

    await this.dataService.addGift(couple.id, giftId, data);
    this.toggleForm();
  }

  async toggleReserve(gift: Gift) {
    if (!gift.id) return;
    const couple = this.coupleStore.currentCouple();
    if (!couple?.id) return;

    if (gift.reserved) {
      await this.dataService.updateGift(couple.id, gift.id, { reserved: false, reservedBy: '' });
    } else {
      // In dashboard just test reservation
      const name = prompt('Reserva de teste: Quem está presenteando?', 'Admin');
      if (name) {
        await this.dataService.updateGift(couple.id, gift.id, { reserved: true, reservedBy: name });
      }
    }
  }

  async deleteGift(giftId: string) {
    if (confirm('Tem certeza que deseja excluir este presente?')) {
      const couple = this.coupleStore.currentCouple();
      if (!couple?.id) return;
      await this.dataService.deleteGift(couple.id, giftId);
    }
  }
}
