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

// Initialize dates
window.addEventListener('DOMContentLoaded', function() {
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
