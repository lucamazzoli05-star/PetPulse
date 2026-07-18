export interface Pet {
  id: string
  user_id: string
  name: string
  species: string
  breed: string | null
  birth_date: string | null
  photo_url: string | null
  active_sections: PetSection[]
  created_at: string
}

export type PetSection = 'vaccines' | 'expenses' | 'weight' | 'diary' | 'vet_visits'

export interface Vaccine {
  id: string
  pet_id: string
  name: string
  date: string
  expiry_date: string | null
  reminder_days: number
  notes: string | null
  created_at: string
}

export interface Expense {
  id: string
  pet_id: string
  date: string
  amount: number
  category: ExpenseCategory
  notes: string | null
  created_at: string
}

export type ExpenseCategory = 'vet' | 'food' | 'grooming' | 'toys' | 'medicine' | 'other'

export interface WeightEntry {
  id: string
  pet_id: string
  date: string
  weight_kg: number
  notes: string | null
  created_at: string
}

export interface DiaryEntry {
  id: string
  pet_id: string
  date: string
  content: string
  reminder_date: string | null
  created_at: string
}

export interface VetVisit {
  id: string
  pet_id: string
  date: string
  reason: string
  vet_name: string | null
  medicines: string | null
  next_visit_date: string | null
  report_url: string | null
  notes: string | null
  created_at: string
}

export interface User {
  id: string
  email: string
}
