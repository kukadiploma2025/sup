// Логика расписания
    let defaultTimes = [];
    let errorMessage = "";

    if (selectedRouteType === 'turan-atyrau') {
        if (day === 6) { 
            errorMessage = "В субботу доступен только Утренний маршрут (Акорда).";
        } else {
            defaultTimes = ['10:00', '13:00', '16:00', '18:00'];
        }
    } else {
        // Акорда
        if (day !== 6) {
            errorMessage = "Утренние сплавы (Акорда) проводятся ТОЛЬКО в субботу.";
        } else {
            // В субботу для Акорды ОСТАВЛЯЕМ ТОЛЬКО 06:00
            defaultTimes = ['06:00'];
        }
    }
