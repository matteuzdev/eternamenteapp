import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { DataService, Couple, Guest, Gift } from '../services/data.service';
import { THEMES } from '../models/theme';
import { InvitePreviewComponent } from '../components/invite-preview';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-invite',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, InvitePreviewComponent, MatIconModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen flex flex-col items-center justify-center p-4 transition-colors duration-500"
         [style.background]="'linear-gradient(135deg, ' + theme.primary + ' 0%, ' + theme.accent + ' 100%)'">
      
      @if (loading()) {
         <div class="flex flex-col items-center gap-4">
           <div class="font-display text-4xl text-white">Eternamente</div>
           <div class="font-sans text-[10px] tracking-widest text-[#C9A96E] uppercase">carregando...</div>
         </div>
      } @else if (!couple() || !guest()) {
         <div class="text-center text-white space-y-4">
            <h1 class="text-3xl font-bold font-sans">Convite não encontrado</h1>
            <p class="opacity-80">Este link pode ser inválido ou foi removido.</p>
         </div>
      } @else {
         
         @if (step() === 'invite') {
           <div class="w-full max-w-[440px] animate-in fade-in slide-in-from-bottom-4">
             <app-invite-preview [couple]="couple()" [guestName]="guest()?.name"></app-invite-preview>
             
             @if (guest()?.id !== 'preview') {
               <div class="mt-6 flex justify-center gap-3">
                 <button (click)="setAnswer('confirmed')" 
                         class="flex-1 max-w-[180px] py-3.5 bg-white font-sans font-semibold text-[13px] tracking-widest cursor-pointer shadow-[0_4px_20px_rgba(0,0,0,0.2)] transition-transform hover:scale-105"
                         [style.color]="theme.primary">
                    ✓ Confirmar Presença
                 </button>
                 <button (click)="setAnswer('declined')" 
                         class="flex-1 max-w-[180px] py-3.5 bg-transparent text-white font-sans text-[13px] tracking-widest cursor-pointer border transition-colors hover:bg-white/10"
                         [style.borderColor]="'rgba(255,255,255,0.5)'">
                    ✕ Não poderei ir
                 </button>
               </div>
             } @else {
                <div class="mt-6 flex justify-center">
                   <div class="text-white/70 text-sm font-sans tracking-wide">Modo de visualização (RSVP desativado)</div>
                </div>
             }
           </div>
         }

         @if (step() === 'form') {
           <div class="w-full max-w-[420px] bg-white px-7 py-8 animate-in fade-in zoom-in-95">
             <div class="font-display text-3xl text-center mb-1" [style.color]="theme.primary">{{ splitNames[0] }} & {{ splitNames[1] }}</div>
             <div class="font-sans text-[9px] tracking-[3px] text-center mb-6 uppercase" [style.color]="theme.secondary">
               {{ answer() === 'confirmed' ? 'Que alegria! Confirme os detalhes' : 'Que pena! Deixe uma mensagem' }}
             </div>

             <form [formGroup]="rsvpForm" (ngSubmit)="submitRsvp()">
               @if (answer() === 'confirmed') {
                 <div class="mb-5">
                   <label class="block font-sans text-[10px] tracking-[2px] uppercase mb-2" [style.color]="theme.primary">Quantas pessoas virão com você?</label>
                   <div class="flex gap-2">
                     @for (n of [1, 2, 3, 4, 5]; track n) {
                       <button type="button" (click)="setCompanions(n)"
                               class="w-10 h-10 font-sans font-semibold cursor-pointer border-2 transition-all"
                               [style.borderColor]="rsvpForm.value.companions === n ? theme.primary : '#ddd'"
                               [style.background]="rsvpForm.value.companions === n ? theme.primary : '#fff'"
                               [style.color]="rsvpForm.value.companions === n ? '#fff' : theme.primary">
                         {{ n }}
                       </button>
                     }
                   </div>
                 </div>

                 <div class="mb-5">
                   <label class="block font-sans text-[10px] tracking-[2px] uppercase mb-2" [style.color]="theme.primary">Restrições alimentares</label>
                   <input type="text" formControlName="dietaryNotes" placeholder="ex: vegetariano, sem glúten..." 
                          class="w-full px-3.5 py-2.5 border border-[#ddd] font-sans text-[12px] outline-none focus:border-bento-accent">
                 </div>
               }

               <div class="mb-6">
                 <label class="block font-sans text-[10px] tracking-[2px] uppercase mb-2" [style.color]="theme.primary">Mensagem para o casal (opcional)</label>
                 <textarea formControlName="message" placeholder="Escreva um recadinho..." rows="3" 
                           class="w-full px-3.5 py-2.5 border border-[#ddd] font-serif italic text-sm outline-none resize-none focus:border-bento-accent"></textarea>
               </div>

               <button type="submit" [disabled]="submitting()"
                       class="w-full py-3.5 text-white font-sans font-semibold text-[12px] tracking-[2px] uppercase cursor-pointer transition-opacity"
                       [style.background]="theme.primary"
                       [class.opacity-50]="submitting()">
                 {{ submitting() ? 'Enviando...' : 'Enviar Confirmação' }}
               </button>

               <button type="button" (click)="step.set('invite')" 
                       class="w-full mt-3 py-2.5 bg-transparent border-none font-sans text-[11px] text-[#aaa] cursor-pointer hover:text-gray-700">
                 ← Voltar ao convite
               </button>
             </form>
           </div>
         }

         @if (step() === 'thanks') {
           <div class="w-full max-w-[420px] bg-white px-7 py-10 text-center animate-in fade-in zoom-in-95">
             <div class="text-5xl mb-4">{{ answer() === 'confirmed' ? '🎉' : '💌' }}</div>
             <div class="font-display text-4xl mb-2" [style.color]="theme.primary">{{ answer() === 'confirmed' ? 'Até lá!' : 'Com carinho' }}</div>
             <div class="font-serif italic text-[#666] text-[15px] leading-[1.8] mb-6">
               {{ answer() === 'confirmed' 
                  ? 'Sua presença foi confirmada! Mal podemos esperar para celebrar com você neste dia tão especial.' 
                  : 'Sua resposta foi recebida. Sentiremos sua falta, mas agradecemos por avisar com carinho.' }}
             </div>

             @if (answer() === 'confirmed' && countdown !== null) {
               <div class="p-4 mb-5" [style.background]="theme.bg">
                 <div class="font-sans text-[9px] tracking-[3px] uppercase mb-1.5" [style.color]="theme.secondary">Faltam</div>
                 <div class="font-display text-5xl" [style.color]="theme.primary">{{ countdown }}</div>
                 <div class="font-sans text-[10px] tracking-[2px] uppercase" [style.color]="theme.accent">dias</div>
               </div>
             }

             <div class="mb-6">
                <button (click)="loadGifts()" class="w-full py-3 text-white font-sans font-semibold border-2 bg-transparent text-[12px] tracking-[2px] uppercase cursor-pointer transition-colors hover:bg-black/5" [style.color]="theme.primary" [style.borderColor]="theme.primary">
                   🎁 Ver Lista de Presentes
                </button>
             </div>

             <div class="font-serif italic text-[13px]" [style.color]="theme.accent">
               Com amor, {{ splitNames[0] }} & {{ splitNames[1] }} ♥
             </div>
           </div>
         }

         @if (step() === 'gifts') {
           <div class="w-full max-w-[420px] bg-white px-5 py-8 animate-in fade-in zoom-in-95 h-full max-h-[80vh] overflow-y-auto overflow-x-hidden relative">
             <button (click)="step.set('thanks')" class="absolute top-4 left-4" [style.color]="theme.primary">
               <mat-icon>arrow_back</mat-icon>
             </button>
             <div class="font-display text-3xl text-center mb-1 mt-6" [style.color]="theme.primary">Lista de Presentes</div>
             <div class="font-sans text-[9px] tracking-[3px] text-center mb-6 uppercase" [style.color]="theme.secondary">
               Contribua com nossa jornada
             </div>

             <div class="space-y-4">
                @if (loadingGifts()) {
                   <div class="text-center font-serif text-sm">Carregando lista...</div>
                }
                @for (gift of gifts(); track gift.id) {
                   <div class="p-4 border border-[#eee] rounded-md relative" [class.opacity-50]="gift.reserved">
                      @if (gift.reserved) {
                         <div class="absolute top-2 right-2 bg-[#eee] px-2 py-0.5 text-[8px] uppercase tracking-widest font-bold text-[#888]">Reservado</div>
                      }
                      <div class="font-serif text-lg font-bold" [style.color]="theme.primary">{{ gift.name }}</div>
                      @if (gift.price) {
                         <div class="text-[#666] text-sm mt-1">R$ {{ gift.price | number:'1.2-2':'pt-BR' }}</div>
                      }
                      <div class="mt-3 flex gap-2">
                         @if (gift.link && !gift.reserved) {
                            <a [href]="gift.link" target="_blank" class="flex-1 py-2 text-center text-[10px] tracking-widest uppercase bg-[#eee] text-[#333] font-semibold hover:bg-[#ddd] transition-colors">Comprar Online</a>
                         }
                         @if (!gift.reserved) {
                            <button (click)="reserveGift(gift)" class="flex-1 py-2 text-center text-[10px] tracking-widest uppercase text-white font-semibold transition-colors" [style.background]="theme.primary">
                               Reservar Presente
                            </button>
                         }
                      </div>
                   </div>
                }
                @if (!loadingGifts() && gifts().length === 0) {
                   <div class="text-center font-serif text-sm text-[#888]">A lista de presentes não foi configurada ou está vazia.</div>
                }
             </div>
           </div>
         }
      }
    </div>
  `
})
export class InvitePage implements OnInit {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private fb = inject(FormBuilder);

  loading = signal(true);
  couple = signal<Couple | null>(null);
  guest = signal<Guest | null>(null);
  
  step = signal<'invite' | 'form' | 'thanks' | 'gifts'>('invite');
  answer = signal<'confirmed' | 'declined' | null>(null);
  submitting = signal(false);

  loadingGifts = signal(false);
  gifts = signal<Gift[]>([]);

  rsvpForm = this.fb.group({
    companions: [1],
    dietaryNotes: [''],
    message: ['']
  });

  get theme() {
    return THEMES.find(t => t.id === this.couple()?.themeId) || THEMES[0];
  }

  get splitNames(): string[] {
    const defaultNames = ['Nome 1', 'Nome 2'];
    const n = this.couple()?.names;
    if (!n) return defaultNames;
    if (n.includes('&')) return n.split('&').map(x => x.trim());
    if (n.includes(' e ')) return n.split(' e ').map(x => x.trim());
    return [n, ''];
  }

  get countdown(): number | null {
    const c = this.couple();
    if (!c?.weddingDate) return null;
    const d = new Date(c.weddingDate + 'T12:00:00');
    if (isNaN(d.getTime())) return null;
    return Math.max(0, Math.ceil((d.getTime() - new Date().getTime()) / 86400000));
  }

  async ngOnInit() {
    const coupleId = this.route.snapshot.paramMap.get('coupleId');
    const guestId = this.route.snapshot.paramMap.get('guestId');

    if (coupleId && guestId) {
      try {
        const [c, g] = await Promise.all([
          this.dataService.getCouple(coupleId),
          guestId === 'preview' 
            ? Promise.resolve({ id: 'preview', name: 'Convidado de Teste', status: 'pending' } as Guest) 
            : this.dataService.getGuest(coupleId, guestId)
        ]);

        this.couple.set(c);
        this.guest.set(g as Guest);

        if (g && g.status === 'confirmed') {
          this.answer.set('confirmed');
          this.rsvpForm.patchValue({
             companions: g.companions || 1,
             dietaryNotes: g.dietaryNotes || '',
             message: g.message || ''
          });
          this.step.set('thanks');
        } else if (g && g.status === 'declined') {
          this.answer.set('declined');
          this.rsvpForm.patchValue({ message: g.message || '' });
          this.step.set('thanks');
        }

        if (guestId !== 'preview' && g) {
          if (!g.openCount) g.openCount = 0;
          await this.dataService.updateGuest(coupleId, guestId, {
             openCount: g.openCount + 1
          });
        }
      } catch (error) {
        console.error('Error loading invite:', error);
      } finally {
        this.loading.set(false);
      }
    } else {
      this.loading.set(false);
    }
  }

  setAnswer(ans: 'confirmed' | 'declined') {
    this.answer.set(ans);
    if (ans === 'declined') {
       this.rsvpForm.get('companions')?.setValue(0);
       this.rsvpForm.get('dietaryNotes')?.setValue('');
    }
    this.step.set('form');
  }

  setCompanions(n: number) {
    this.rsvpForm.get('companions')?.setValue(n);
  }

  async submitRsvp() {
    if (this.rsvpForm.invalid) return;
    const coupleId = this.route.snapshot.paramMap.get('coupleId');
    const guestId = this.route.snapshot.paramMap.get('guestId');

    if (coupleId && guestId && guestId !== 'preview') {
      this.submitting.set(true);
      try {
        await this.dataService.updateGuest(coupleId, guestId, {
          status: this.answer()!,
          companions: this.answer() === 'confirmed' ? this.rsvpForm.value.companions || 0 : 0,
          dietaryNotes: this.answer() === 'confirmed' ? this.rsvpForm.value.dietaryNotes || '' : '',
          message: this.rsvpForm.value.message || ''
        });
        this.step.set('thanks');
      } catch (error) {
        console.error('Error saving RSVP:', error);
      } finally {
        this.submitting.set(false);
      }
    }
  }

  async loadGifts() {
    this.step.set('gifts');
    const c = this.couple();
    if (!c?.id) return;
    this.loadingGifts.set(true);
    try {
      const g = await firstValueFrom(this.dataService.getGifts(c.id));
      this.gifts.set(g);
    } catch (error) {
      console.error(error);
    } finally {
      this.loadingGifts.set(false);
    }
  }

  async reserveGift(gift: Gift) {
    const c = this.couple();
    const gst = this.guest();
    if (!c?.id || !gst?.name || !gift.id) return;
    
    if (confirm(`Deseja reservar "${gift.name}"?`)) {
       try {
         await this.dataService.updateGift(c.id, gift.id, { reserved: true, reservedBy: gst.name });
         // Optionally refresh
         await this.loadGifts();
         alert('Presente reservado com sucesso! Muito obrigado(a).');
       } catch (error) {
         console.error('Error reserving gift', error);
         alert('Erro ao reservar presente.');
       }
    }
  }
}
