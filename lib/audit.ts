import { createClient } from '@/lib/supabase/server'
export async function audit(action:string,module:string,recordId?:string,details?:unknown){
  const supabase=await createClient()
  const {data:{user}}=await supabase.auth.getUser()
  if(!user) return
  await supabase.from('audit_logs').insert({actor_id:user.id,action,module,record_id:recordId||null,details:details||null})
}
