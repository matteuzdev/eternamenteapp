import { Component, ChangeDetectionStrategy, inject, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { CoupleStoreService } from '../../services/couple-store.service';
import { DataService, Couple } from '../../services/data.service';
import { THEMES } from '../../models/theme';
import { InvitePreviewComponent } from '../../components/invite-preview';

@Component({
  selector: 'app-dashboard-editor',
  standalone: true,
  imports: [CommonModule, MatIconModule, ReactiveFormsModule, InvitePreviewComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="max-w-5xl space-y-8 pb-12">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-[32px] font-display font-bold tracking-tight text-bento-accent">Editor do Convite</h1>
          <p class="text-bento-text/60 mt-1 font-medium text-sm">Personalize cada detalhe do visual e das informações.</p>
        </div>
        <div class="flex gap-3">
          <button type="button" (click)="save()" [disabled]="editorForm.invalid || !editorForm.dirty" class="px-6 py-2.5 bg-bento-accent text-white rounded-btn font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2 shadow-sm whitespace-nowrap">
            <mat-icon>save_as</mat-icon> Salvar Alterações
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        <!-- Left Column: Form -->
        <form [formGroup]="editorForm" class="space-y-6">
          
          <!-- Tabs -->
          <div class="flex border-b-2 border-bento-accent/20 mb-6 relative">
            <button type="button" (click)="editorTab.set('details')" 
              [class.border-b-bento-accent]="editorTab() === 'details'" [class.text-bento-accent]="editorTab() === 'details'"
              [class.border-b-transparent]="editorTab() !== 'details'" [class.text-bento-text/50]="editorTab() !== 'details'"
              class="flex-1 py-3 border-b-2 font-medium text-sm transition-colors mb-[-2px]">
              Detalhes
            </button>
            <button type="button" (click)="editorTab.set('theme')" 
              [class.border-b-bento-accent]="editorTab() === 'theme'" [class.text-bento-accent]="editorTab() === 'theme'"
              [class.border-b-transparent]="editorTab() !== 'theme'" [class.text-bento-text/50]="editorTab() !== 'theme'"
              class="flex-1 py-3 border-b-2 font-medium text-sm transition-colors mb-[-2px]">
              Visual & Tema
            </button>
          </div>

          <!-- Tab: Details -->
          @if (editorTab() === 'details') {
            <div class="bg-bento-card p-6 rounded-bento border border-bento-border shadow-sm space-y-5 animate-in fade-in">
              
              <div class="space-y-2">
                <label for="coverImage" class="text-xs uppercase tracking-widest font-semibold text-bento-text/50">Foto de Capa (URL)</label>
                <input id="coverImage" formControlName="coverImage" type="text" class="w-full px-4 py-3 border border-bento-border rounded-xl focus:ring-2 focus:ring-bento-accent focus:outline-none bg-bento-bg text-sm" placeholder="https://exemplo.com/foto.jpg">
              </div>

              <div class="space-y-2">
                <label for="names" class="text-xs uppercase tracking-widest font-semibold text-bento-text/50">Nomes dos Noivos</label>
                <input id="names" formControlName="names" type="text" class="w-full px-4 py-3 border border-bento-border rounded-xl focus:ring-2 focus:ring-bento-accent focus:outline-none bg-bento-bg text-sm" placeholder="Ex: Ramon & Joice">
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="space-y-2">
                  <label for="weddingDate" class="text-xs uppercase tracking-widest font-semibold text-bento-text/50">Data do Casamento</label>
                  <input id="weddingDate" formControlName="weddingDate" type="date" class="w-full px-4 py-3 border border-bento-border rounded-xl focus:ring-2 focus:ring-bento-accent focus:outline-none bg-bento-bg text-sm">
                </div>
                
                <div class="space-y-2">
                   <label for="time" class="text-xs uppercase tracking-widest font-semibold text-bento-text/50">Horário</label>
                  <input id="time" formControlName="time" type="time" class="w-full px-4 py-3 border border-bento-border rounded-xl focus:ring-2 focus:ring-bento-accent focus:outline-none bg-bento-bg text-sm">
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div class="space-y-2">
                   <label for="venue" class="text-xs uppercase tracking-widest font-semibold text-bento-text/50">Nome do Local</label>
                  <input id="venue" formControlName="venue" type="text" class="w-full px-4 py-3 border border-bento-border rounded-xl focus:ring-2 focus:ring-bento-accent focus:outline-none bg-bento-bg text-sm" placeholder="Ex: Espaço das Flores">
                </div>
                <div class="space-y-2">
                   <label for="address" class="text-xs uppercase tracking-widest font-semibold text-bento-text/50">Endereço Completo</label>
                  <input id="address" formControlName="address" type="text" class="w-full px-4 py-3 border border-bento-border rounded-xl focus:ring-2 focus:ring-bento-accent focus:outline-none bg-bento-bg text-sm" placeholder="Ex: Rua das Rosas, 123">
                </div>
              </div>

              <div class="space-y-2">
                <label for="rsvpDeadline" class="text-xs uppercase tracking-widest font-semibold text-bento-text/50">Data Limite para RSVP</label>
                <input id="rsvpDeadline" formControlName="rsvpDeadline" type="date" class="w-full px-4 py-3 border border-bento-border rounded-xl focus:ring-2 focus:ring-bento-accent focus:outline-none bg-bento-bg text-sm">
              </div>

              <div class="space-y-2">
                <label for="message" class="text-xs uppercase tracking-widest font-semibold text-bento-text/50">Mensagem do Casal</label>
                <textarea id="message" formControlName="message" rows="4" class="w-full px-4 py-3 border border-bento-border rounded-xl focus:ring-2 focus:ring-bento-accent focus:outline-none bg-bento-bg resize-none text-sm font-serif italic" placeholder="Ex: Com o coração transbordando de amor..."></textarea>
              </div>
            </div>
          }

          <!-- Tab: Theme -->
          @if (editorTab() === 'theme') {
            <div class="space-y-6 animate-in fade-in">
              <div class="bg-bento-card p-6 rounded-bento border border-bento-border shadow-sm space-y-4">
                <label class="text-xs uppercase tracking-widest font-semibold text-bento-text/50">Paleta de Cores</label>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                  @for (t of THEMES; track t.id) {
                    <button type="button" (click)="setTheme(t.id)"
                      class="p-3 border-2 rounded-xl text-left transition-all flex items-center gap-3"
                      [style.borderColor]="editorForm.get('themeId')?.value === t.id ? t.primary : '#eee'"
                      [style.backgroundColor]="'rgb(255 255 255)'"
                      [style.boxShadow]="editorForm.get('themeId')?.value === t.id ? '0 0 0 3px ' + t.primary + '30' : 'none'">
                      <div class="flex gap-1.5 flex-shrink-0">
                        <div class="w-5 h-5 rounded-sm border border-black/5" [style.backgroundColor]="t.primary"></div>
                        <div class="w-5 h-5 rounded-sm border border-black/5" [style.backgroundColor]="t.secondary"></div>
                        <div class="w-5 h-5 rounded-sm border border-black/5" [style.backgroundColor]="t.bg"></div>
                      </div>
                      <div class="text-xs font-semibold" [style.color]="t.primary">{{ t.name }}</div>
                    </button>
                  }
                </div>
              </div>
            </div>
          }
        </form>

        <!-- Right Column: Preview -->
        <div class="sticky top-6 space-y-4">
          <label class="text-xs uppercase tracking-widest font-semibold text-bento-text/50">Preview ao vivo</label>
          <div class="rounded-bento overflow-hidden bg-white shadow-sm border border-bento-border p-4 flex justify-center">
             <app-invite-preview [couple]="getPreviewCouple()" [compact]="true"></app-invite-preview>
          </div>
        </div>

      </div>
    </div>
  `
})
export class DashboardEditorComponent {
  private fb = inject(FormBuilder);
  private coupleStore = inject(CoupleStoreService);
  private dataService = inject(DataService);

  editorTab = signal<'details' | 'theme'>('details');

  THEMES = THEMES;
  editorForm = this.fb.group({
    names: ['', Validators.required],
    weddingDate: [''],
    time: [''],
    venue: [''],
    address: [''],
    message: [''],
    rsvpDeadline: [''],
    themeId: ['vinho'],
    coverImage: ['']
  });

  constructor() {
    effect(() => {
      const couple = this.coupleStore.currentCouple();
      if (couple) {
        this.editorForm.patchValue({
          names: couple.names || '',
          weddingDate: couple.weddingDate || '',
          time: couple.time || '',
          venue: couple.venue || '',
          address: couple.address || '',
          message: couple.message || '',
          rsvpDeadline: couple.rsvpDeadline || '',
          themeId: couple.themeId || 'vinho',
          coverImage: couple.themeConfig?.coverImage || ''
        }, { emitEvent: false });
      }
    });
  }

  setTheme(id: string) {
    this.editorForm.get('themeId')?.setValue(id);
    this.editorForm.markAsDirty();
  }

  getPreviewCouple(): any {
    const v = this.editorForm.value;
    return {
      ...v,
      themeConfig: {
        coverImage: v.coverImage
      }
    };
  }

  async save() {
    if (this.editorForm.invalid) return;
    const couple = this.coupleStore.currentCouple();
    if (!couple || !couple.id) return;

    const formValue = this.editorForm.value;
    const updateData: Partial<Couple> = {
      names: formValue.names || '',
      weddingDate: formValue.weddingDate || '',
      time: formValue.time || '',
      venue: formValue.venue || '',
      address: formValue.address || '',
      message: formValue.message || '',
      rsvpDeadline: formValue.rsvpDeadline || '',
      themeId: formValue.themeId || 'vinho',
      themeConfig: {
        ...(couple.themeConfig || {}),
        coverImage: formValue.coverImage || ''
      }
    };

    await this.dataService.updateCouple(couple.id, updateData);
    this.editorForm.markAsPristine();
    alert('Alterações salvas com sucesso!');
  }
}
