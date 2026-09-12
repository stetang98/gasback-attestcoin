import {mountDarkVeil,GREEN_PRESET} from './vendor/darkveil.js';
const host=document.getElementById('veil');
const canvas=document.createElement('canvas');host.append(canvas);
try{const background=mountDarkVeil(canvas,{...GREEN_PRESET,hueShift:110,resolutionScale:.8});window.addEventListener('pagehide',()=>background.destroy(),{once:true});}catch(error){canvas.remove();console.warn('Decorative background unavailable:',error.message);}
