/* ═══════════════════════════════════════════════════════════════
   SiderOXY — forms.js (loaded on contatti.html)
   - handleWorkForm: stub success handler for careers form
   - updateCVLabel: show selected file name in upload button
   - handleQuoteForm: stub success handler for quote form
   ═══════════════════════════════════════════════════════════════ */

function updateCVLabel(input){
  var file = input.files && input.files[0];
  var labelIt = document.getElementById('cv-label-it');
  var labelEn = document.getElementById('cv-label-en');
  if(file){
    var sizeMB = (file.size / (1024*1024)).toFixed(2);
    if(labelIt) labelIt.textContent = '✓ ' + file.name + ' (' + sizeMB + ' MB)';
    if(labelEn) labelEn.textContent = '✓ ' + file.name + ' (' + sizeMB + ' MB)';
  } else {
    if(labelIt) labelIt.textContent = '⊕ Allega CV (PDF, max 5MB)';
    if(labelEn) labelEn.textContent = '⊕ Attach CV (PDF, max 5MB)';
  }
}

function handleWorkForm(event){
  event.preventDefault();
  var isEN = document.getElementById('HR') && document.getElementById('HR').classList.contains('en');
  alert(isEN
    ? 'Thanks! Your application has been received. We will reply within 5 working days.'
    : 'Grazie! La tua candidatura è stata ricevuta. Ti risponderemo entro 5 giorni lavorativi.');
  event.target.reset();
  updateCVLabel(event.target.querySelector('input[type="file"]') || {files:[]});
  return false;
}

function handleQuoteForm(event){
  event.preventDefault();
  var isEN = document.getElementById('HR') && document.getElementById('HR').classList.contains('en');
  alert(isEN
    ? 'Thanks! Your request has been received. Our technical office will reply within 24 working hours.'
    : 'Grazie! La tua richiesta è stata ricevuta. Il nostro ufficio tecnico ti risponderà entro 24 ore lavorative.');
  event.target.reset();
  return false;
}
