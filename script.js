// Date helper functions
function datePlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

function defaultInFromOut(outDateStr) {
  const d = new Date(outDateStr);
  d.setDate(d.getDate() + 8);
  return d.toISOString().split('T')[0];
}

// Track manual changes to inDate
let inDateManuallyChanged = false;

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const agent = urlParams.get('agent') || 'WY992';
const flight = urlParams.get('flight') || 'default';
const adcode = urlParams.get('adcode') || '';
const promotionCode = urlParams.get('promotionCode') || '';

// Detect language and set domain (French)
const pageLang = 'fr';
const basedomain = 'book.parkcare.fr';

// CDG is fixed for this page
const depart = 'CDG';

// Initialize map and dates
window.addEventListener('DOMContentLoaded', function() {
  // Initialize Leaflet map
  const parkingCoords = [49.042722, 2.505222]; // Hello Park Roissy
  const airportCoords = [49.009691, 2.547925]; // CDG Airport

  // Create map centered between both points
  const map = L.map('map').setView([49.026, 2.526], 12);

  // Add OpenStreetMap tiles
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
  }).addTo(map);

  // Custom icon for parking
  const parkingIcon = L.divIcon({
    html: '<div style="background: #37b4a9; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">P</div>',
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  // Custom icon for airport
  const airportIcon = L.divIcon({
    html: '<div style="background: #2563eb; color: white; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 18px; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">✈</div>',
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  // Add markers
  L.marker(parkingCoords, { icon: parkingIcon })
    .addTo(map)
    .bindPopup('<strong>Hello Park Roissy</strong><br>32 Avenue de la gare<br>95380 Louvres');

  L.marker(airportCoords, { icon: airportIcon })
    .addTo(map)
    .bindPopup('<strong>Aéroport CDG</strong><br>Paris Charles de Gaulle');

  // Draw a line between parking and airport
  const routeLine = L.polyline([parkingCoords, airportCoords], {
    color: '#37b4a9',
    weight: 3,
    opacity: 0.7,
    dashArray: '10, 10'
  }).addTo(map);

  // Fit map to show both markers with padding
  const bounds = L.latLngBounds([parkingCoords, airportCoords]);
  map.fitBounds(bounds, { padding: [50, 50] });

  // Initialize dates
  const outDateInput = document.getElementById('outDate');
  const inDateInput = document.getElementById('inDate');

  outDateInput.value = datePlus(1);
  inDateInput.value = datePlus(9);

  // Set minimum dates
  const today = new Date().toISOString().split('T')[0];
  outDateInput.min = today;
  inDateInput.min = outDateInput.value;

  // Track manual changes to inDate
  inDateInput.addEventListener('change', function() {
    inDateManuallyChanged = true;
  });

  // Recalculate inDate when outDate changes
  outDateInput.addEventListener('change', function() {
    const newOutDate = this.value;
    inDateInput.min = newOutDate;

    if (!inDateManuallyChanged) {
      inDateInput.value = defaultInFromOut(newOutDate);
    }

    if (new Date(inDateInput.value) < new Date(newOutDate)) {
      inDateInput.value = defaultInFromOut(newOutDate);
      inDateManuallyChanged = false;
    }
  });
});

// Form submission
document.getElementById('searchForm').addEventListener('submit', function(e) {
  e.preventDefault();

  const outDate = document.getElementById('outDate').value;
  const outTime = document.getElementById('outTime').value;
  const inDate = document.getElementById('inDate').value;
  const inTime = document.getElementById('inTime').value;
  const lang = pageLang;

  // URL-encode times
  const encodedOutTime = outTime.replace(':', '%3A');
  const encodedInTime = inTime.replace(':', '%3A');

  // Build search URL following ParkCare pattern
  const searchUrl = `https://${basedomain}/static/?selectProduct=cp&#/categories?agent=${agent}&ppts=&customer_ref=&lang=${lang}&adults=2&depart=${depart}&terminal=&arrive=&flight=${flight}&in=${inDate}&out=${outDate}&park_from=${encodedOutTime}&park_to=${encodedInTime}&filter_meetandgreet=&filter_parkandride=&children=0&infants=0&redirectReferal=carpark&from_categories=true&adcode=${adcode}&promotionCode=${promotionCode}`;

  // Redirect to search
  window.location.href = searchUrl;
});
