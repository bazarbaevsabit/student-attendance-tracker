// Конфигурация приложения
const CONFIG = {
    // Учетные данные администратора
    admin: {
        login: 'admin',
        password: '9671830Qw'
    },
    
    // Учетные данные менеджера
    manager: {
        login: 'manager',
        password: 'manager12'
    },
    
    // Пароль по умолчанию для всех старост
    defaultPassword: 'password123',
    
    // Количество дней для подсветки прогульщиков
    absentDaysThreshold: 2,
    
    // Группы, студенты и старосты
    groups: [
        {
            id: 'ATP231',
            name: 'АТП-231',
            starosta: {
                name: 'ЕФИМОВ Игорь Вадимович',
                login: 'efimov'
            },
            students: [
                { id: 's1', name: 'ИВАНОВ Вячеслав Сергеевич' }
            ]
        },
        {
            id: 'ATP232',
            name: 'АТП-232',
            starosta: {
                name: 'КАЗАРЕЗОВ Кирилл Евгеньевич',
                login: 'kazarezov'
            },
            students: [
                { id: 's1', name: 'КУЗНЕЦОВ Даниил Павлович' },
                { id: 's2', name: 'СТРУНЯШЕВ Роман Игоревич' },
                { id: 's3', name: 'СУГЛОБОВ Александр Сергеевич' }
            ]
        },
        {
            id: 'ATP241',
            name: 'АТП-241',
            starosta: {
                name: 'КОРНЕЙЧУК Егор Евгеньевич',
                login: 'korneichuk'
            },
            students: [
                { id: 's1', name: 'АГУРЕЕВ Андрей Викторович' },
                { id: 's2', name: 'КИБКЕ Артём Евгеньевич' }
            ]
        },
        {
            id: 'ATP242',
            name: 'АТП-242',
            starosta: {
                name: 'ЖАМИЛЕВ Эльдар Русланович',
                login: 'jamilev'
            },
            students: [
                { id: 's1', name: 'МИКРЮКОВ Никита Дмитриевич' },
                { id: 's2', name: 'УВАРОВ Константин Васильевич' }
            ]
        },
        {
            id: 'ATP243',
            name: 'АТП-243',
            starosta: {
                name: 'ДЕМИНА Ангелина Юрьевна',
                login: 'demina'
            },
            students: [
                { id: 's1', name: 'СОСНОВСКИЙ Данил Витальевич' }
            ]
        },
        {
            id: 'ATP251',
            name: 'АТП-251',
            starosta: {
                name: 'КУЧЕРЕНКО Арсений Евгеньевич',
                login: 'kucherenko'
            },
            students: [
                { id: 's1', name: 'ВЛАДИМИРОВ Давыд Дмитриевич' },
                { id: 's2', name: 'КАРЕПАНОВ Егор Андреевич' },
                { id: 's3', name: 'САРТАКОВ Артём Александрович' }
            ]
        },
        {
            id: 'ATP252',
            name: 'АТП-252',
            starosta: {
                name: 'ЕМЕЛЬЯНОВА Анастасия Эдуардовна',
                login: 'emeliyanova'
            },
            students: [
                { id: 's1', name: 'ПОРТНОЙ Станислав' }
            ]
        },
        {
            id: 'ATP262',
            name: 'АТП-262',
            starosta: {
                name: 'СМИРНОВА Дарья Юрьевна',
                login: 'smirnova'
            },
            students: [
                { id: 's1', name: 'ЗАЙЦЕВ Ярослав' },
                { id: 's2', name: 'ЛЕГКОСТУПОВ Артур' },
                { id: 's3', name: 'САДОВСКИЙ Сергей Сергеевич' }
            ]
        },
        {
            id: 'ATPm251',
            name: 'АТПм-251',
            starosta: {
                name: 'ЛАХТИК Владимир Александрович',
                login: 'lahtik'
            },
            students: [
                { id: 's1', name: 'СПИРИДОНОВ Дэниел Сергеевич' }
            ]
        },
        {
            id: 'ATPm261',
            name: 'АТПм-261',
            starosta: {
                name: 'starosta',
                login: 'starosta'
            },
            students: [
                { id: 's1', name: 'АБДРАХМАНОВ Илья Сергеевич' }
            ]
        },
        {
            id: 'MR261',
            name: 'МР-261',
            starosta: {
                name: 'ДЕРЕВЯННЫХ Матвей Степанович',
                login: 'derevyannykh'
            },
            students: [
                { id: 's1', name: 'ГРОШИКОВ Илья' },
                { id: 's2', name: 'КИРЕЕВ Сергей' },
                { id: 's3', name: 'ЛЕОНОВ Роман Александрович' }
            ]
        },
        {
            id: 'UTS251t',
            name: 'УТС-251т',
            starosta: {
                name: 'СТРИЖНЕВ Олег Вячеславович',
                login: 'strizhnev'
            },
            students: [
                { id: 's1', name: 'АХМЕРОВ Артур' },
                { id: 's2', name: 'КУЗНЕЦОВ Денис' }
            ]
        },
        {
            id: 'UTS261',
            name: 'УТС-261',
            starosta: {
                name: 'ВЛАСОВА Анастасия Ивановна',
                login: 'vlasova'
            },
            students: [
                { id: 's1', name: 'СИЛИН Максим Юрьевич' }
            ]
        }
    ]
};
