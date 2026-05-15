import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { THEMES } from '../models/theme';

@Component({
  selector: 'app-invite-preview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [style.background]="theme.bg" [style.fontFamily]="'Montserrat, sans-serif'" [style.maxWidth]="compact ? '100%' : '420px'" style="width:100%; margin: 0 auto; position:relative; overflow:hidden;" [style.boxShadow]="compact ? 'none' : '0 20px 60px rgba(0,0,0,0.25)'" [style.border]="'1px solid ' + theme.secondary + '40'">
      <div *ngFor="let pos of ['tl','tr','bl','br']" style="position:absolute; font-size:10px; opacity:0.7; z-index:10;" [style.color]="theme.secondary"
           [style.top]="pos.includes('t') ? '8px' : 'auto'"
           [style.bottom]="pos.includes('t') ? 'auto' : '8px'"
           [style.left]="pos.includes('l') ? '8px' : 'auto'"
           [style.right]="pos.includes('l') ? 'auto' : '8px'"
           [style.transform]="pos === 'tr' ? 'scaleX(-1)' : pos === 'bl' ? 'scaleY(-1)' : pos === 'br' ? 'scale(-1,-1)' : 'none'">✦</div>

      <div [style.background]="theme.primary" [style.padding]="compact ? '28px 24px 20px' : '40px 32px 28px'" style="text-align:center;">
        <div style="font-family:'Montserrat',sans-serif; font-size:9px; letter-spacing:4px; text-transform:uppercase; margin-bottom:12px;" [style.color]="theme.secondary">✦ &nbsp; Celebração de Casamento &nbsp; ✦</div>
        <div *ngIf="guestName" style="font-family:'Montserrat',sans-serif; font-size:10px; letter-spacing:2px; margin-bottom:8px;" [style.color]="theme.secondary">{{guestName}}, você está convidado(a)!</div>
        
        <div style="font-family:'Great Vibes',cursive; color:#fff; line-height:1.1; text-shadow:0 2px 20px rgba(0,0,0,0.3)" [style.fontSize]="compact ? '52px' : '64px'">
          {{splitNames[0]}} <span [style.color]="theme.secondary">&</span> {{splitNames[1] || ''}}
        </div>
        
        <div style="display:flex; align-items:center; justify-content:center; gap:10px; margin-top:12px;">
          <div style="flex:1; height:1px; max-width:70px;" [style.background]="'linear-gradient(90deg,transparent,' + theme.secondary + ',transparent)'"></div>
          <span [style.color]="theme.secondary" style="font-size:16px;">♥</span>
          <div style="flex:1; height:1px; max-width:70px;" [style.background]="'linear-gradient(90deg,' + theme.secondary + ',transparent)'"></div>
        </div>
      </div>

      <div style="display:flex; justify-content:center; margin-top:-10px; position:relative; z-index:5;">
         <svg width="72" height="36" viewBox="0 0 90 45" fill="none">
            <path d="M44 22 C44 22 20 5 8 12 C0 17 4 30 14 28 C26 26 44 22 44 22Z" [attr.fill]="theme.accent" [attr.stroke]="theme.secondary" stroke-width="0.8"/>
            <path d="M46 22 C46 22 70 5 82 12 C90 17 86 30 76 28 C64 26 46 22 46 22Z" [attr.fill]="theme.accent" [attr.stroke]="theme.secondary" stroke-width="0.8"/>
            <path d="M44 23 C38 28 28 38 22 42 C20 43 18 42 20 40 C24 35 38 26 44 23Z" [attr.fill]="theme.primary" [attr.stroke]="theme.secondary" stroke-width="0.6"/>
            <path d="M46 23 C52 28 62 38 68 42 C70 43 72 42 70 40 C66 35 52 26 46 23Z" [attr.fill]="theme.primary" [attr.stroke]="theme.secondary" stroke-width="0.6"/>
            <circle cx="45" cy="22" r="5" [attr.fill]="theme.primary" [attr.stroke]="theme.secondary" stroke-width="0.8"/>
            <circle cx="45" cy="22" r="2.5" [attr.fill]="theme.secondary"/>
          </svg>
      </div>

      <div [style.padding]="compact ? '20px 24px' : '28px 32px'" style="text-align:center;">
        
        <div *ngIf="couple?.themeConfig?.coverImage" style="margin-bottom: 24px;">
           <img [src]="couple.themeConfig.coverImage" style="width: 100%; aspect-ratio: 16/9; object-fit: cover; border-radius: 8px;" referrerpolicy="no-referrer" alt="Foto do casal" [style.border]="'2px solid ' + theme.secondary + '40'">
        </div>

        <p style="font-family:'Cormorant Garamond',serif; font-style:italic; line-height:1.9; margin-bottom:20px;" [style.fontSize]="compact ? '13px' : '14px'" [style.color]="theme.accent">
          {{couple?.message || 'Mensagem do casal aqui...'}}
        </p>
        
        <div style="display:flex; justify-content:center; gap:6px; margin-bottom:18px;">
           <div *ngFor="let size of [6,6,9,6,6]" [style.width.px]="size" [style.height.px]="size" style="border-radius:50%; box-shadow:0 1px 3px rgba(0,0,0,0.2);" [style.background]="'radial-gradient(circle at 35% 30%, #fff 0%, ' + theme.bg + ' 50%, ' + theme.secondary + ' 100%)'"></div>
        </div>

        <div style="padding:16px 20px; background:rgba(255,255,255,0.5); margin-bottom:16px;" [style.border]="'1px solid ' + theme.secondary + '60'">
          <div style="display:grid; grid-template-columns:1fr auto 1fr; gap:12px; align-items:center;">
            <div>
               <div style="font-family:'Montserrat',sans-serif; font-size:8px; letter-spacing:3px; text-transform:uppercase; margin-bottom:2px;" [style.color]="theme.secondary">Data</div>
               <div style="font-family:'Cormorant Garamond',serif; font-size:16px;" [style.color]="theme.primary">{{dateStr}}</div>
            </div>
            <div style="width:1px; height:40px;" [style.background]="'linear-gradient(to bottom, transparent, ' + theme.secondary + '80, transparent)'"></div>
            <div>
               <div style="font-family:'Montserrat',sans-serif; font-size:8px; letter-spacing:3px; text-transform:uppercase; margin-bottom:2px;" [style.color]="theme.secondary">Horário</div>
               <div style="font-family:'Cormorant Garamond',serif; font-size:16px;" [style.color]="theme.primary">{{couple?.time || '—'}}</div>
            </div>
          </div>
          <div style="height:1px; margin:12px 0;" [style.background]="'linear-gradient(90deg,transparent,' + theme.secondary + '50,transparent)'"></div>
          <div>
             <div style="font-family:'Montserrat',sans-serif; font-size:8px; letter-spacing:3px; text-transform:uppercase; margin-bottom:2px;" [style.color]="theme.secondary">Local</div>
             <div style="font-family:'Cormorant Garamond',serif; font-size:16px;" [style.color]="theme.primary">{{couple?.venue || '—'}}</div>
          </div>
          <div *ngIf="couple?.address" style="font-family:'Montserrat',sans-serif; font-size:10px; color:#888; margin-top:4px;">{{couple?.address}}</div>
        </div>
        
        <div style="font-family:'Cormorant Garamond',serif; font-style:italic; font-size:13px;" [style.color]="theme.accent">"Amor é a única flor que floresce sem precisar de estação."</div>
      </div>

      <div style="padding:16px 24px; text-align:center;" [style.background]="theme.primary" [style.borderTop]="'1px solid ' + theme.secondary + '40'">
        <div style="font-family:'Montserrat',sans-serif; font-size:8px; letter-spacing:3px; text-transform:uppercase; margin-bottom:4px;" [style.color]="theme.secondary">✦ &nbsp; Confirmação de Presença &nbsp; ✦</div>
        <div style="font-family:'Cormorant Garamond',serif; font-style:italic; font-size:12px;" [style.color]="theme.bg + 'cc'">
           {{ couple?.rsvpDeadline ? 'Confirme até ' + deadlineStr : 'Confirme sua presença' }}
        </div>
      </div>
    </div>
  `
})
export class InvitePreviewComponent {
  @Input() couple: any;
  @Input() guestName?: string;
  @Input() compact = false;

  get theme() {
    return THEMES.find(t => t.id === this.couple?.themeId) || THEMES[0];
  }

  get splitNames(): string[] {
    if (!this.couple?.names) return ['Nome 1', 'Nome 2'];
    let n = this.couple.names;
    if (n.includes('&')) return n.split('&').map((x: string) => x.trim());
    if (n.includes(' e ')) return n.split(' e ').map((x: string) => x.trim());
    return [n];
  }

  get dateStr() {
    if (!this.couple?.weddingDate) return '—';
    // Using simple format, maybe specific to Pt-BR
    try {
      const d = new Date(this.couple.weddingDate + 'T12:00:00');
      if (isNaN(d.getTime())) return this.couple.weddingDate; // fallback
      return d.toLocaleDateString("pt-BR", {day:"2-digit",month:"long",year:"numeric"});
    } catch {
      return this.couple.weddingDate;
    }
  }

  get deadlineStr() {
    if (!this.couple?.rsvpDeadline) return '';
    try {
      const d = new Date(this.couple.rsvpDeadline + 'T12:00:00');
      if (isNaN(d.getTime())) return this.couple.rsvpDeadline;
      return d.toLocaleDateString("pt-BR");
    } catch {
      return this.couple.rsvpDeadline;
    }
  }
}
