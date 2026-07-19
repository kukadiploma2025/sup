const BASE_SUPABASE_URL = 'https://ununcobobksowzkvbypf.supabase.co/rest/v1';
const ANON_KEY = 'sb_publishable_G3mrUyo8-jeujpG_Cr56Ew_nHoYTxWN';
const SECRET_CODES = { 'УТРО6': '06:00', 'УТРО7': '07:00', 'УТРО8': '08:00', 'УТРО9': '09:00' };

let selectedRouteType = 'turan-atyrau';
let selectedTime = '';
let isSubmitting = false;

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    const today = new Date();
    document.getElementById('bookingDate').value = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    renderSlots();
});

async function renderSlots() {
    const wrapper = document.getElementById('slotsWrapper');
    const sundayWrapper = document.getElementById('sundayWrapper');
    const fieldsContainer = document.getElementById('bookingFieldsContainer');
    const dateInput = document.getElementById('bookingDate').value;
    const submitBtn = document.getElementById('submitBtn');
    const notice = document.getElementById('redirectNotice');

    // КРИТИЧЕСКАЯ ПРАВКА: Очищаем всё перед отрисовкой
    sundayWrapper.innerHTML = '';
    
    if (!dateInput) return;

    const dateParts = dateInput.split('-');
    const selectedDateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
    const dayOfWeek = selectedDateObj.getDay();

    if (dayOfWeek === 0) {
        showClosedScreen(fieldsContainer, notice, sundayWrapper, submitBtn, 'Воскресенье: запись на городской сплав невозможна', 'В этот день у нас проходит загородный сап-тур!', true);
        return;
    }

    // ... дальше весь твой остальной код логики получения данных из Supabase ...
    // Убедись, что после получения данных ты вызываешь fieldsContainer.style.display = 'block';
}

function showClosedScreen(fields, notice, sunWrapper, btn, title, desc, showInsta) {
    btn.disabled = true;
    fields.style.display = 'none';
    notice.style.display = 'none';
    // ... остальной код ...
}

// ... остальные твои функции (selectRoute, handleBooking и т.д.) ...
