// Переопределяем функцию renderSlots
async function renderSlots() {
    const wrapper = document.getElementById('slotsWrapper');
    const sundayWrapper = document.getElementById('sundayWrapper');
    const fieldsContainer = document.getElementById('bookingFieldsContainer');
    const dateInput = document.getElementById('bookingDate').value;
    
    if (!dateInput) return;

    const d = new Date(dateInput);
    const day = d.getDay(); // 0-Вс, 1-Пн, 2-Вт, 3-Ср, 4-Чт, 5-Пт, 6-Сб

    // --- ЛОГИКА РАСПИСАНИЯ ---
    let defaultTimes = [];
    let infoMessage = "";

    if (selectedRouteType === 'turan-atyrau') {
        // Атырау в субботу: 13:00, 16:00, 18:00 (10:00 убрано для отдыха инструктора)
        defaultTimes = (day === 6) ? ['13:00', '16:00', '18:00'] : ['10:00', '13:00', '16:00', '18:00'];
    } else {
        // Акорда: Только суббота и только 06:00
        if (day !== 6) {
            infoMessage = `
                <div style="background: rgba(245, 158, 11, 0.05); border: 1px solid var(--accent-yellow); padding: 20px; border-radius: 16px; text-align: center; color: var(--text-main);">
                    <h3 style="color: var(--accent-yellow); margin-top: 0;">Утренние сплавы</h3>
                    <p>Наш фирменный утренний сплав — это эксклюзивный маршрут, который проводится <strong>только по субботам</strong>.</p>
                    <p style="font-size: 14px; color: var(--text-muted);">Мы придерживаемся строгого графика, чтобы обеспечить максимальное качество сервиса и безопасность каждого участника.</p>
                </div>`;
        } else {
            defaultTimes = ['06:00'];
        }
    }

    // Если есть информационное сообщение (для Акорды в будни)
    if (infoMessage) {
        wrapper.innerHTML = infoMessage;
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
    wrapper.innerHTML = '<div style="grid-column: 1/-1; text-align:center; color:#94a3b8; padding:10px;">Загрузка расписания...</div>';
    
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
