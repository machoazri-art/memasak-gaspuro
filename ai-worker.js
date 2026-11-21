export default {
 async fetch(request, env) {
  const origin=request.headers.get("Origin")||"",allowed=(env.ALLOWED_ORIGIN||"").split(",").map(x=>x.trim()).filter(Boolean),corsOrigin=allowed.includes(origin)?origin:(allowed.includes("*")?"*":"");
  const headers={"Access-Control-Allow-Methods":"POST, OPTIONS","Access-Control-Allow-Headers":"Content-Type","Vary":"Origin"};
  if(corsOrigin)headers["Access-Control-Allow-Origin"]=corsOrigin;
  if(request.method==="OPTIONS")return new Response(null,{status:204,headers});
  if(request.method!=="POST")return json({error:"Method not allowed"},405,headers);
  if(!env.OPENAI_API_KEY)return json({error:"OPENAI_API_KEY belum ditetapkan pada Worker."},503,headers);
  if(allowed.length&&!corsOrigin)return json({error:"Origin tidak dibenarkan."},403,headers);
  try {
   const body=await request.json(),question=String(body.question||"Analisis bandar ini.").slice(0,2500),summary=JSON.stringify(body.state||{}).slice(0,14000);
   const content=[{type:"input_text",text:"Anda ialah penasihat operasi untuk game simulasi bandar dan restoran Memasak Gaspuro. Balas dalam Bahasa Melayu Malaysia yang santai, jelas dan praktikal. Gunakan hanya fakta dalam data/peta; bezakan pemerhatian visual daripada nombor. Ini snapshot pada masa permintaan, bukan pemantauan video berterusan. Beri komen spesifik, semak risiko ekonomi/kapasiti/pekerja/pembangunan, dan cadangkan maksimum 3 tindakan mengikut keutamaan. Anda tidak boleh mengubah game.\n\nDATA GAME:\n"+summary+"\n\nSOALAN PEMAIN:\n"+question}];
   if(typeof body.image==="string"&&body.image.startsWith("data:image/")&&body.image.length<5500000)content.push({type:"input_image",image_url:body.image,detail:"high"});
   const upstream=await fetch("https://api.openai.com/v1/responses",{method:"POST",headers:{"Authorization":"Bearer "+env.OPENAI_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({model:env.OPENAI_MODEL||"gpt-6.2-astra",input:[{role:"user",content}],max_output_tokens:700})});
   const result=await upstream.json();if(!upstream.ok)return json({error:result.error?.message||"Permintaan OpenAI gagal."},upstream.status,headers);
   const reply=(result.output||[]).flatMap(x=>x.content||[]).filter(x=>x.type==="output_text").map(x=>x.text).join("\n").trim();
   return json({reply:reply||"AI tidak memulangkan teks. Cuba sekali lagi."},200,headers);
  } catch(error) { return json({error:error.message||"Ralat Worker."},500,headers); }
 }
};
function json(data,status,headers){return new Response(JSON.stringify(data),{status,headers:{...headers,"Content-Type":"application/json; charset=utf-8","Cache-Control":"no-store"}});}
