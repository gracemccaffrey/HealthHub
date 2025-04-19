
  let map;
  function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
      center: { lat: 39.9612, lng: -82.9988 },
      zoom: 12,
    });
  
    const infoContainer = document.getElementById("provider-info");
  
    providers.forEach((provider) => {
      const marker = new google.maps.Marker({
        position: provider.position,
        map,
        title: provider.name
      });
  
      const section = document.createElement("section");
      section.className = "expandable-section";
  
      section.innerHTML = `
        <div class="expandable-header">
          <h3 class="expandable-title">${provider.name}</h3>
          <span class="expandable-toggle">+</span>
        </div>
        <div class="expandable-content">
          <div class="definition-container">
            <span class="definition-label">Address:</span>
            <span class="definition-text">${provider.address}</span>
          </div>
          <div class="definition-container">
            <span class="definition-label">Phone:</span>
            <span class="definition-text">${provider.phone}</span>
          </div>
          <div class="definition-container">
            <span class="definition-label">Services:</span>
            <span class="definition-text">${provider.services}</span>
          </div>
        </div>
      `;
  
      marker.addListener("click", () => {
        const toggle = section.querySelector(".expandable-toggle");
        const content = section.querySelector(".expandable-content");
  
        section.classList.add("expanded");
        toggle.textContent = '−';
        content.style.display = 'block';
  
        section.scrollIntoView({ behavior: "smooth", block: "center" });
      });
  
      infoContainer.appendChild(section);
    });
  }
  
  function searchLocation(inputId) {
    const address = document.getElementById(inputId).value;
    if (!address) return;
  
    const geocoder = new google.maps.Geocoder();
  
    geocoder.geocode({ address: address }, function (results, status) {
      if (status === "OK") {
        const location = results[0].geometry.location;
        map.setCenter(location);
        map.setZoom(13);
      } else {
        alert("Location not found: " + status);
      }
    });
  }
  