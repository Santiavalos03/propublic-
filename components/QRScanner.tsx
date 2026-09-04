'use client'
import {useEffect, useRef, useState} from 'react'

export default function QRScanner({onResult}:{onResult:(value:string)=>void}) {
  const videoRef=useRef<HTMLVideoElement>(null)
  const [error,setError]=useState('')
  useEffect(()=>{
    let stream:MediaStream|undefined
    let timer:number|undefined
    let stopped=false
    async function start(){
      try{
        if(!('BarcodeDetector' in window)){setError('Este navegador no dispone de BarcodeDetector. Use un navegador compatible o introduzca el número manualmente.');return}
        stream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}}})
        if(videoRef.current){videoRef.current.srcObject=stream;await videoRef.current.play()}
        const Detector=(window as any).BarcodeDetector
        const detector=new Detector({formats:['qr_code']})
        const scan=async()=>{
          if(stopped||!videoRef.current)return
          const codes=await detector.detect(videoRef.current)
          if(codes?.[0]?.rawValue){onResult(codes[0].rawValue);return}
          timer=window.setTimeout(scan,350)
        }
        scan()
      }catch(e){setError('No se pudo acceder a la cámara. Verifique permisos del navegador.')}
    }
    start()
    return()=>{stopped=true;if(timer)clearTimeout(timer);stream?.getTracks().forEach(t=>t.stop())}
  },[onResult])
  return <div className="card"><video ref={videoRef} muted playsInline style={{width:'100%',maxWidth:420,borderRadius:12}} />{error&&<div className="error">{error}</div>}</div>
}
