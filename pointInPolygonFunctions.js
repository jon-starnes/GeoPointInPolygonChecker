
export class checkPointInPolygon {
// the main function to run to check if a point is in a tribal territory polygon
    isPointInsidePolygon(x, y, geoObjects) {
        let trueFalse: boolean = false;

        // Check if geoObjects and its all method are defined
        if (geoObjects && typeof geoObjects.all) {
            const geoShapes = geoObjects;

            // Iterate over all geoShapes in the set
            geoObjects.all().forEach(terr => {
                // Access the geometry property
                const geoData: GeoShape | any = terr.geometry;

                if (geoData.type === "MultiPolygon") {
                    // Create the GeoJSON string from the geometry property
                    const geoJsonString = JSON.stringify(geoData);
                    // Parse the MultiPolygon geometry
                    const parsedPolygons = this.parseMultiPolygon(geoJsonString);

                    // Check if the point is inside any of the parsed polygons
                    parsedPolygons.forEach(polygon => {
                        const cornersX = polygon.map(coord => coord.x);
                        const cornersY = polygon.map(coord => coord.y);

                        if (this.checkPointInPolygon(x, y, cornersX, cornersY) === true) {
                            trueFalse = true;
                        }
                    });
                } else if (geoData.type === "Polygon") {
                    // If the geometry is a Polygon, use the parsePolygon function
                    const polygon = this.parsePolygon(JSON.stringify(terr.geometry));
                    const cornersX = polygon.map(coord => coord.x);
                    const cornersY = polygon.map(coord => coord.y);

                    if (this.checkPointInPolygon(x, y, cornersX, cornersY) === true) {
                        trueFalse = true;
                    }
                }
            });
        }
        return trueFalse;
    }

    // Main raycasting algorithm required by isPointInsidePolygon
    checkPointInPolygon(x, y, cornersX, cornersY) {
        let i: number, j: number = cornersX.length - 1;
        let oddNodes: boolean = false;
        const epsilon = 1e-10; // Small value to account for floating-point errors

        for (i = 0; i < cornersX.length; i++) {
            // Check if the point lies exactly on a vertex
            if (Math.abs(cornersX[i] - x) < epsilon && Math.abs(cornersY[i] - y) < epsilon) {
                return true; // Point is exactly on a vertex
            }
            // Adjusted condition to include points on the edge
            if (((cornersY[i] + epsilon < y && cornersY[j] + epsilon >= y) || (cornersY[j] + epsilon < y && cornersY[i] + epsilon >= y))) {
                const intersectionX = cornersX[i] + ((y - cornersY[i]) * (cornersX[j] - cornersX[i])) / (cornersY[j] - cornersY[i]);
                if (Math.abs(intersectionX - x) < epsilon) {
                    return true; // Point is exactly on the edge
                }
                if (intersectionX < x - epsilon) {
                    oddNodes = !oddNodes;
                }
            }
            j = i;
        }
        return oddNodes;
    }

    // Function to parse a single polygon in a geoJSON string
    parsePolygon(geoJson) {
        console.log(geoJson);
        const geoData = JSON.parse(geoJson);
        const polygon : { x: Double, y: Double }[] = []

      // iterate over geoData to get the coordinates in the linearRings
        for (let i = 0; i < geoData.linearRings[0].length; i++) {
            polygon.push( {x: geoData.linearRings[0][i].coordinates.longitude, y: geoData.linearRings[0][i].coordinates.latitude} )
        }
        // console.log(polygon);
        return polygon;
    }


    // Function to parse MultiPolygons in a geoJSON string
    parseMultiPolygon(geoJson) {
        let geoData: 
          try {
            geoData = JSON.parse(geoJson);
          } catch error() {
            console.error("Invalid geoJSON", error);
            return [];
          }

        const multiPolygon: { x: number, y: number }[][] = [];

        // Is geoData standard MultiPolygon format?
        if (geoData.type === "MultiPolygon" && Array.isArray(geoData.coordinates)) {
            // Loop through each polygon in the MultiPolygon
            for (const polygon of geoData.coordinates) {
                const linearRings: { x: number, y: number }[] = [];
                // loop through linear rings inside the polygon
                for (const ring of polygon) {
                    for (const coord of ring) {
                        linearRings.push({ x: coord[0], y: coord[1] });
                    }
                }
                multiPolygon.push(linearRings);
            }
        } 
        // Check if the data parses like geometry data with polygons and linearRings
        else if (geoData.polygons) {
            for (const polygon of geoData.polygons) {
                const linearRings: { x: number, y: number }[] = [];
                for (const ring of polygon.linearRings) {
                    for (const point of ring) {
                        linearRings.push({
                            x: point.coordinates.longitude,
                            y: point.coordinates.latitude,
                        });
                    }
                }
                multiPolygon.push(linearRings);
            }
        } else {
            console.error("Invalid MultiPolygon structure:", geoData);
        }
        // console.log(multiPolygon);
        return multiPolygon;
    }
}
