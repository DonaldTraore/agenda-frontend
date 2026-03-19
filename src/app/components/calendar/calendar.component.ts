import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { Event } from '../../models/event.model';
import { EventFormComponent } from '../event/event-form.component';
import { DayEventsComponent } from '../day-events/day-events.component';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, EventFormComponent, DayEventsComponent],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.css'
})
export class CalendarComponent implements OnInit {
  currentDate = new Date();
  calendarDays: CalendarDay[] = [];
  events: Event[] = [];
  weekdays = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  loading = false;
  error: string | null = null;
  
  showEventForm = false;
  showDayEvents = false;
  selectedEvent: Event | null = null;
  selectedDate: Date | null = null;
  selectedDayEvents: Event[] = [];

  constructor(
    private eventService: EventService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.generateCalendar();
    setTimeout(() => this.loadEvents(), 0);
  }

  generateCalendar(): void {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - (firstDay.getDay() + 6) % 7);
    
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (7 - lastDay.getDay()) % 7);
    
    this.calendarDays = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      this.calendarDays.push({
        date: new Date(currentDate),
        isCurrentMonth: currentDate.getMonth() === month,
        isToday: this.isToday(currentDate),
        events: []
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }
  }

  loadEvents(): void {
    if (this.calendarDays.length === 0) {
      console.log('Calendrier pas encore généré');
      return;
    }
    
    const startDate = this.calendarDays[0]?.date;
    const endDate = this.calendarDays[this.calendarDays.length - 1]?.date;
    
    console.log('Chargement événements du', this.formatDate(startDate), 'au', this.formatDate(endDate));
    
    if (startDate && endDate) {
      this.loading = true;
      this.error = null;
      
      this.eventService.getEvents({
        start_date: this.formatDate(startDate),
        end_date: this.formatDate(endDate)
      }).subscribe({
        next: (response) => {
          console.log('Réponse API getEvents:', response);
          
          let events: Event[] = [];
          if (Array.isArray(response)) {
            events = response;
          } else if (response && (response as any).data && Array.isArray((response as any).data)) {
            events = (response as any).data;
          }
          
          this.events = events;
          console.log('Événements traités:', this.events);
          this.assignEventsTodays();
          this.loading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des événements:', error);
          this.error = 'Impossible de charger les événements';
          this.events = [];
          this.assignEventsTodays();
          this.loading = false;
        }
      });
    }
  }

  assignEventsTodays(): void {
    if (!Array.isArray(this.events)) {
      this.events = [];
    }
    
    this.calendarDays.forEach(day => {
      const dayStr = this.formatDate(day.date);
      day.events = this.events.filter(event => {
        const eventStartStr = event.start_date.split('T')[0];
        const eventEndStr = event.end_date.split('T')[0];
        
        return dayStr >= eventStartStr && dayStr <= eventEndStr;
      }).map(event => ({
        ...event,
        color: event.color || '#3498db'
      }));
      
      if (day.events.length > 0) {
        console.log(`Jour ${dayStr}: ${day.events.length} événements`);
      }
    });
  }

  isToday(date: Date): boolean {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }

  getCurrentMonthYear(): string {
    return this.currentDate.toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  previousMonth = (): void => this.navigateMonth(-1);

  nextMonth = (): void => this.navigateMonth(1);

  private navigateMonth(direction: number): void {
    this.currentDate = new Date(this.currentDate.getFullYear(), this.currentDate.getMonth() + direction, 1);
    this.refreshCalendar();
  }

  private refreshCalendar(): void {
    this.generateCalendar();
    setTimeout(() => this.loadEvents(), 0);
  }

  selectDay(day: CalendarDay): void {
    this.selectedDate = day.date;
    const dateStr = this.formatDate(day.date);
    
    console.log('Récupération événements pour le jour:', dateStr);
    
    this.eventService.getEventsByDay(dateStr).subscribe({
      next: (response) => {
        console.log('Réponse API getEventsByDay:', response);
        
        let events: Event[] = [];
        if (Array.isArray(response)) {
          events = response;
        } else if (response && (response as any).data && Array.isArray((response as any).data)) {
          events = (response as any).data;
        }
        
        this.selectedDayEvents = events.map(event => ({
          ...event,
          color: event.color || '#3498db'
        }));
        
        console.log('Événements traités:', this.selectedDayEvents);
        this.showDayEvents = true;
      },
      error: (error) => {
        console.error('Erreur API getEventsByDay:', error);
        this.selectedDayEvents = [...day.events];
        this.showDayEvents = true;
      }
    });
  }

  editEvent(event: Event, $event: MouseEvent): void {
    $event.stopPropagation();
    this.selectedEvent = event;
    this.selectedDate = null;
    this.showEventForm = true;
  }

  openEventForm(): void {
    this.selectedEvent = null;
    this.selectedDate = new Date();
    this.showEventForm = true;
  }

  closeEventForm(): void {
    this.showEventForm = false;
    this.selectedEvent = null;
    this.selectedDate = null;
  }

  closeDayEvents(): void {
    this.showDayEvents = false;
    this.selectedDate = null;
    this.selectedDayEvents = [];
  }

  onEditEventFromDay(event: Event): void {
    this.openEventFormFromDay(event, null);
  }

  onNewEventFromDay(date: Date): void {
    this.openEventFormFromDay(null, date);
  }

  onDeleteEventFromDay(event: Event): void {
    if (event.id) {
      this.eventService.deleteEvent(event.id).subscribe({
        next: () => {
          this.closeDayEvents();
          this.loadEvents();
        },
        error: (error) => {
          console.error('Erreur lors de la suppression:', error);
        }
      });
    }
  }

  private openEventFormFromDay(event: Event | null, date: Date | null): void {
    this.closeDayEvents();
    this.selectedEvent = event;
    this.selectedDate = date;
    this.showEventForm = true;
  }

  onEventSave(event: Event): void {
    this.closeEventForm();
    this.loadEvents();
  }

  onEventDelete(eventId: number): void {
    this.closeEventForm();
    this.loadEvents();
  }

  logout(): void {
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/auth/login']);
      },
      error: () => {
        // Même en cas d'erreur, on déconnecte localement
        this.router.navigate(['/auth/login']);
      }
    });
  }
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: Event[];
}