async function renderSlots() {
    const wrapper = document.getElementById('slotsWrapper');
    const sundayWrapper = document.getElementById('sundayWrapper');
    const fieldsContainer = document.getElementById('bookingFieldsContainer');
    const dateInput = document.getElementById('bookingDate').value;
    const submitBtn = document.getElementById('submitBtn');
    
    if (!dateInput) return;

    const d = new Date(dateInput);
    const day = d.getDay(); 

    // 1. ОПРЕДЕЛЯЕМ БАЗОВЫЕ ВРЕМЕНА
    let defaultTimes = [];
    let infoMessage = "";

    if (selectedRouteType === 'turan-atyrau') {
        defaultTimes = ['10:00', '13:00', '16:00', '18:00'];
        // ЖЕСТКАЯ БЛОКИРОВКА: если суббота, убираем 10:00
        if (day === 6) {
            defaultTimes = defaultTimes.filter(time => time !== '10:00');
        }
    } else {
        if (day !== 6) {
            infoMessage = `
                <div style="background: rgba(245, 158, 11, 0.05); border: 1px solid #f59e0b; padding: 20px; border-radius: 16px; text-align: center; color: #fff;">
                    <h3 style="color: #f59e0b; margin-top: 0;">Эксклюзивные утренние сплавы</h3>
                    <p>Наш утренний маршрут проводится <strong>только по субботам</strong>.</p>
                    <p style="font-size: 14px; color: #94a3b8;">Мы придерживаемся строгого графика для обеспечения высокого качества сервиса и вашей безопасности.</p>
                </div>`;
        } else {
            defaultTimes = ['06:00'];
        }
    }

    // 2. ОБРАБОТКА ВОСКРЕСЕНЬЯ И ОШИБОК
    if (day === 0) {
        if (typeof showClosedScreen === 'function') {
            showClosedScreen(fieldsContainer, document.getElementById('redirectNotice'), sundayWrapper, submitBtn, 'Воскресенье: выходной', 'В этот день у нас загородный сап-тур!', true);
        }
        return;
    }
    
    if (infoMessage) {
        wrapper.innerHTML = infoMessage;
        if(fieldsContainer) fieldsContainer.style.display = 'none';
        return;
    }

    // 3. ЗАГРУЗКА ДАННЫХ ИЗ SUPABASE
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

    if(fieldsContainer) fieldsContainer.style.display = 'block';
    wrapper.innerHTML = '';
    
    // 4. ФИНАЛЬНАЯ ОТРИСОВКА КНОПОК
    defaultTimes.forEach(time => {
        // Дополнительная проверка: если всё же проскочило 10:00 в субботу - пропускаем
        if (day === 6 && time === '10:00') return;

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
                if(select) {
                    select.innerHTML = '';
                    for (let i = 1; i <= left; i++) {
                        const opt = document.createElement('option');
                        opt.value = i; opt.textContent = `${i} чел.`;
                        select.appendChild(opt);
                    }
                }
            };
        }
        wrapper.appendChild(btn);
    });
}
