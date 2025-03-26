// Lagra textdata
const textData = {
    observations: '',
    patientInfo: '',
    otherInfo: '',
    journalInfo: '',
    assessment: '',
    careNeed: ''
};

// Mappning mellan fält-ID:n och PDF-fältnamn
const fieldMappings = {
    observations: 'Iakttagelser vid undersökningen',
    patientInfo: 'Uppgifter från patienten själv',
    otherInfo: 'Information från andra personer än patienten',
    journalInfo: 'Uppgifter från patientens journal',
    assessment: 'Bedömning av patientens allvarliga psykiska störning',
    careNeed: 'Bedömning av patientens vårdbehov'
};

// Mappning mellan fält-ID:n och visningsnamn
const sectionTitles = {
    observations: '1. Iakttagelser vid undersökningen',
    patientInfo: '2. Uppgifter från patienten själv',
    otherInfo: '3. Information från andra personer',
    journalInfo: '4. Uppgifter från journal',
    assessment: '5. Bedömning av psykisk störning',
    careNeed: '6. Bedömning av vårdbehov'
};

// Initiera appen när DOM är laddad
document.addEventListener('DOMContentLoaded', () => {
    // Hämta element
    const textAreaContainer = document.getElementById('textAreaContainer');
    const currentTextArea = document.getElementById('currentTextArea');
    const currentSectionTitle = document.getElementById('currentSectionTitle');
    const statusMessage = document.getElementById('statusMessage');
    
    // Lägg till händelsehanterare för knapparna
    document.getElementById('observationsBtn').addEventListener('click', () => openTextArea('observations'));
    document.getElementById('patientInfoBtn').addEventListener('click', () => openTextArea('patientInfo'));
    document.getElementById('otherInfoBtn').addEventListener('click', () => openTextArea('otherInfo'));
    document.getElementById('journalInfoBtn').addEventListener('click', () => openTextArea('journalInfo'));
    document.getElementById('assessmentBtn').addEventListener('click', () => openTextArea('assessment'));
    document.getElementById('careNeedBtn').addEventListener('click', () => openTextArea('careNeed'));
    
    document.getElementById('saveBtn').addEventListener('click', saveText);
    document.getElementById('closeBtn').addEventListener('click', closeTextArea);
    document.getElementById('exportBtn').addEventListener('click', exportToPDF);
    
    // Funktion för att öppna textområde
    function openTextArea(sectionId) {
        currentSectionTitle.textContent = sectionTitles[sectionId];
        currentTextArea.value = textData[sectionId];
        currentTextArea.dataset.currentSection = sectionId;
        textAreaContainer.classList.remove('hidden');
        currentTextArea.focus();
    }
    
    // Funktion för att spara text
    function saveText() {
        const currentSection = currentTextArea.dataset.currentSection;
        textData[currentSection] = currentTextArea.value;
        showStatus('Ändringarna har sparats', 'success');
    }
    
    // Funktion för att stänga textområde
    function closeTextArea() {
        textAreaContainer.classList.add('hidden');
        statusMessage.classList.add('hidden');
    }
    
    // Funktion för att visa statusmeddelande
    function showStatus(message, type) {
        statusMessage.textContent = message;
        statusMessage.className = type;
        statusMessage.classList.remove('hidden');
        setTimeout(() => statusMessage.classList.add('hidden'), 3000);
    }
    
    // Funktion för att exportera till PDF
    async function exportToPDF() {
        try {
            showStatus('Skapar PDF...', 'success');
            
            // Hämta PDF-mallen (anpassa sökvägen om nödvändigt)
            const pdfBytes = await fetch('intyg.pdf').then(res => res.arrayBuffer());
            const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
            const form = pdfDoc.getForm();
            
            // Fyll i PDF-fälten
            for (const [sectionId, fieldName] of Object.entries(fieldMappings)) {
                try {
                    const field = form.getTextField(fieldName);
                    if (field) {
                        field.setText(textData[sectionId]);
                    }
                } catch (error) {
                    console.warn(`Kunde inte hitta fält ${fieldName} i PDF:en`);
                }
            }
            
            // Spara PDF
            const pdfBytesModified = await pdfDoc.save();
            const blob = new Blob([pdfBytesModified], { type: 'application/pdf' });
            saveAs(blob, 'vardintyg_fyllt.pdf');
            
            showStatus('PDF skapad och nedladdning startar', 'success');
        } catch (error) {
            console.error('Fel vid PDF-export:', error);
            showStatus('Ett fel uppstod vid export till PDF', 'error');
        }
    }
});