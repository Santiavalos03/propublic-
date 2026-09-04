'use client'
import {useState} from 'react'
import {useRouter} from 'next/navigation'
import QRScanner from '@/components/QRScanner'

export default function Escanear(){
 const [value,setValue]=useState('')
 const r=useRouter()
 function result(v:string){
   setValue(v)
   try{
     const u=new URL(v)
     if(u.pathname.startsWith('/p/presupuesto/')) r.push(u.pathname)
   }catch{}
 }
 return <><h1>Escanear QR</h1><p className="sub">Use la cámara para abrir un presupuesto.</p><QRScanner onResult={result}/><div className="card" style={{marginTop:14}}><label>Resultado</label><input className="input" value={value} onChange={e=>setValue(e.target.value)} placeholder="URL o número de presupuesto"/></div></>
}
