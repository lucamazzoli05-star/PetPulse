import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { type Vaccine, type Expense, type WeightEntry, type DiaryEntry, type VetVisit } from '../types'

export function useVaccines(petId: string) {
  const [vaccines, setVaccines] = useState<Vaccine[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('vaccines').select('*').eq('pet_id', petId).order('date', { ascending: false })
      .then(({ data }) => { setVaccines(data ?? []); setLoading(false) })
  }, [petId])

  async function add(v: Omit<Vaccine, 'id' | 'pet_id' | 'created_at'>) {
    const { data, error } = await supabase.from('vaccines').insert({ ...v, pet_id: petId }).select().single()
    if (!error && data) setVaccines(prev => [data, ...prev])
    return { data, error }
  }

  async function remove(id: string) {
    const { error } = await supabase.from('vaccines').delete().eq('id', id)
    if (!error) setVaccines(prev => prev.filter(v => v.id !== id))
    return { error }
  }

  return { vaccines, loading, add, remove }
}

export function useExpenses(petId: string) {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('expenses').select('*').eq('pet_id', petId).order('date', { ascending: false })
      .then(({ data }) => { setExpenses(data ?? []); setLoading(false) })
  }, [petId])

  async function add(e: Omit<Expense, 'id' | 'pet_id' | 'created_at'>) {
    const { data, error } = await supabase.from('expenses').insert({ ...e, pet_id: petId }).select().single()
    if (!error && data) setExpenses(prev => [data, ...prev])
    return { data, error }
  }

  async function remove(id: string) {
    const { error } = await supabase.from('expenses').delete().eq('id', id)
    if (!error) setExpenses(prev => prev.filter(e => e.id !== id))
    return { error }
  }

  return { expenses, loading, add, remove }
}

export function useWeightEntries(petId: string) {
  const [entries, setEntries] = useState<WeightEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('weight_entries').select('*').eq('pet_id', petId).order('date', { ascending: true })
      .then(({ data }) => { setEntries(data ?? []); setLoading(false) })
  }, [petId])

  async function add(w: Omit<WeightEntry, 'id' | 'pet_id' | 'created_at'>) {
    const { data, error } = await supabase.from('weight_entries').insert({ ...w, pet_id: petId }).select().single()
    if (!error && data) setEntries(prev => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)))
    return { data, error }
  }

  async function remove(id: string) {
    const { error } = await supabase.from('weight_entries').delete().eq('id', id)
    if (!error) setEntries(prev => prev.filter(e => e.id !== id))
    return { error }
  }

  return { entries, loading, add, remove }
}

export function useDiaryEntries(petId: string) {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('diary_entries').select('*').eq('pet_id', petId).order('date', { ascending: false })
      .then(({ data }) => { setEntries(data ?? []); setLoading(false) })
  }, [petId])

  async function add(d: Omit<DiaryEntry, 'id' | 'pet_id' | 'created_at'>) {
    const { data, error } = await supabase.from('diary_entries').insert({ ...d, pet_id: petId }).select().single()
    if (!error && data) setEntries(prev => [data, ...prev])
    return { data, error }
  }

  async function remove(id: string) {
    const { error } = await supabase.from('diary_entries').delete().eq('id', id)
    if (!error) setEntries(prev => prev.filter(e => e.id !== id))
    return { error }
  }

  return { entries, loading, add, remove }
}

export function useVetVisits(petId: string) {
  const [visits, setVisits] = useState<VetVisit[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('vet_visits').select('*').eq('pet_id', petId).order('date', { ascending: false })
      .then(({ data }) => { setVisits(data ?? []); setLoading(false) })
  }, [petId])

  async function add(v: Omit<VetVisit, 'id' | 'pet_id' | 'created_at'>) {
    const { data, error } = await supabase.from('vet_visits').insert({ ...v, pet_id: petId }).select().single()
    if (!error && data) setVisits(prev => [data, ...prev])
    return { data, error }
  }

  async function remove(id: string) {
    const { error } = await supabase.from('vet_visits').delete().eq('id', id)
    if (!error) setVisits(prev => prev.filter(v => v.id !== id))
    return { error }
  }

  return { visits, loading, add, remove }
}
