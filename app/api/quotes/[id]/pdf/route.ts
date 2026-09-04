import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'

export async function GET(_req: Request, { params }: { params: Promise<{id:string}> }) {
  const { id } = await params
  const s = await createClient()
  const { data: q, error } = await s.from('quotes').select('*,quote_items(*)').eq('id', id).single()
  if (error || !q) return new NextResponse('No encontrado', {status:404})

  const pdf = await PDFDocument.create()
  const page = pdf.addPage([595,842])
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold)
  const blue = rgb(41/255,20/255,127/255)
  let y = 800
  page.drawText('ProPublic', {x:40,y,size:24,font:bold,color:blue})
  page.drawText('Presupuesto '+q.number, {x:40,y:y-35,size:14,font:bold})
  page.drawText('Fecha: '+q.quote_date, {x:40,y:y-55,size:10,font})
  y -= 85
  page.drawText('Descripción', {x:40,y,size:9,font:bold})
  page.drawText('Cant.', {x:315,y,size:9,font:bold})
  page.drawText('Unitario', {x:370,y,size:9,font:bold})
  page.drawText('Total', {x:470,y,size:9,font:bold})
  y -= 18
  for (const item of q.quote_items ?? []) {
    if (y < 120) break
    const desc = String(item.description).slice(0,42)
    page.drawText(desc, {x:40,y,size:9,font})
    page.drawText(String(item.quantity), {x:315,y,size:9,font})
    page.drawText('Gs. '+Number(item.unit_price).toLocaleString('es-PY'), {x:370,y,size:9,font})
    page.drawText('Gs. '+Number(item.line_total).toLocaleString('es-PY'), {x:470,y,size:9,font})
    y -= 18
  }
  y -= 15
  page.drawText('Subtotal: Gs. '+Number(q.subtotal).toLocaleString('es-PY'), {x:350,y,size:10,font})
  y -= 16
  page.drawText('IVA '+q.iva_rate+'%: Gs. '+Number(q.iva_amount).toLocaleString('es-PY'), {x:350,y,size:10,font})
  y -= 16
  page.drawText('Descuento: Gs. '+Number(q.discount_amount).toLocaleString('es-PY'), {x:350,y,size:10,font})
  y -= 22
  page.drawText('TOTAL: Gs. '+Number(q.total).toLocaleString('es-PY'), {x:350,y,size:14,font:bold,color:blue})

  const bytes = await pdf.save()
  return new NextResponse(bytes as any, {
    headers:{
      'content-type':'application/pdf',
      'content-disposition':`inline; filename="${q.number}.pdf"`
    }
  })
}
