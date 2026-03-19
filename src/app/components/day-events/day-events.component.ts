import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-day-events',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './day-events.component.html',
  styleUrl: './day-events.component.css'
})
export class DayEventsComponent {
  @Input() selectedDate!: Date;
  @Input() events: Event[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() editEvent = new EventEmitter<Event>();
  @Output() deleteEvent = new EventEmitter<Event>();
  @Output() newEvent = new EventEmitter<Date>();

  formatDate(date: Date): string {
    return date.toLocaleDateString('fr-FR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  formatTime(dateString: string): string {
    return new Date(dateString).toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  onClose(): void {
    this.close.emit();
  }

  onEditEvent(event: Event): void {
    this.editEvent.emit(event);
  }

  onDeleteEvent(event: Event): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      this.deleteEvent.emit(event);
    }
  }

  onNewEvent(): void {
    this.newEvent.emit(this.selectedDate);
  }
}