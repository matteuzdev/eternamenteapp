import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CoupleStoreService } from '../../services/couple-store.service';
import { DataService, Guest } from '../../services/data.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { filter, switchMap, map } from 'rxjs';
import { Timestamp } from 'firebase/firestore';

@Component({
  selector: 'app-dashboard-guests',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, AsyncPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="space-y-8">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-[32px] font-serif font-bold tracking-tight text-bento-text">Convidados</h1>
          <p class="text-bento-text/60 mt-1 font-medium text-sm">Gerencie sua lista de convidados e envie os convites.</p>
        </div>
        <button (click)="isAdding.set(true)" class="px-5 py-2.5 bg-bento-accent text-white rounded-btn font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm">
          <mat-icon>add</mat-icon> Adicionar
        </button>
      </div>

      <!-- Add Guest Form -->
      @if (isAdding()) {
        <div class="bg-bento-card p-6 rounded-bento border border-bento-border shadow-bento animate-in fade-in slide-in-from-top-4 duration-300">
          <h2 class="text-xl font-medium mb-4 flex items-center gap-2 text-bento-text">
            <mat-icon class="text-bento-text/60">person_add</mat-icon> Novo Convidado
          </h2>
          <form [formGroup]="guestForm" (ngSubmit)="saveGuest()" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div class="col-span-1 lg:col-span-2 space-y-1">
              <label class="text-sm font-medium text-bento-text/70">Nome</label>
              <input formControlName="name" type="text" class="w-full px-4 py-2 border border-bento-border rounded-xl focus:ring-2 focus:ring-bento-accent focus:outline-none bg-bento-bg" placeholder="Ex: João Silva">
            </div>

            <div class="space-y-1">
              <label class="text-sm font-medium text-bento-text/70">Grupo</label>
              <input formControlName="groupName" type="text" class="w-full px-4 py-2 border border-bento-border rounded-xl focus:ring-2 focus:ring-bento-accent focus:outline-none bg-bento-bg" placeholder="Ex: Família Noiva">
            </div>

            <div class="space-y-1">
              <label class="text-sm font-medium text-bento-text/70">WhatsApp/Telefone</label>
              <input formControlName="phone" type="text" class="w-full px-4 py-2 border border-bento-border rounded-xl focus:ring-2 focus:ring-bento-accent focus:outline-none bg-bento-bg" placeholder="(00) 00000-0000">
            </div>

            <div class="col-span-1 md:col-span-2 lg:col-span-4 flex items-center justify-end gap-3 pt-4">
              <button type="button" (click)="isAdding.set(false)" class="px-5 py-2 text-bento-text/60 hover:bg-bento-bg rounded-btn font-medium transition-colors">Cancelar</button>
              <button type="submit" [disabled]="guestForm.invalid" class="px-5 py-2 bg-bento-text text-white rounded-btn font-medium hover:bg-bento-text/90 transition-colors disabled:opacity-50">Salvar Convidado</button>
            </div>
          </form>
        </div>
      }

      <!-- Guests Table -->
      <div class="bg-bento-card rounded-bento border border-bento-border shadow-bento overflow-hidden">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse">
            <thead>
              <tr class="bg-bento-bg/50 border-b border-bento-border">
                <th class="py-4 px-6 text-xs font-semibold text-bento-text/60 uppercase tracking-widest">Convidado</th>
                <th class="py-4 px-6 text-xs font-semibold text-bento-text/60 uppercase tracking-widest">Status</th>
                <th class="py-4 px-6 text-xs font-semibold text-bento-text/60 uppercase tracking-widest">Acompanhantes</th>
                <th class="py-4 px-6 text-xs font-semibold text-bento-text/60 uppercase tracking-widest text-right">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-bento-border">
              @for (g of guests$ | async; track g.id) {
                <tr class="hover:bg-bento-bg/30 transition-colors">
                  <td class="py-4 px-6">
                    <div class="font-medium text-bento-text text-sm">{{g.name}}</div>
                    <div class="text-[12px] text-bento-text/60 font-medium mt-0.5">{{g.groupName || 'Sem grupo'}} 
                      @if (g.phone) { <span class="ml-1 opacity-70">• {{g.phone}}</span> }
                    </div>
                  </td>
                  <td class="py-4 px-6">
                    @if (g.status === 'confirmed') {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                        <mat-icon class="text-[12px] w-3 h-3">check</mat-icon> Confirmado
                      </span>
                    } @else if (g.status === 'declined') {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800">
                        <mat-icon class="text-[12px] w-3 h-3">close</mat-icon> Recusou
                      </span>
                    } @else {
                      <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800">
                        <mat-icon class="text-[12px] w-3 h-3">schedule</mat-icon> Pendente
                      </span>
                    }
                  </td>
                  <td class="py-4 px-6 text-bento-text/80 text-sm font-medium">
                    {{ g.companions || 0 }}
                  </td>
                  <td class="py-4 px-6 text-right space-x-2">
                    <button class="text-bento-text/40 hover:text-bento-accent transition-colors" title="Copiar Link" (click)="copyLink(g)">
                      <mat-icon>link</mat-icon>
                    </button>
                    <button class="text-bento-text/40 hover:text-rose-500 transition-colors" title="Excluir" (click)="deleteGuest(g.id!)">
                      <mat-icon>delete</mat-icon>
                    </button>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="4" class="py-12 text-center text-bento-text/50 text-sm font-medium">
                    Nenhum convidado adicionado ainda.
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class GuestsPage {
  private dataService = inject(DataService);
  private coupleStore = inject(CoupleStoreService);
  private fb = inject(FormBuilder);

  isAdding = signal(false);

  guestForm = this.fb.group({
    name: ['', Validators.required],
    groupName: [''],
    phone: ['']
  });

  guests$ = toObservable(this.coupleStore.currentCouple).pipe(
    filter(c => c !== undefined && c !== null),
    switchMap(c => this.dataService.getGuests(c!.id!)),
    map(g => [...g].sort((a,b) => a.name.localeCompare(b.name)))
  );

  async saveGuest() {
    if (this.guestForm.invalid) return;
    const couple = this.coupleStore.currentCouple();
    if (!couple || !couple.id) return;

    const guestId = crypto.randomUUID();
    const formVal = this.guestForm.value;
    
    await this.dataService.addGuest(couple.id, guestId, {
      name: formVal.name!,
      groupName: formVal.groupName || undefined,
      phone: formVal.phone || undefined,
      status: 'pending',
      companions: 0
    });

    this.guestForm.reset();
    this.isAdding.set(false);
  }

  async deleteGuest(guestId: string) {
    if(!confirm('Tem certeza?')) return;
    const couple = this.coupleStore.currentCouple();
    if (!couple || !couple.id) return;
    await this.dataService.deleteGuest(couple.id, guestId);
  }

  copyLink(guest: Guest) {
    const couple = this.coupleStore.currentCouple();
    if (!couple || !couple.id) return;
    const url = `${window.location.origin}/i/${couple.id}/c/${guest.id}`;
    navigator.clipboard.writeText(url);
    alert('Link copiado!');
  }
}
