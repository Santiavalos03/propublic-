import {NextResponse} from 'next/server';import QRCode from 'qrcode'
export async function GET(req:Request){const u=new URL(req.url).searchParams.get('url');if(!u)return NextResponse.json({error:'url requerida'},{status:400});const png=await QRCode.toBuffer(u,{width:500,margin:2});return new NextResponse(png as any,{headers:{'content-type':'image/png','cache-control':'public,max-age=3600'}})}
