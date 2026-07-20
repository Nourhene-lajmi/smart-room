import { auth, db } from '../../config/firebase-config.js';
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

document.addEventListener('DOMContentLoaded', () => {

    // 1. Authentification Firebase (chemin exact)
    onAuthStateChanged(auth, (user) => {
        if (user) {
            console.log("Connecté en tant que :", user.email);
        }
    });

    // 2. Horloge en temps réel
    function updateClock() {
        const clockEl = document.getElementById('clock');
        if (clockEl) {
            const now = new Date();
            clockEl.textContent = now.toLocaleTimeString('fr-FR');
        }
    }
    setInterval(updateClock, 1000);
    updateClock();

    // 3. Titre de la Salle
    const salleTitre = document.getElementById('salle-titre');
    if (salleTitre) {
        salleTitre.textContent = 'Salle de réunion';
    }

    // 4. Jauges (Format exact compatible project.css)
    const gaugesGrid = document.getElementById('gauges-grid');
    if (gaugesGrid) {
        const sensors = [
            { 
                label: 'TEMPÉRATURE', 
                value: '0.0', 
                unit: '°C', 
                icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 4v10.54a4 4 0 1 1-4 0V4a2 2 0 0 1 4 0Z"/></svg>' 
            },
            { 
                label: 'CO2', 
                value: '0', 
                unit: 'ppm', 
                icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 9h8"/><path d="M8 15h8"/></svg>' 
            },
            { 
                label: 'HUMIDITÉ', 
                value: '0.0', 
                unit: '%', 
                icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7Z"/></svg>' 
            },
            { 
                label: 'LUMINOSITÉ', 
                value: '0.0', 
                unit: 'Lux', 
                icon: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>' 
            }
        ];

        gaugesGrid.innerHTML = sensors.map(s => `
            <div class="gauge-tile">
                <div class="gauge-col">
                    <svg viewBox="0 0 100 60" width="100" height="60">
                        <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="#1A2B3C" stroke-width="6" stroke-linecap="round"/>
                        <circle cx="10" cy="50" r="3" fill="#E05A5A"/>
                        <circle cx="90" cy="50" r="3" fill="#E05A5A"/>
                        <text x="50" y="38" text-anchor="middle" font-size="14" font-weight="700" fill="#1A2B3C">${s.value}</text>
                        <text x="50" y="48" text-anchor="middle" font-size="8" fill="#8A9BA8">${s.unit}</text>
                    </svg>
                    <div class="gauge-label-row">
                        ${s.icon}
                        <span>${s.label}</span>
                    </div>
                    <span class="gauge-badge" style="background: #F0555B22; color: #E05A5A;">CRITIQUE</span>
                </div>
            </div>
        `).join('');
    }

    // 5. Actionneurs (Format exact compatible project.css)
    const actionneursGrid = document.getElementById('actionneurs-grid');
    if (actionneursGrid) {
        const actionneurs = [
            { 
                name: 'Ventilation', 
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5A6A" stroke-width="2"><path d="M12 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M12 12A8 8 0 0 0 4 6"/><path d="M12 12a8 8 0 0 0 8 6"/><path d="M12 12a8 8 0 0 0-8 6"/></svg>' 
            },
            { 
                name: 'Climatisation', 
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5A6A" stroke-width="2"><line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="4.93" y1="4.93" x2="19.07" y2="19.07"/><line x1="19.07" y1="4.93" x2="4.93" y2="19.07"/></svg>' 
            },
            { 
                name: 'Éclairage', 
                icon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4A5A6A" stroke-width="2"><path d="M9 18h6"/><path d="M10 22h4"/><path d="M15 14c.2-.8.8-1.4 1.5-2 1.2-1 1.9-2.4 1.5-4.1-.4-1.9-2-3.4-3.9-3.7-2.6-.4-4.9 1.4-5.1 3.8-.1 1.2.4 2.3 1.2 3.1.8.8 1.1 1.3 1.3 2.1"/></svg>' 
            }
        ];

        actionneursGrid.innerHTML = actionneurs.map(act => `
            <div class="actionneur-card">
                <div class="actionneur-left">
                    <div class="actionneur-icon">
                        ${act.icon}
                    </div>
                    <div>
                        <div class="actionneur-title">${act.name}</div>
                        <div class="actionneur-mode">AUTO</div>
                    </div>
                </div>
                <div class="actionneur-controls">
                    <button class="btn-toggle off active">OFF</button>
                    <button class="btn-toggle on">ON</button>
                </div>
            </div>
        `).join('');
    }

});