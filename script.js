// Lagra endast de 6 huvudfälten
const textData = {
    observations: '',       // Iakttagelser vid undersökningen
    patientInfo: '',        // Uppgifter från patienten själv
    otherInfo: '',          // Information från andra personer
    journalInfo: '',        // Uppgifter från patientens journal
    assessment: '',         // Bedömning av psykisk störning
    careNeed: ''            // Bedömning av vårdbehov
};

// Mappning till PDF-fältnamn (endast de 6 fälten)
const fieldMappings = {
    observations: 'Ange de iakttagelser psykiatriska och somatiska statusfynd som är av betydelse för bedömningen av hälsotillstånd och vårdbehov',
    patientInfo: 'Uppgifter från patienten själv',
    otherInfo: 'Information från andra personer än patienten',
    journalInfo: 'Uppgifter från patientens journal',
    assessment: 'Sammanfatta vad i hälsotillståndet som ligger till grund för bedömningen att patienten har en allvarlig psykisk störning',
    careNeed: 'Ange varför patienten har ett oundgängligt direkt nödvändigt behov av psykiatrisk vård som inte kan tillgodoses på annat sätt än genom sluten psykiatrisk tvångsvård'
};

// Sektionsrubriker för UI
const sectionTitles = {
    observations: '1. Iakttagelser vid undersökningen',
    patientInfo: '2. Uppgifter från patienten själv',
    otherInfo: '3. Information från andra personer',
    journalInfo: '4. Uppgifter från journal',
    assessment: '5. Bedömning av psykisk störning',
    careNeed: '6. Bedömning av vårdbehov'
};

// Initiera appen
document.addEventListener('DOMContentLoaded', () => {
    // Hämta DOM-element
    const textAreaContainer = document.getElementById('textAreaContainer');
    const currentTextArea = document.getElementById('currentTextArea');
    const currentSectionTitle = document.getElementById('currentSectionTitle');
    const statusMessage = document.getElementById('statusMessage');
    
    // Lägg till händelsehanterare för sektionsknapparna
    document.getElementById('observationsBtn').addEventListener('click', () => openTextArea('observations'));
    document.getElementById('patientInfoBtn').addEventListener('click', () => openTextArea('patientInfo'));
    document.getElementById('otherInfoBtn').addEventListener('click', () => openTextArea('otherInfo'));
    document.getElementById('journalInfoBtn').addEventListener('click', () => openTextArea('journalInfo'));
    document.getElementById('assessmentBtn').addEventListener('click', () => openTextArea('assessment'));
    document.getElementById('careNeedBtn').addEventListener('click', () => openTextArea('careNeed'));
    
    // Händelsehanterare för spara/stäng/export
    document.getElementById('saveBtn').addEventListener('click', saveText);
    document.getElementById('closeBtn').addEventListener('click', closeTextArea);
    document.getElementById('exportBtn').addEventListener('click', exportToPDF);
    
    // Funktioner
    function openTextArea(sectionId) {
        currentSectionTitle.textContent = sectionTitles[sectionId];
        currentTextArea.value = textData[sectionId];
        currentTextArea.dataset.currentSection = sectionId;
        textAreaContainer.classList.remove('hidden');
        currentTextArea.focus();
    }
    
    function saveText() {
        const currentSection = currentTextArea.dataset.currentSection;
        textData[currentSection] = currentTextArea.value;
        showStatus('Ändringarna har sparats', 'success');
    }
    
    function closeTextArea() {
        textAreaContainer.classList.add('hidden');
        statusMessage.classList.add('hidden');
    }
    
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = type;
        statusMessage.classList.remove('hidden');
        setTimeout(() => statusMessage.classList.add('hidden'), 3000);
    }
    
    async function exportToPDF() {
        try {
            showStatus('Skapar PDF...', 'success');
            
            // Hämta PDF-mallen
            const pdfBytes = await fetch('intyg.pdf').then(res => res.arrayBuffer());
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
            const form = pdfDoc.getForm();
            
            // Fyll i ENDAST de 6 fälten
            for (const [sectionId, fieldName] of Object.entries(fieldMappings)) {
                try {
                    const field = form.getTextField(fieldName);
                    if (field) {
                        field.setText(textData[sectionId]);
                    }
                } catch (error) {
                    console.warn(`Kunde inte hitta fält ${fieldName}`);
                }
            }
            
            // Spara PDF
            const pdfBytesModified = await pdfDoc.save();
            const blob = new Blob([pdfBytesModified], { type: 'application/pdf' });
            saveAs(blob, 'vardintyg_fyllt.pdf');
            
            showStatus('PDF skapad!', 'success');
        } catch (error) {
            console.error('Exportfel:', error);
            showStatus('Misslyckades: ' + error.message, 'error');
        }
    }
});
