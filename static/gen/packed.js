function calcularMassaVE(){const DDVE=Number(document.getElementById('diam_diast_final').value);const PPVE=Number(document.getElementById('esp_diast_ppve').value);const SIV=Number(document.getElementById('esp_diast_septo').value);if(DDVE>0&&PPVE>0&&SIV>0){const DDVEcm=DDVE/10;const PPVEcm=PPVE/10;const SIVcm=SIV/10;return Math.round(0.8*(1.04*Math.pow((DDVEcm+PPVEcm+SIVcm),3)-Math.pow(DDVEcm,3))+0.6);}
return 0;}
function setElementText(element,text){if(element){element.textContent=text;}}
function setElementValue(element,value){if(element){element.value=value;}}
function getElementValue(element){return element?(parseFloat(element.value)||0):0;}
function calcularSuperficieCorporea(peso,altura){return Math.round((0.007184*Math.pow(peso,0.425)*Math.pow(altura,0.725))*100)/100;}
function classificarAtrioEsquerdo(valor,sexo){if(!valor||!sexo)return{texto:'',nivel:'normal'};let classificacao={texto:'',nivel:'normal'};if(sexo==='M'){if(valor<=40){classificacao.texto='normal';classificacao.nivel='normal';}else if(valor>40&&valor<=44){classificacao.texto='levemente aumentado';classificacao.nivel='mild';}else if(valor>44&&valor<=48){classificacao.texto='moderadamente aumentado';classificacao.nivel='moderate';}else{classificacao.texto='gravemente aumentado';classificacao.nivel='severe';}}else if(sexo==='F'){if(valor<=38){classificacao.texto='normal';classificacao.nivel='normal';}else if(valor>38&&valor<=42){classificacao.texto='levemente aumentado';classificacao.nivel='mild';}else if(valor>42&&valor<=46){classificacao.texto='moderadamente aumentado';classificacao.nivel='moderate';}else{classificacao.texto='gravemente aumentado';classificacao.nivel='severe';}}
return classificacao;}
function atualizarClassificacao(elemento,texto,nivel){if(!elemento)return;elemento.textContent=texto;elemento.className='alert '+nivel;}
function obterNivelClassificacao(texto){if(texto.includes('normal'))return'normal';if(texto.includes('levemente')||texto.includes('discretamente'))return'mild';if(texto.includes('moderadamente'))return'moderate';if(texto.includes('gravemente')||texto.includes('importante'))return'severe';return'normal';}
function calcularVolumeDiastolicoFinal(diametro){const diametroCm=diametro/10;return Math.round((7/(2.4+diametroCm))*Math.pow(diametroCm,3));}
function calcularVolumeSistolicoFinal(diametro){const diametroCm=diametro/10;return Math.round((7/(2.4+diametroCm))*Math.pow(diametroCm,3));}
function classificarAorta(valor,sexo,segmento){if(!valor||!sexo||!segmento)return{texto:'',nivel:'normal'};const referencias={'M':{'anel':{normal:[23,29],discreto:[30,33],moderado:[34,37],importante:37},'raiz':{normal:[31,37],discreto:[37,40],moderado:[40,43],importante:44},'juncao':{normal:[26,32],discreto:[33,36],moderado:[36,39],importante:40},'ascendente':{normal:[26,34],discreto:[35,39],moderado:[40,43],importante:44}},'F':{'anel':{normal:[21,25],discreto:[26,29],moderado:[29,32],importante:32},'raiz':{normal:[27,33],discreto:[34,37],moderado:[37,40],importante:40},'juncao':{normal:[23,29],discreto:[30,33],moderado:[34,37],importante:38},'ascendente':{normal:[23,31],discreto:[32,36],moderado:[37,41],importante:42}}};const ref=referencias[sexo][segmento];if(!ref)return{texto:'',nivel:'normal'};let classificacao={texto:'',nivel:'normal'};if(valor<=ref.normal[1]){classificacao.texto='normal';classificacao.nivel='normal';}else if(valor<=ref.discreto[1]){classificacao.texto='discretamente dilatada';classificacao.nivel='mild';}else if(valor<=ref.moderado[1]){classificacao.texto='moderadamente dilatada';classificacao.nivel='moderate';}else if(valor>ref.importante){classificacao.texto='importante dilatação';classificacao.nivel='severe';}
const segmentoNomes={'anel':'Anel aórtico','raiz':'Raiz da aorta','juncao':'Junção sinotubular','ascendente':'Aorta ascendente'};return classificacao.texto?{texto:`${segmentoNomes[segmento]}${classificacao.texto}.`,nivel:classificacao.nivel}:{texto:'',nivel:'normal'};}
function classificarSeptoEParede(valor,sexo){if(!valor||!sexo)return{texto:'',nivel:'normal'};let classificacao={texto:'',nivel:'normal'};if(sexo==='F'){if(valor>=6&&valor<=10){classificacao.texto='normal';classificacao.nivel='normal';}else if(valor>=11&&valor<=13){classificacao.texto='discretamente aumentado';classificacao.nivel='mild';}else if(valor>=14&&valor<=16){classificacao.texto='moderadamente aumentado';classificacao.nivel='moderate';}else if(valor>16){classificacao.texto='gravemente aumentado';classificacao.nivel='severe';}}else if(sexo==='M'){if(valor>=6&&valor<=11){classificacao.texto='normal';classificacao.nivel='normal';}else if(valor>=12&&valor<=14){classificacao.texto='discretamente aumentado';classificacao.nivel='mild';}else if(valor>=15&&valor<=17){classificacao.texto='moderadamente aumentado';classificacao.nivel='moderate';}else if(valor>17){classificacao.texto='gravemente aumentado';classificacao.nivel='severe';}}
return classificacao;}
function classificarDiametroVE(valor,sexo,tipo){if(!valor||!sexo||!tipo)return{texto:'',nivel:'normal'};const referencias={'M':{'diastolico':{normal:[42,58],discreto:[59,63],moderado:[64,68],importante:68},'sistolico':{normal:[25,40],discreto:[41,43],moderado:[44,45],importante:45}},'F':{'diastolico':{normal:[38,52],discreto:[53,56],moderado:[57,61],importante:61},'sistolico':{normal:[22,35],discreto:[36,38],moderado:[39,41],importante:41}}};const ref=referencias[sexo][tipo];if(!ref)return{texto:'',nivel:'normal'};let classificacao={texto:'',nivel:'normal'};if(valor>=ref.normal[0]&&valor<=ref.normal[1]){classificacao.texto='normal';classificacao.nivel='normal';}else if(valor>=ref.discreto[0]&&valor<=ref.discreto[1]){classificacao.texto='discretamente aumentado';classificacao.nivel='mild';}else if(valor>=ref.moderado[0]&&valor<=ref.moderado[1]){classificacao.texto='moderadamente aumentado';classificacao.nivel='moderate';}else if(valor>ref.importante){classificacao.texto='importante aumento';classificacao.nivel='severe';}else if(valor<ref.normal[0]){classificacao.texto='reduzido';classificacao.nivel='severe';}
const tipoNome=tipo==='diastolico'?'diastólico':'sistólico';return{texto:classificacao.texto?`Diâmetro ${tipoNome}do VE ${classificacao.texto}.`:'',nivel:classificacao.nivel};}
function classificarEspessuraRelativa(espessuraRelativa,massaVE,sexo){if(!espessuraRelativa||!massaVE||!sexo)return{texto:'',nivel:'normal'};const limiteMassa={'M':115,'F':95};const massaAumentada=massaVE>limiteMassa[sexo];let classificacao={texto:'',nivel:'moderate'};if(espessuraRelativa<0.42){if(massaAumentada){classificacao.texto='Hipertrofia excêntrica do VE.';}else{classificacao.texto='Geometria normal do VE.';classificacao.nivel='normal';}}else{if(massaAumentada){classificacao.texto='Hipertrofia concêntrica do VE.';}else{classificacao.texto='Remodelamento concêntrico do VE.';}}
return classificacao;}
function calcularResultados(){const elementos={peso:document.getElementById('peso'),altura:document.getElementById('altura'),atrio:document.getElementById('atrio'),diamDiastFinal:document.getElementById('diam_diast_final'),diamSistFinal:document.getElementById('diam_sist_final'),espDiastSepto:document.getElementById('esp_diast_septo'),espDiastPPVE:document.getElementById('esp_diast_ppve'),superficie:document.getElementById('superficie'),printVolumeDiastFinal:document.getElementById('print_volume_diast_final'),printVolumeSistFinal:document.getElementById('print_volume_sist_final'),printVolumeEjetado:document.getElementById('print_volume_ejetado'),printFracaoEjecao:document.getElementById('print_fracao_ejecao'),printPercentEncurt:document.getElementById('print_percent_encurt'),printEspRelativa:document.getElementById('print_esp_relativa'),printMassaVE:document.getElementById('print_massa_ve'),printIndiceMassa:document.getElementById('print_indice_massa'),classificacaoFe:document.getElementById('classificacao_fe'),classificacaoAe:document.getElementById('classificacao_ae'),sexo:document.getElementById('sexo'),aorta:document.getElementById('aorta'),aortaAsc:document.getElementById('aorta_ascendente'),classificacaoAorta:document.getElementById('classificacao_aorta'),classificacaoAortaAsc:document.getElementById('classificacao_aorta_ascendente'),classificacaoSepto:document.getElementById('classificacao_septo'),classificacaoPPVE:document.getElementById('classificacao_ppve'),classificacaoDiastolico:document.getElementById('classificacao_diastolico'),classificacaoSistolico:document.getElementById('classificacao_sistolico'),classificacaoEspessura:document.getElementById('classificacao_espessura')};if(!elementos.diamDiastFinal||!elementos.diamSistFinal){console.error('Elementos essenciais não encontrados');return;}
const peso=getElementValue(elementos.peso);const altura=getElementValue(elementos.altura);const atrio=getElementValue(elementos.atrio);const diamDiastFinal=getElementValue(elementos.diamDiastFinal);const diamSistFinal=getElementValue(elementos.diamSistFinal);const espDiastSepto=getElementValue(elementos.espDiastSepto);const espDiastPPVE=getElementValue(elementos.espDiastPPVE);const aorta=getElementValue(elementos.aorta);const aortaAsc=getElementValue(elementos.aortaAsc);if(atrio>0&&elementos.classificacaoAe&&elementos.sexo){const resultado=classificarAtrioEsquerdo(atrio,elementos.sexo.value);atualizarClassificacao(elementos.classificacaoAe,`Átrio esquerdo ${resultado.texto}.`,resultado.nivel);}
if(peso>0&&altura>0){const superficie=calcularSuperficieCorporea(peso,altura);setElementValue(elementos.superficie,superficie.toFixed(2));}
let volumeDiastFinal=0;if(diamDiastFinal>0){volumeDiastFinal=calcularVolumeDiastolicoFinal(diamDiastFinal);setElementText(elementos.printVolumeDiastFinal,`${volumeDiastFinal}mL`);}
let volumeSistFinal=0;if(diamSistFinal>0){volumeSistFinal=calcularVolumeSistolicoFinal(diamSistFinal);setElementText(elementos.printVolumeSistFinal,`${volumeSistFinal}mL`);}
if(volumeDiastFinal>0&&volumeSistFinal>0){const volumeEjetado=volumeDiastFinal-volumeSistFinal;setElementText(elementos.printVolumeEjetado,`${volumeEjetado}mL`);const fracaoEjecao=Math.round((volumeEjetado/volumeDiastFinal)*100);setElementText(elementos.printFracaoEjecao,`${fracaoEjecao}%`);if(elementos.classificacaoFe&&elementos.sexo){const sexo=elementos.sexo.value;let classificacao={texto:'',nivel:'normal'};if(sexo==='M'){if(fracaoEjecao>=52&&fracaoEjecao<=72){classificacao.texto='normal';classificacao.nivel='normal';}else if(fracaoEjecao>72){classificacao.texto='aumentada';classificacao.nivel='normal';}else if(fracaoEjecao>=41&&fracaoEjecao<52){classificacao.texto='disfunção discreta';classificacao.nivel='mild';}else if(fracaoEjecao>=30&&fracaoEjecao<41){classificacao.texto='disfunção moderada';classificacao.nivel='moderate';}else if(fracaoEjecao<30){classificacao.texto='disfunção grave';classificacao.nivel='severe';}}else if(sexo==='F'){if(fracaoEjecao>=54&&fracaoEjecao<=74){classificacao.texto='normal';classificacao.nivel='normal';}else if(fracaoEjecao>74){classificacao.texto='aumentada';classificacao.nivel='normal';}else if(fracaoEjecao>=41&&fracaoEjecao<54){classificacao.texto='disfunção discreta';classificacao.nivel='mild';}else if(fracaoEjecao>=30&&fracaoEjecao<41){classificacao.texto='disfunção moderada';classificacao.nivel='moderate';}else if(fracaoEjecao<30){classificacao.texto='disfunção grave';classificacao.nivel='severe';}}
if(classificacao.texto){atualizarClassificacao(elementos.classificacaoFe,`Fração de ejeção do ventrículo esquerdo ${classificacao.texto}.`,classificacao.nivel);}}}
if(diamDiastFinal>0&&diamSistFinal>0){const percentEncurt=Math.round(((diamDiastFinal-diamSistFinal)/diamDiastFinal)*100);setElementText(elementos.printPercentEncurt,`${percentEncurt}%`);}
if(diamDiastFinal>0&&espDiastPPVE>0){const espessuraRelativa=Math.round((2*espDiastPPVE/diamDiastFinal)*100)/100;setElementText(elementos.printEspRelativa,espessuraRelativa.toFixed(2));if(elementos.classificacaoEspessura&&elementos.sexo){const superficie=parseFloat(elementos.superficie?.value||0);const massaVE=calcularMassaVE();const indiceMassa=superficie>0?Math.round((massaVE/superficie)*10)/10:0;const resultado=classificarEspessuraRelativa(espessuraRelativa,indiceMassa,elementos.sexo.value);atualizarClassificacao(elementos.classificacaoEspessura,resultado.texto,resultado.nivel);}}
const massaVE=calcularMassaVE();if(massaVE>0){setElementText(elementos.printMassaVE,`${massaVE}g`);const superficie=parseFloat(elementos.superficie?.value||0);if(superficie>0){const indiceMassa=Math.round((massaVE/superficie)*10)/10;setElementText(elementos.printIndiceMassa,`${indiceMassa}g/m²`);}}
if(aorta>0&&elementos.classificacaoAorta&&elementos.sexo){const resultado=classificarAorta(aorta,elementos.sexo.value,'raiz');atualizarClassificacao(elementos.classificacaoAorta,resultado.texto,resultado.nivel);}
if(aortaAsc>0&&elementos.classificacaoAortaAsc&&elementos.sexo){const resultado=classificarAorta(aortaAsc,elementos.sexo.value,'ascendente');atualizarClassificacao(elementos.classificacaoAortaAsc,resultado.texto,resultado.nivel);}
if(espDiastSepto>0&&elementos.classificacaoSepto&&elementos.sexo){const resultado=classificarSeptoEParede(espDiastSepto,elementos.sexo.value);atualizarClassificacao(elementos.classificacaoSepto,`Septo interventricular ${resultado.texto}.`,resultado.nivel);}
if(espDiastPPVE>0&&elementos.classificacaoPPVE&&elementos.sexo){const resultado=classificarSeptoEParede(espDiastPPVE,elementos.sexo.value);atualizarClassificacao(elementos.classificacaoPPVE,`Parede posterior do VE ${resultado.texto}.`,resultado.nivel);}
if(diamDiastFinal>0&&elementos.classificacaoDiastolico&&elementos.sexo){const resultado=classificarDiametroVE(diamDiastFinal,elementos.sexo.value,'diastolico');atualizarClassificacao(elementos.classificacaoDiastolico,resultado.texto,resultado.nivel);}
if(diamSistFinal>0&&elementos.classificacaoSistolico&&elementos.sexo){const resultado=classificarDiametroVE(diamSistFinal,elementos.sexo.value,'sistolico');atualizarClassificacao(elementos.classificacaoSistolico,resultado.texto,resultado.nivel);}}
function destacarValorAlterado(elemento){if(!elemento)return;const parentCell=elemento.parentElement;const alertDiv=parentCell.querySelector('.alert');if(alertDiv){alertDiv.classList.add('alert-value');setTimeout(()=>{alertDiv.classList.remove('alert-value');},2000);}}
document.addEventListener('DOMContentLoaded',function(){const inputs=document.querySelectorAll('input[type="number"]');const sexoSelect=document.getElementById('sexo');if(inputs.length>0&&sexoSelect){inputs.forEach(input=>{input.addEventListener('input',function(event){destacarValorAlterado(event.target);calcularResultados();});});sexoSelect.addEventListener('change',calcularResultados);}else{console.error('Elementos necessários não encontrados durante a inicialização');}});function getCSRFToken(){const csrfMetaTag=document.querySelector('meta[name="csrf-token"]');if(csrfMetaTag){const token=csrfMetaTag.getAttribute('content');if(token)return token;}
const csrfInput=document.querySelector('input[name="csrf_token"]');if(csrfInput){const token=csrfInput.value;if(token)return token;}
const csrfCookie=document.cookie.split('; ').find(row=>row.startsWith('csrf_token='));if(csrfCookie){const token=csrfCookie.split('=')[1];if(token)return token;}
console.error('CSRF token não encontrado em nenhuma fonte');return null;}
function addCSRFToken(headers={}){const token=getCSRFToken();if(!token){console.error('Token CSRF não disponível');return headers;}
return{...headers,'X-CSRFToken':token};}
$(document).ready(function(){const token=getCSRFToken();if(token){$.ajaxSetup({beforeSend:function(xhr){xhr.setRequestHeader('X-CSRFToken',token);}});}else{console.error('Não foi possível configurar o token CSRF para requisições AJAX');}});function updateCSRFToken(){const token=getCSRFToken();if(token){let metaTag=document.querySelector('meta[name="csrf-token"]');if(!metaTag){metaTag=document.createElement('meta');metaTag.name='csrf-token';document.head.appendChild(metaTag);}
metaTag.content=token;let inputField=document.querySelector('input[name="csrf_token"]');if(!inputField){inputField=document.createElement('input');inputField.type='hidden';inputField.name='csrf_token';document.body.appendChild(inputField);}
inputField.value=token;}}
document.addEventListener('DOMContentLoaded',updateCSRFToken);function gerarDOC(){try{console.log('Iniciando geração do DOC...');const paciente={nome:document.getElementById('nome').value||'N/D',dataNascimento:document.getElementById('dataNascimento').value||'N/D',sexo:document.getElementById('sexo').value||'N/D',peso:document.getElementById('peso').value?`${document.getElementById('peso').value}kg`:'N/D',altura:document.getElementById('altura').value?`${document.getElementById('altura').value}cm`:'N/D',dataExame:document.getElementById('dataExame').value||new Date().toLocaleDateString('pt-BR')};console.log('Dados do paciente:',paciente);const doctorSelect=document.getElementById('selectedDoctor');const doctorData=doctorSelect.value?{nome:doctorSelect.options[doctorSelect.selectedIndex].text,crm:doctorSelect.options[doctorSelect.selectedIndex].dataset.crm,rqe:doctorSelect.options[doctorSelect.selectedIndex].dataset.rqe}:null;console.log('Dados do médico:',doctorData);const laudoContent=$('#editor').summernote('code');console.log('Conteúdo do editor recuperado');const metaTag=document.querySelector('meta[name="csrf-token"]');if(!metaTag){throw new Error('Meta tag CSRF não encontrada');}
const data={paciente:paciente,medidas:{atrio:document.getElementById('atrio').value||'N/D',aorta:document.getElementById('aorta').value||'N/D',diamDiastFinal:document.getElementById('diam_diast_final').value||'N/D',diamSistFinal:document.getElementById('diam_sist_final').value||'N/D',espDiastSepto:document.getElementById('esp_diast_septo').value||'N/D',espDiastPPVE:document.getElementById('esp_diast_ppve').value||'N/D',vd:document.getElementById('vd').value||'N/D'},calculos:{volumeDiastFinal:document.getElementById('print_volume_diast_final').textContent,volumeSistFinal:document.getElementById('print_volume_sist_final').textContent,volumeEjetado:document.getElementById('print_volume_ejetado').textContent,fracaoEjecao:document.getElementById('print_fracao_ejecao').textContent,percentEncurt:document.getElementById('print_percent_encurt').textContent,espRelativa:document.getElementById('print_esp_relativa').textContent,massaVE:document.getElementById('print_massa_ve').textContent},laudo:laudoContent,medico:doctorData};console.log('Dados preparados para envio:',data);fetch('/gerar_doc',{method:'POST',headers:{'Content-Type':'application/json','X-CSRFToken':metaTag.getAttribute('content')},body:JSON.stringify(data)}).then(response=>{console.log('Resposta recebida:',response);if(!response.ok){if(response.headers.get('content-type')?.includes('application/json')){return response.json().then(error=>{throw new Error(error.error||'Erro ao gerar o documento');});}
throw new Error('Erro ao gerar o documento');}
return response.blob();}).then(blob=>{console.log('Blob recebido:',blob);if(!blob){throw new Error('Documento gerado está vazio');}
const url=window.URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`Laudo_${paciente.nome.replace(/[^a-zA-Z0-9]/g,'_')}.docx`;document.body.appendChild(a);a.click();window.URL.revokeObjectURL(url);a.remove();console.log('Download iniciado');}).catch(error=>{console.error('Erro ao gerar DOC:',error);alert('Erro ao gerar o documento DOC: '+error.message);});}catch(error){console.error('Erro ao preparar dados:',error);alert('Erro ao preparar dados para geração do documento: '+error.message);}}
async function loadDoctors(){try{const response=await fetch('/api/doctors',{method:'GET',headers:{'Accept':'application/json'}});if(!response.ok){const errorData=await response.json().catch(()=>({}));throw new Error(errorData.error||'Erro ao carregar médicos');}
const doctors=await response.json();if(!Array.isArray(doctors)){throw new Error('Formato de dados inválido');}
const updates=[];const doctorsTable=document.querySelector('#doctorsTable');if(doctorsTable){updates.push(updateDoctorsTable(doctors));}
const doctorSelect=document.querySelector('#selectedDoctor');if(doctorSelect){updates.push(updateDoctorsSelect(doctors));}
await Promise.all(updates);}catch(error){console.error('Erro:',error);const doctorsTable=document.querySelector('#doctorsTable');if(doctorsTable){const tbody=doctorsTable.querySelector('tbody');if(tbody){tbody.innerHTML=`<tr><td colspan="4"class="text-center text-danger">Erro ao carregar médicos:${error.message}</td></tr>`;}}}}
function updateDoctorsTable(doctors){const doctorsTable=document.querySelector('#doctorsTable');if(!doctorsTable){return;}
let tbody=doctorsTable.querySelector('tbody');if(!tbody){console.warn("Elemento tbody não encontrado");return;}
try{const rows=doctors.map(doctor=>{const tr=document.createElement('tr');tr.innerHTML=`<td>${doctor.full_name}</td><td>${doctor.crm}</td><td>${doctor.rqe||'-'}</td><td><button class="btn btn-sm btn-danger"onclick="deleteDoctor(${doctor.id})"><i class="fas fa-trash"></i></button></td>`;return tr;});tbody.innerHTML='';rows.forEach(row=>tbody.appendChild(row));}catch(error){console.error('Erro ao atualizar tabela:',error);tbody.innerHTML=`<tr><td colspan="4"class="text-center text-danger">Erro ao atualizar tabela:${error.message}</td></tr>`;}}
function updateDoctorsSelect(doctors){const select=document.querySelector('#selectedDoctor');if(!select)return;select.innerHTML=`<option value="">Selecione...</option>${doctors.map(doctor=>`<option value="${doctor.id}"data-crm="${doctor.crm}"data-rqe="${doctor.rqe}">${doctor.full_name}</option>`).join('')}`;}
async function createDoctor(event){event.preventDefault();const name=document.getElementById('doctorName').value.trim();const crm=document.getElementById('doctorCRM').value.trim();const rqe=document.getElementById('doctorRQE').value.trim();if(!name){showFeedback('Nome do médico é obrigatório','danger');return;}
if(!crm){showFeedback('CRM é obrigatório','danger');return;}
const doctorData={full_name:name,crm:crm,rqe:rqe};try{const response=await fetch('/api/doctors',{method:'POST',headers:{'Content-Type':'application/json','Accept':'application/json'},body:JSON.stringify(doctorData)});const data=await response.json();if(!response.ok){throw new Error(data.error||'Erro ao cadastrar médico');}
showFeedback('Médico cadastrado com sucesso','success');document.getElementById('doctorForm').reset();await loadDoctors();}catch(error){console.error('Erro:',error);showFeedback(error.message,'danger');}}
function showFeedback(message,type='success'){const feedbackDiv=document.createElement('div');feedbackDiv.className=`alert alert-${type}position-fixed top-0 end-0 m-3`;feedbackDiv.style.zIndex='1050';feedbackDiv.textContent=message;document.body.appendChild(feedbackDiv);setTimeout(()=>feedbackDiv.remove(),3000);}
async function deleteDoctor(id){if(!confirm('Tem certeza que deseja excluir este médico?')){return;}
try{const response=await fetch(`/api/doctors/${id}`,{method:'DELETE',headers:{'Accept':'application/json'}});if(!response.ok){const data=await response.json().catch(()=>({}));throw new Error(data.error||'Erro ao excluir médico');}
const feedbackDiv=document.createElement('div');feedbackDiv.className='alert alert-success position-fixed top-0 end-0 m-3';feedbackDiv.textContent='Médico excluído com sucesso';document.body.appendChild(feedbackDiv);setTimeout(()=>feedbackDiv.remove(),3000);await loadDoctors();}catch(error){console.error('Erro:',error);const errorDiv=document.createElement('div');errorDiv.className='alert alert-danger position-fixed top-0 end-0 m-3';errorDiv.textContent=error.message;document.body.appendChild(errorDiv);setTimeout(()=>errorDiv.remove(),3000);}}
document.addEventListener('DOMContentLoaded',function(){const form=document.getElementById('doctorForm');if(form){form.addEventListener('submit',createDoctor);}
loadDoctors();});$(document).ready(function(){console.log('Iniciando configuração do editor...');try{$('#editor').summernote({height:500,lang:'pt-BR',toolbar:[['style',['style']],['font',['bold','italic','underline','strikethrough','clear']],['fontsize',['fontsize']],['color',['color']],['para',['ul','ol','paragraph']],['table',['table']],['insert',['link','picture']],['view',['fullscreen','codeview']],['custom',['gerarTextoIA','avaliarLaudo']]],fontSizes:['8','9','10','11','12','14','16','18','24','36'],styleTags:['p','h1','h2','h3','h4','h5','h6'],placeholder:'Digite o conteúdo do laudo aqui...',callbacks:{onChange:function(contents){localStorage.setItem('reportContent',contents);showBackupIndicator();},onInit:function(){console.log('Editor inicializado com sucesso');const savedContent=localStorage.getItem('reportContent');if(savedContent){$('#editor').summernote('code',savedContent);}}},buttons:{gerarTextoIA:function(context){var ui=$.summernote.ui;var button=ui.button({contents:'<i class="fas fa-robot"></i> Simplifica IA',tooltip:'Gerar Texto com IA',click:function(){$('#modalGerarTexto').modal('show');}});return button.render();},avaliarLaudo:function(context){var ui=$.summernote.ui;var button=ui.button({contents:'<i class="fas fa-check-circle"></i> Avaliar',tooltip:'Avaliar Laudo Atual',click:function(){avaliarLaudoAtual();}});return button.render();}}});loadTemplatesAndPhrases();loadDoctors();$('body').append(`<div class="modal fade"id="modalGerarTexto"tabindex="-1"><div class="modal-dialog modal-xl"><div class="modal-content"><div class="modal-header"><h5 class="modal-title">Simplifica IA</h5><button type="button"class="btn-close"data-bs-dismiss="modal"></button></div><div class="modal-body"><div class="row"><div class="col-md-5"><div class="form-group"><label for="promptIA">Descreva o que você deseja gerar:</label><textarea class="form-control"id="promptIA"rows="3"
placeholder="Ex: Gere um laudo normal para um paciente com fração de ejeção preservada"></textarea><div class="mt-3"><button type="button"class="btn btn-primary"onclick="gerarTextoIA()"><i class="fas fa-robot"></i>Gerar Texto</button><button type="button"class="btn btn-info ms-2"onclick="avaliarLaudoAtual()"><i class="fas fa-check-circle"></i>Avaliar Laudo Atual</button></div></div></div><div class="col-md-7"><div class="preview-area"><label>Preview do texto gerado:</label><div id="previewTextoIA"class="form-control preview-content"contenteditable="true"></div><div class="btn-group mt-2"><button class="btn btn-success btn-sm"onclick="inserirTextoGerado()"><i class="fas fa-paste"></i>Inserir no Editor</button><button class="btn btn-outline-secondary btn-sm"onclick="copiarTextoGerado()"><i class="fas fa-copy"></i>Copiar</button></div></div></div></div></div></div></div></div>`);}catch(error){console.error('Erro ao configurar editor:',error);}});async function avaliarLaudoAtual(){const laudoAtual=$('#editor').summernote('code');if(!laudoAtual){alert('Por favor, insira algum texto no editor para avaliar.');return;}
try{const token=getCSRFToken();if(!token){throw new Error('CSRF token não encontrado. Por favor, recarregue a página.');}
const previewArea=document.getElementById('previewTextoIA');previewArea.innerHTML='<div class="alert alert-info">Analisando laudo, por favor aguarde...</div>';const response=await fetch('/api/gerar_texto',{method:'POST',headers:addCSRFToken({'Content-Type':'application/json'}),body:JSON.stringify({prompt:`Por favor,analise este laudo ecocardiográfico e forneça feedback sobre sua completude,clareza e possíveis melhorias:\n\n${laudoAtual}`})});const data=await response.json();if(data.error){throw new Error(data.error);}
if(data.texto){previewArea.innerHTML=data.texto;}else{throw new Error('Resposta inválida do servidor');}}catch(error){console.error('Erro ao avaliar laudo:',error);const previewArea=document.getElementById('previewTextoIA');previewArea.innerHTML=`<div class="alert alert-danger"><strong>Erro ao avaliar laudo:</strong><br>${error.message||'Erro desconhecido'}</div>`;}}
function copiarTextoGerado(){const texto=document.getElementById('previewTextoIA').innerText;if(texto){navigator.clipboard.writeText(texto).then(()=>{const btn=document.querySelector('.btn-outline-secondary');btn.innerHTML='<i class="fas fa-check"></i> Copiado!';setTimeout(()=>{btn.innerHTML='<i class="fas fa-copy"></i> Copiar';},2000);}).catch(err=>{console.error('Erro ao copiar texto:',err);alert('Não foi possível copiar o texto automaticamente.');});}}
async function gerarTextoIA(){const prompt=document.getElementById('promptIA').value;if(!prompt){alert('Por favor, descreva o que você deseja gerar.');return;}
try{const token=getCSRFToken();if(!token){throw new Error('CSRF token não encontrado. Por favor, recarregue a página.');}
const previewArea=document.getElementById('previewTextoIA');previewArea.innerHTML='<div class="alert alert-info">Gerando texto, por favor aguarde...</div>';const response=await fetch('/api/gerar_texto',{method:'POST',headers:addCSRFToken({'Content-Type':'application/json'}),body:JSON.stringify({prompt})});const data=await response.json();if(data.error){throw new Error(data.error);}
if(!response.ok){throw new Error('Erro ao gerar texto');}
if(data.texto){previewArea.innerHTML=data.texto;}else{throw new Error('Resposta inválida do servidor');}}catch(error){console.error('Erro ao gerar texto:',error);const errorMessage=error.message||'Erro desconhecido. Por favor, tente novamente.';const previewArea=document.getElementById('previewTextoIA');previewArea.innerHTML=`<div class="alert alert-danger"><strong>Erro ao gerar texto:</strong><br>${errorMessage}</div>`;}}
function inserirTextoGerado(){const textoGerado=document.getElementById('previewTextoIA').innerHTML;if(textoGerado){$('#editor').summernote('pasteHTML',textoGerado);$('#modalGerarTexto').modal('hide');document.getElementById('previewTextoIA').innerHTML='';document.getElementById('promptIA').value='';}}
async function loadTemplatesAndPhrases(){try{const response=await fetch('/api/templates');const templates=await response.json();const templateSelect=document.getElementById('templateSelect');const phraseSelect=document.getElementById('phraseSelect');templateSelect.innerHTML='<option value="">Selecione um modelo...</option>';phraseSelect.innerHTML='<option value="">Selecione uma frase...</option>';templates.filter(t=>t.category==='laudo').forEach(template=>{const option=new Option(template.name,template.id);option.title=template.content;templateSelect.add(option);});templates.filter(t=>['normal','alterado','conclusao'].includes(t.category)).forEach(phrase=>{const option=new Option(phrase.name,phrase.id);option.title=phrase.content;phraseSelect.add(option);});}catch(error){console.error('Erro ao carregar templates:',error);}}
async function loadDoctors(){try{const response=await fetch('/api/doctors');const doctors=await response.json();const doctorSelect=document.getElementById('selectedDoctor');doctorSelect.innerHTML='<option value="">Selecione o médico...</option>';doctors.forEach(doctor=>{const option=new Option(doctor.full_name,doctor.id);option.dataset.crm=doctor.crm;option.dataset.rqe=doctor.rqe||'';doctorSelect.add(option);});}catch(error){console.error('Erro ao carregar médicos:',error);}}
function insertSelectedTemplate(){const templateSelect=document.getElementById('templateSelect');const selectedOption=templateSelect.options[templateSelect.selectedIndex];if(selectedOption&&selectedOption.value){$('#editor').summernote('code',selectedOption.title);}}
function insertSelectedPhrase(){const phraseSelect=document.getElementById('phraseSelect');const selectedOption=phraseSelect.options[phraseSelect.selectedIndex];if(selectedOption&&selectedOption.value){const currentContent=$('#editor').summernote('code');$('#editor').summernote('pasteHTML',currentContent+'\n'+selectedOption.title);}}
function inserirAssinaturaMedico(){const select=document.getElementById('selectedDoctor');if(!select)return;const option=select.options[select.selectedIndex];if(!option||!option.value){alert('Por favor, selecione um médico responsável');return;}
const medicName=option.text;const crm=option.dataset.crm;const rqe=option.dataset.rqe;const dadosMedico=`\n\n<p style="text-align: center;"><strong>${medicName}</strong><br>CRM:${crm}${rqe?`<br>RQE:${rqe}`:''}</p>`;const currentContent=$('#editor').summernote('code');$('#editor').summernote('code',currentContent+dadosMedico);}
function showBackupIndicator(){const indicator=document.createElement('div');indicator.className='backup-indicator';indicator.textContent='Conteúdo salvo localmente';document.body.appendChild(indicator);setTimeout(()=>{indicator.remove();},2000);}
document.getElementById('templateSelect').addEventListener('change',insertSelectedTemplate);document.getElementById('phraseSelect').addEventListener('change',insertSelectedPhrase);function getCSRFToken(){return"token";}
function addCSRFToken(headers){headers["X-CSRFToken"]=getCSRFToken();return headers;}
function formatarData(input){let valor=input.value.replace(/\D/g,"");if(valor.length>2)valor=valor.replace(/^(\d{2})(\d)/,"$1/$2");if(valor.length>5)valor=valor.replace(/^(\d{2}\/\d{2})(\d)/,"$1/$2");input.value=valor;}
document.addEventListener('DOMContentLoaded',function(){const dateInput=document.getElementById('dataNascimento');if(dateInput){dateInput.addEventListener('input',function(){const examDateInput=document.getElementById('dataExame');if(examDateInput){const today=new Date();const year=today.getFullYear();const month=String(today.getMonth()+1).padStart(2,'0');const day=String(today.getDate()).padStart(2,'0');examDateInput.value=`${year}-${month}-${day}`;}
formatarData(this);});}});function validateNumericInput(input,min,max){const value=parseFloat(input.value);if(isNaN(value)){showError(input,'Valor inválido');return false;}
if(value<min||value>max){showError(input,`Valor deve estar entre ${min}e ${max}`);return false;}
removeError(input);return true;}
function showError(input,message){input.classList.add('is-invalid');const errorDiv=input.nextElementSibling||document.createElement('div');errorDiv.className='invalid-feedback';errorDiv.textContent=message;if(!input.nextElementSibling){input.parentNode.appendChild(errorDiv);}}
function removeError(input){input.classList.remove('is-invalid');const errorDiv=input.nextElementSibling;if(errorDiv&&errorDiv.className==='invalid-feedback'){errorDiv.remove();}}
document.addEventListener('DOMContentLoaded',function(){const numericInputs={'peso':{min:0.5,max:300},'altura':{min:30,max:250},'atrio':{min:10,max:100},'aorta':{min:10,max:100},'diam_diast_final':{min:10,max:100},'diam_sist_final':{min:10,max:100},'esp_diast_septo':{min:1,max:50},'esp_diast_ppve':{min:1,max:50},'vd':{min:1,max:100}};Object.entries(numericInputs).forEach(([id,limits])=>{const input=document.getElementById(id);if(input){input.addEventListener('input',()=>{validateNumericInput(input,limits.min,limits.max);});}});});function gerarPDF(){window.jsPDF=window.jspdf.jsPDF;try{const doc=new jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});const pageWidth=doc.internal.pageSize.width;const pageHeight=doc.internal.pageSize.height;const margin=25;const contentWidth=pageWidth-(2*margin);let currentY=margin;doc.setFontSize(16);doc.setFont('helvetica','bold');const titulo="Laudo de Ecodopplercardiograma";const tituloWidth=doc.getStringUnitWidth(titulo)*16/doc.internal.scaleFactor;const tituloX=(pageWidth-tituloWidth)/2;doc.text(titulo,tituloX,currentY);currentY+=15;const dataExame=document.getElementById('dataExame').value;const dataFormatada=dataExame?new Date(dataExame).toLocaleDateString('pt-BR'):new Date().toLocaleDateString('pt-BR');const dadosPaciente=[["Nome",document.getElementById('nome').value||'N/D'],["Data Nascimento",document.getElementById('dataNascimento').value||'N/D'],["Sexo",document.getElementById('sexo').value||'N/D'],["Peso",(document.getElementById('peso').value?document.getElementById('peso').value+" kg":'N/D')],["Altura",(document.getElementById('altura').value?document.getElementById('altura').value+" cm":'N/D')],["Data do Exame",dataFormatada]];doc.autoTable({startY:currentY,head:[['Dados do Paciente','Valor']],body:dadosPaciente,theme:'striped',headStyles:{fillColor:[41,128,185],textColor:255},styles:{fontSize:10},margin:{left:margin,right:margin}});currentY=doc.autoTable.previous.finalY+15;const medidasCalculos=[["Átrio Esquerdo",document.getElementById('atrio').value||'N/D',"Volume Diastólico Final",document.getElementById('print_volume_diast_final').textContent||'N/D'],["Aorta",document.getElementById('aorta').value||'N/D',"Volume Sistólico Final",document.getElementById('print_volume_sist_final').textContent||'N/D'],["Diâmetro Diastólico",document.getElementById('diam_diast_final').value||'N/D',"Volume Ejetado",document.getElementById('print_volume_ejetado').textContent||'N/D'],["Diâmetro Sistólico",document.getElementById('diam_sist_final').value||'N/D',"Fração de Ejeção",document.getElementById('print_fracao_ejecao').textContent||'N/D'],["Espessura do Septo",document.getElementById('esp_diast_septo').value||'N/D',"Percentual Enc. Cavidade",document.getElementById('print_percent_encurt').textContent||'N/D'],["Espessura PPVE",document.getElementById('esp_diast_ppve').value||'N/D',"Espessura Relativa",document.getElementById('print_esp_relativa').textContent||'N/D'],["Ventrículo Direito",document.getElementById('vd').value||'N/D',"Massa do VE",document.getElementById('print_massa_ve').textContent||'N/D']];doc.autoTable({startY:currentY,head:[['Medida','Valor','Cálculo','Resultado']],body:medidasCalculos,theme:'striped',headStyles:{fillColor:[41,128,185],textColor:255},styles:{fontSize:10},margin:{left:margin,right:margin}});doc.addPage();currentY=margin;doc.setFontSize(11);doc.setFont('helvetica','normal');const editor=document.getElementById('editor');const content=editor.innerText;const lines=doc.splitTextToSize(content,contentWidth);lines.forEach(line=>{if(currentY>pageHeight-margin){doc.addPage();currentY=margin;}
doc.text(line,margin,currentY);currentY+=7;});const doctorSelect=document.getElementById('selectedDoctor');if(doctorSelect.value){if(currentY>pageHeight-40){doc.addPage();currentY=margin;}
const selectedOption=doctorSelect.selectedOptions[0];const doctorName=selectedOption.text;const doctorCRM=selectedOption.dataset.crm;const doctorRQE=selectedOption.dataset.rqe;currentY+=20;doc.setLineWidth(0.5);doc.line(pageWidth/2-40,currentY,pageWidth/2+40,currentY);currentY+=10;doc.setFont('helvetica','bold');doc.text(doctorName,pageWidth/2,currentY,{align:'center'});currentY+=7;doc.setFontSize(10);doc.text(`CRM:${doctorCRM}${doctorRQE?`/RQE:${doctorRQE}`:''}`,pageWidth/2,currentY,{align:'center'});}
const nomePaciente=document.getElementById('nome').value;const nomeArquivo=nomePaciente?`Laudo_${nomePaciente.trim().replace(/[^a-zA-Z0-9]/g,'_')}.pdf`:'laudo_ecocardiograma.pdf';doc.save(nomeArquivo);}catch(error){console.error('Erro ao gerar PDF:',error);alert('Erro ao gerar o PDF. Por favor, tente novamente.');}}