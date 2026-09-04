import {NextResponse} from 'next/server'
import {createAdminClient} from '@/lib/supabase/admin'
import {createClient} from '@/lib/supabase/server'
export async function POST(req:Request){
 try{
  const {identifier,password}=await req.json()
  if(!identifier||!password)return NextResponse.json({error:'Faltan credenciales'},{status:400})
  const admin=createAdminClient()
  const field=identifier.includes('@')?'email':'phone'
  const {data:profile}=await admin.from('profiles').select('email,status').eq(field,identifier).maybeSingle()
  if(!profile||profile.status!=='active')return NextResponse.json({error:'Usuario no encontrado o inactivo'},{status:401})
  const supabase=await createClient()
  const {error}=await supabase.auth.signInWithPassword({email:profile.email,password})
  if(error)return NextResponse.json({error:'Credenciales inválidas'},{status:401})
  return NextResponse.json({ok:true})
 }catch(e){return NextResponse.json({error:'Error de autenticación'},{status:500})}
}
