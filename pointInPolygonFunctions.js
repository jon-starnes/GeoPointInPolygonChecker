// Fetch geoJson from OpenStreetMaps
async function fetchGeoJsonFromNominatim() {
    const url = 'https://nominatim.openstreetmap.org/search.php?q=San+Francisco&polygon_geojson=1&format=json';
    
    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
        const data = await response.json();
        if (data.length > 0) {
            const geoJson = data[0].geojson;
            console.log('San Francisco GeoJSON:', geoJson);
            return geoJson; // Return the raw GeoJSON object
        }
        return null;
    } catch (error) {
        console.error("Error fetching GeoJSON data:", error);
        return null;
    }
}


// Check x, y coordinates are inside polygon or multipolygon
class CheckPointInPolygon {
    // Check if a point is inside a Polygon or MultiPolygon
    isPointInsidePolygon(x, y, geoJson) {
        if (!geoJson || !geoJson.coordinates) return false;

        const geometry = geoJson;
        let isInside = false;

        if (geometry.type === "MultiPolygon") {
            // Handle MultiPolygon
            geometry.coordinates.forEach(polygonCoords => {
                const coords = polygonCoords[0];
                const cornersX = coords.map(coord => coord[0]);
                const cornersY = coords.map(coord => coord[1]);
                if (this.checkPointInPolygon(x, y, cornersX, cornersY)) {
                    isInside = true;
                }
            });
        } else if (geometry.type === "Polygon") {
            // Handle single Polygon
            const coords = geometry.coordinates[0];
            const cornersX = coords.map(coord => coord[0]);
            const cornersY = coords.map(coord => coord[1]);
            if (this.checkPointInPolygon(x, y, cornersX, cornersY)) {
                isInside = true;
            }
        }
        return isInside;
    }

    // Ray-casting algorithm for checking if a point is inside a polygon
    checkPointInPolygon(x, y, cornersX, cornersY) {
        let i, j = cornersX.length - 1;
        let oddNodes = false;
        const epsilon = 1e-10;

        for (i = 0; i < cornersX.length; i++) {
            if (Math.abs(cornersX[i] - x) < epsilon && Math.abs(cornersY[i] - y) < epsilon) {
                return true;
            }
            if (((cornersY[i] < y && cornersY[j] >= y) || (cornersY[j] < y && cornersY[i] >= y)) &&
                (cornersX[i] <= x || cornersX[j] <= x)) {
                const intersectionX = cornersX[i] + ((y - cornersY[i]) * (cornersX[j] - cornersX[i])) / (cornersY[j] - cornersY[i]);
                if (Math.abs(intersectionX - x) < epsilon) {
                    return true;
                }
                if (intersectionX < x) {
                    oddNodes = !oddNodes;
                }
            }
            j = i;
        }
        return oddNodes;
    }
}

// Function to call the point checker from front end
// Updated checkUserPoint function
async function checkUserPoint() {
    console.log("Button clicked, starting check...");

    const longitude = parseFloat(document.getElementById('longitude').value.trim());
    const latitude = parseFloat(document.getElementById('latitude').value.trim());
    const outputElement = document.getElementById('output');

    // Check if inputs are valid
    if (isNaN(longitude) || isNaN(latitude)) {
        console.log("Invalid coordinates entered.");
        outputElement.textContent = 'Please enter valid coordinates.';
        return;
    }

    console.log(`Longitude: ${longitude}, Latitude: ${latitude}`);
    outputElement.textContent = 'Checking coordinates...';

    // Fetch GeoJSON data
    try {
        const geoJsonData = await fetchGeoJsonFromNominatim();
        if (!geoJsonData) {
            console.error("Failed to fetch GeoJSON data.");
            outputElement.textContent = 'Failed to fetch GeoJSON data for San Francisco. Please try again later.';
            return;
        }

        console.log("GeoJSON data fetched successfully.");

        // Check if point is inside the polygon
        const checker = new CheckPointInPolygon();
        const isInside = checker.isPointInsidePolygon(longitude, latitude, geoJsonData);

        outputElement.textContent = isInside
            ? `Point (${longitude}, ${latitude}) is inside San Francisco.`
            : `Point (${longitude}, ${latitude}) is outside San Francisco.`;
    } catch (error) {
        console.error("Error during point check:", error);
        outputElement.textContent = 'An error occurred while checking the point.';
    }
}

