// Переопределяем функцию renderSlots
async function renderSlots() {
    const wrapper = document.getElementById('slotsWrapper');
    const sundayWrapper = document.getElementById('sundayWrapper');
    const fieldsContainer = document.getElementById('bookingFieldsContainer');
    const dateInput = document.getElementById('bookingDate').value;
    
    if (!dateInput) return;

    const d = new Date(dateInput);
    const day = d.getDay(); // 0-Вс, 1-Пн, 2-Вт, 3-Ср, 4-Чт, 5-Пт, 6-Сб

    // Логика расписания
    let defaultTimes = [];
    let errorMessage = "";

    if (selectedRouteType === 'turan-atyrau') {
        if (day === 6) { 
            errorMessage = "Маршрут Атырау недоступен в субботу.";
        } else {
            defaultTimes = ['10:00', '13:00', '16:00', '18:00'];
        }
    } else {
        // Акорда
        if (day !== 6) {
            errorMessage = "Утренние сплавы (Акорда) проводятся ТОЛЬКО в субботу.";
        } else {
            defaultTimes = ['06:00', '13:00', '16:00', '18:00'];
        }
    }

    // Если есть ошибка (попытка выбрать не то время или не тот день)
    if (errorMessage) {
        wrapper.innerHTML = `<div style="color:#f59e0b; text-align:center; padding:20px; border:1px solid #f59e0b; border-radius:10px;">${errorMessage}</div>`;
        return;
    }

    // Воскресенье
    if (day === 0) {
        if (typeof showClosedScreen === 'function') {
            showClosedScreen(fieldsContainer, document.getElementById('redirectNotice'), sundayWrapper, document.getElementById('submitBtn'), 'Воскресенье: выходной', 'В этот день у нас загородный сап-тур!', true);
        }
        return;
    }

    // Загрузка данных
    wrapper.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:#94a3b8; padding:10px;">Загрузка...</div>';
    
    let bookings = [];
    let blocks = [];
    try {
        const headers = { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}`, 'Content-Type': 'application/json' };
        const [resBookings, resBlocks] = await Promise.all([
            fetch(`${BASE_SUPABASE_URL}/bookings?booking_date=eq.${dateInput}`, { method: 'GET', headers }),
            fetch(`${BASE_SUPABASE_URL}/blocked_slots?block_date=eq.${dateInput}`, { method: 'GET', headers })
        ]);
        if (resBookings.ok) bookings = await resBookings.json();
        if (resBlocks.ok) blocks = await resBlocks.json();
    } catch (e) { console.error(e); }

    fieldsContainer.style.display = 'block';
    wrapper.innerHTML = '';
    
    defaultTimes.forEach(time => {
        const isSlotBlocked = blocks.some(b => b.slot_time === time);
        if (isSlotBlocked) return; 

        const booked = bookings.filter(b => b.booking_time === time).reduce((sum, b) => sum + b.spots_count, 0);
        const left = 6 - booked;
        
        const btn = document.createElement('div');
        btn.className = 'slot-btn' + (time === selectedTime ? ' active' : '');
        btn.innerHTML = `<strong>${time}</strong><span class="info-spots">${left > 0 ? 'Свободно: '+left : 'Мест нет'}</span>`;
        
        if (left <= 0) {
            btn.className = 'slot-btn disabled';
        } else {
            btn.onclick = function() {
                document.querySelectorAll('.slot-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                selectedTime = time;
                const select = document.getElementById('spotsCount');
                select.innerHTML = '';
                for (let i = 1; i <= left; i++) {
                    const opt = document.createElement('option');
                    opt.value = i; opt.textContent = `${i} чел.`;
                    select.appendChild(opt);
                }
            };
        }
        wrapper.appendChild(btn);
    });
}
