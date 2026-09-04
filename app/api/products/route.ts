import {NextResponse} from 'next/server';import {createClient} from '@/lib/supabase/server'
export async function GET(){const s=await createClient();const {data,error}=await s.from('products').select('id,code,name,active').eq('active',true).order('name');if(error)return NextResponse.json({error:error.message},{status:400});return NextResponse.json(data)}
