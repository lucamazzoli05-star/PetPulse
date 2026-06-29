import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { type Pet } from '../types'
import { useAuth } from '../context/AuthContext'

export function usePets() {
  const { user } = useAuth()
  const [pets, setPets] = useState<Pet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    fetchPets()
  }, [user])

  async function fetchPets() {
    setLoading(true)
    const { data } = await supabase
      .from('pets')
      .select('*')
      .order('created_at', { ascending: false })
    setPets(data ?? [])
    setLoading(false)
  }

  async function addPet(pet: Omit<Pet, 'id' | 'user_id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('pets')
      .insert({ ...pet, user_id: user!.id })
      .select()
      .single()
    if (!error && data) setPets(prev => [data, ...prev])
    return { data, error }
  }

  async function deletePet(id: string) {
    const { error } = await supabase.from('pets').delete().eq('id', id)
    if (!error) setPets(prev => prev.filter(p => p.id !== id))
    return { error }
  }

  return { pets, loading, refetch: fetchPets, addPet, deletePet }
}
