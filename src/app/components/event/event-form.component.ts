import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Event, EventRequest } from '../../models/event.model';
import { EventService } from '../../services/event.service';

@Component({
  selector: 'app-event-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './event-form.component.html',
  styleUrl: './event-form.component.css'
})
export class EventFormComponent implements OnInit {
  @Input() event: Event | null = null;
  @Input() selectedDate: Date | null = null;
  @Output() save = new EventEmitter<Event>();
  @Output() cancel = new EventEmitter<void>();
  @Output() delete = new EventEmitter<number>();

  eventForm: FormGroup;
  loading = false;
  error = '';
  isEditing = false;

  constructor(
    private fb: FormBuilder,
    private eventService: EventService
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      start_date: ['', Validators.required],
      end_date: ['', Validators.required],
      location: [''],
      color: ['#3498db'],
      is_all_day: [false],
      has_reminder: [false],
      reminder_minutes: [30]
    });
  }

  ngOnInit(): void {
    this.isEditing = !!this.event;
    
    if (this.event) {
      this.eventForm.patchValue({
        title: this.event.title,
        description: this.event.description,
        start_date: this.formatDateForInput(this.event.start_date),
        end_date: this.formatDateForInput(this.event.end_date),
        location: this.event.location,
        color: this.event.color,
        is_all_day: this.event.is_all_day,
        has_reminder: this.event.has_reminder || false,
        reminder_minutes: this.event.reminder_minutes || 30
      });
    } else if (this.selectedDate) {
      const startDate = new Date(this.selectedDate);
      const endDate = new Date(this.selectedDate);
      endDate.setHours(startDate.getHours() + 1);
      
      this.eventForm.patchValue({
        start_date: this.formatDateForInput(startDate.toISOString()),
        end_date: this.formatDateForInput(endDate.toISOString())
      });
    }
  }

  formatDateForInput(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().slice(0, 16);
  }

  onSubmit(): void {
    if (this.eventForm.valid) {
      this.loading = true;
      this.error = '';
      
      const eventData: EventRequest = {
        ...this.eventForm.value,
        start_date: new Date(this.eventForm.value.start_date).toISOString(),
        end_date: new Date(this.eventForm.value.end_date).toISOString()
      };

      const request = this.isEditing && this.event
        ? this.eventService.updateEvent(this.event.id!, eventData)
        : this.eventService.createEvent(eventData);

      request.subscribe({
        next: (event) => {
          this.save.emit(event);
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors de l\'enregistrement';
          this.loading = false;
        }
      });
    }
  }

  onDelete(): void {
    if (this.event?.id && confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      this.loading = true;
      
      this.eventService.deleteEvent(this.event.id).subscribe({
        next: () => {
          this.delete.emit(this.event!.id!);
        },
        error: (err) => {
          this.error = err.error?.message || 'Erreur lors de la suppression';
          this.loading = false;
        }
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }
}