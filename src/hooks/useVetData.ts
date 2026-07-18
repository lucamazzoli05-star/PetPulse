import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { type VetClient, type VetAnimal, type VetWeightEntry, type VetRecord } from '../types'

export function useVetClients() {
  const [clients, setClients] = useState<VetClient[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('vet_clients').select('*').order('surname', { ascending: true })
      .then(({ data }) => { setClients(data ?? []); setLoading(false) })
  }, [])

  async function add(c: Omit<VetClient, 'id' | 'vet_user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('vet_clients').insert({ ...c, vet_user_id: user!.id }).select().single()
    if (!error && data) setClients(prev => [...prev, data].sort((a, b) => a.surname.localeCompare(b.surname)))
    return { data, error }
  }

  async function update(id: string, c: Partial<Omit<VetClient, 'id' | 'vet_user_id' | 'created_at'>>) {
    const { data, error } = await supabase.from('vet_clients').update(c).eq('id', id).select().single()
    if (!error && data) setClients(prev => prev.map(cl => cl.id === id ? data : cl))
    return { data, error }
  }

  async function remove(id: string) {
    const { error } = await supabase.from('vet_clients').delete().eq('id', id)
    if (!error) setClients(prev => prev.filter(c => c.id !== id))
    return { error }
  }

  return { clients, loading, add, update, remove }
}

export function useVetAnimals(clientId: string) {
  const [animals, setAnimals] = useState<VetAnimal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('vet_animals').select('*').eq('client_id', clientId).order('name', { ascending: true })
      .then(({ data }) => { setAnimals(data ?? []); setLoading(false) })
  }, [clientId])

  async function add(a: Omit<VetAnimal, 'id' | 'vet_user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('vet_animals').insert({ ...a, vet_user_id: user!.id }).select().single()
    if (!error && data) setAnimals(prev => [...prev, data])
    return { data, error }
  }

  async function update(id: string, a: Partial<Omit<VetAnimal, 'id' | 'vet_user_id' | 'created_at'>>) {
    const { data, error } = await supabase.from('vet_animals').update(a).eq('id', id).select().single()
    if (!error && data) setAnimals(prev => prev.map(an => an.id === id ? data : an))
    return { data, error }
  }

  async function remove(id: string) {
    const { error } = await supabase.from('vet_animals').delete().eq('id', id)
    if (!error) setAnimals(prev => prev.filter(a => a.id !== id))
    return { error }
  }

  return { animals, loading, add, update, remove }
}

export function useVetWeightEntries(animalId: string) {
  const [entries, setEntries] = useState<VetWeightEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('vet_weight_entries').select('*').eq('animal_id', animalId).order('date', { ascending: true })
      .then(({ data }) => { setEntries(data ?? []); setLoading(false) })
  }, [animalId])

  async function add(w: Omit<VetWeightEntry, 'id' | 'vet_user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('vet_weight_entries').insert({ ...w, vet_user_id: user!.id }).select().single()
    if (!error && data) setEntries(prev => [...prev, data].sort((a, b) => a.date.localeCompare(b.date)))
    return { data, error }
  }

  async function remove(id: string) {
    const { error } = await supabase.from('vet_weight_entries').delete().eq('id', id)
    if (!error) setEntries(prev => prev.filter(e => e.id !== id))
    return { error }
  }

  return { entries, loading, add, remove }
}

export function useVetRecords(animalId: string) {
  const [records, setRecords] = useState<VetRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('vet_records').select('*').eq('animal_id', animalId).order('date', { ascending: false })
      .then(({ data }) => { setRecords(data ?? []); setLoading(false) })
  }, [animalId])

  async function add(r: Omit<VetRecord, 'id' | 'vet_user_id' | 'created_at'>) {
    const { data: { user } } = await supabase.auth.getUser()
    const { data, error } = await supabase.from('vet_records').insert({ ...r, vet_user_id: user!.id }).select().single()
    if (!error && data) setRecords(prev => [data, ...prev])
    return { data, error }
  }

  async function update(id: string, r: Partial<Omit<VetRecord, 'id' | 'vet_user_id' | 'created_at'>>) {
    const { data, error } = await supabase.from('vet_records').update(r).eq('id', id).select().single()
    if (!error && data) setRecords(prev => prev.map(rec => rec.id === id ? data : rec))
    return { data, error }
  }

  async function remove(id: string) {
    const { error } = await supabase.from('vet_records').delete().eq('id', id)
    if (!error) setRecords(prev => prev.filter(r => r.id !== id))
    return { error }
  }

  return { records, loading, add, update, remove }
}
