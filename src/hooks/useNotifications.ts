import { useEffect } from 'react'
import { type User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function useNotifications(user: User | null) {
  useEffect(() => {
    if (!user) return
    if (!('Notification' in window)) return

    async function checkAndNotify() {
      if (Notification.permission === 'default') {
        await Notification.requestPermission()
      }
      if (Notification.permission !== 'granted') return

      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const todayStr = today.toISOString().split('T')[0]

      const { data: pets } = await supabase
        .from('pets')
        .select('id, name')
        .eq('user_id', user!.id)

      if (!pets) return

      for (const pet of pets) {
        // Check vaccine expiry reminders
        const { data: vaccines } = await supabase
          .from('vaccines')
          .select('*')
          .eq('pet_id', pet.id)
          .not('expiry_date', 'is', null)

        for (const v of vaccines ?? []) {
          const expiry = new Date(v.expiry_date)
          expiry.setHours(0, 0, 0, 0)
          const daysLeft = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
          if (daysLeft >= 0 && daysLeft <= v.reminder_days) {
            const key = `notif_v_${v.id}_${todayStr}`
            if (!localStorage.getItem(key)) {
              new Notification(`🐾 ${pet.name} — ${v.name}`, {
                body: daysLeft === 0
                  ? 'Il vaccino scade oggi!'
                  : `Il vaccino scade tra ${daysLeft} giorn${daysLeft === 1 ? 'o' : 'i'}`,
                icon: '/favicon.ico',
              })
              localStorage.setItem(key, '1')
            }
          }
        }

        // Check diary reminders
        const { data: diary } = await supabase
          .from('diary_entries')
          .select('*')
          .eq('pet_id', pet.id)
          .not('reminder_date', 'is', null)

        for (const entry of diary ?? []) {
          if (!entry.reminder_date) continue
          const reminderDate = new Date(entry.reminder_date)
          reminderDate.setHours(0, 0, 0, 0)
          if (reminderDate.getTime() === today.getTime()) {
            const key = `notif_d_${entry.id}_${todayStr}`
            if (!localStorage.getItem(key)) {
              new Notification(`📔 ${pet.name} — Promemoria`, {
                body: entry.content.slice(0, 100),
                icon: '/favicon.ico',
              })
              localStorage.setItem(key, '1')
            }
          }
        }
      }
    }

    checkAndNotify()
  }, [user])
}
